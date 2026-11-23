"""Run real local recognition probes and verify their sanitized logs through Loki/Grafana.

Standard-library Python only. Does not save diary data or change the model.
"""
import argparse
import base64
import csv
import hashlib
import json
import os
import re
import struct
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import zlib
from datetime import datetime, timezone
from pathlib import Path

MONITORING = Path(__file__).resolve().parent
REPO = MONITORING.parent


def http(url, body=None, headers=None):
    req = urllib.request.Request(url, data=body, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            status, raw = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, raw = error.code, error.read()
    try:
        data = json.loads(raw)
    except ValueError:
        data = raw.decode('utf-8', 'replace')
    return status, data


def multipart(content, filename, mime, policy=None):
    boundary = 'healthpal-monitoring-' + uuid.uuid4().hex
    raw = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\n'
           f'Content-Type: {mime}\r\n\r\n').encode() + content + b'\r\n'
    if policy:
        raw += (f'--{boundary}\r\nContent-Disposition: form-data; name="policy"\r\n\r\n{policy}\r\n').encode()
    return raw + f'--{boundary}--\r\n'.encode(), f'multipart/form-data; boundary={boundary}'


def oversized_pixel_png():
    # Valid, tiny-on-disk 20,005,000-pixel image. AI's declared limit is 20 MP.
    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!IIBBBBB', 5000, 4001, 1, 0, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress((b'\x00' + b'\xff' * 625) * 4001)) + chunk(b'IEND', b''))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--token-file', type=Path, default=REPO / 'performance/k6/auth.local.env')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    token = os.environ.get('HP_TOKEN', '').strip()
    if not token and args.token_file.is_file():
        match = re.search(r'^HP_TOKEN=(.*)$', args.token_file.read_text(encoding='utf-8-sig'), re.M)
        token = match.group(1).strip().strip('\"\'') if match else ''
    token = re.sub(r'^Bearer\s+', '', token, flags=re.I)
    assert token, 'Supply a fresh User HP_TOKEN or --token-file; never put the token in command arguments.'
    auth = {'Authorization': 'Bearer ' + token}
    started = time.time()
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    prefix = 'hp-mon-' + stamp
    out = args.output.resolve() / stamp
    out.mkdir(parents=True, exist_ok=False)

    def save(name, data):
        (out / name).write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')

    status, _ = http('http://127.0.0.1:3001/users/me', headers=auth)
    assert status == 200, f'Authenticated profile probe returned HTTP {status}.'
    health = {}
    for name, url in {'ai': 'http://127.0.0.1:8001/health/ready', 'loki': 'http://127.0.0.1:3100/ready',
                      'alloy': 'http://127.0.0.1:12345/-/ready', 'grafana': 'http://127.0.0.1:3000/api/health'}.items():
        status, data = http(url)
        health[name] = {'status': status, 'data': data}
        assert status == 200, f'{name} is not ready: HTTP {status}.'
    save('service-health.json', health)
    print('Authenticated backend and four service health checks passed.', flush=True)

    workload = json.loads((REPO / 'performance/k6/workload.json').read_text(encoding='utf-8'))
    probes = []

    def send(identifier, content, filename, mime='image/jpeg', policy='P1', endpoint='recognize', authenticated=True, expected=200):
        request_id = prefix + '-' + identifier
        raw, content_type = multipart(content, filename, mime, policy if endpoint == 'recognize' else None)
        headers = {'Content-Type': content_type, 'X-Request-ID': request_id}
        if authenticated:
            headers.update(auth)
        before = time.perf_counter()
        status, data = http('http://127.0.0.1:3001/food-vision/' + endpoint, raw, headers)
        row = {'request_id': request_id, 'endpoint': endpoint, 'policy': policy if endpoint == 'recognize' else 'all',
               'http_status': status, 'expected_http_status': expected, 'client_round_trip_ms': round((time.perf_counter() - before) * 1000, 3),
               'status': '', 'reason': '', 'expected_forward_log': authenticated}
        if status == 200:
            d = data['data']
            assert d['request_id'] == request_id and d['model_sha256'] == workload['release']['model_sha256']
            assert d['policy_version'] == workload['release']['policy_version']
            row.update(status=d.get('status', 'comparison'), reason=d.get('reason', ''),
                       processing_ms=d['processing_ms'], brightened_passes=d['brightened_inference_passes'])
        else:
            row['reason'] = data.get('code', '') if isinstance(data, dict) else ''
        probes.append(row)
        save('recognition-probes.json', probes)
        assert status == expected, f'{identifier}: expected {expected}, received {status}.'
        print(f'{identifier}: HTTP {status}', flush=True)

    for policy in ['P0', 'P1', 'P2']:
        for image in workload['images']:
            path = REPO / 'performance/k6' / image['relative_path']
            content = path.read_bytes()
            assert hashlib.sha256(content).hexdigest() == image['sha256']
            send(policy.lower() + '-' + image['id'].lower(), content, image['filename'], policy=policy)
    first = workload['images'][0]
    content = (REPO / 'performance/k6' / first['relative_path']).read_bytes()
    send('compare', content, first['filename'], endpoint='compare')
    send('pixel-limit', oversized_pixel_png(), 'synthetic-over-20mp.png', mime='image/png', expected=413)
    send('missing-token', content, first['filename'], authenticated=False, expected=401)

    expected_ids = {r['request_id'] for r in probes if r['expected_forward_log']}
    selector = '{job="healthpal-recognition"} |= "' + prefix + '"'
    params = {'query': selector, 'start': str(int((started - 15) * 1e9)), 'limit': '1000', 'direction': 'forward'}
    deadline = time.monotonic() + 60
    while True:
        params['end'] = str(time.time_ns())
        status, payload = http('http://127.0.0.1:3100/loki/api/v1/query_range?' + urllib.parse.urlencode(params))
        assert status == 200, f'Loki query returned HTTP {status}.'
        events = [dict(json.loads(line), loki_timestamp_ns=ns, labels=s['stream'])
                  for s in payload['data']['result'] for ns, line in s['values']]
        found = {e['request_id'] for e in events}
        if expected_ids <= found:
            break
        if time.monotonic() >= deadline:
            save('loki-incomplete.json', payload)
            raise AssertionError(f'Only {len(expected_ids & found)}/{len(expected_ids)} forwarding IDs reached Loki.')
        time.sleep(1)
    assert found == expected_ids and len(events) == len(expected_ids), 'Unexpected or duplicate run events.'
    assert all('request_id' not in e['labels'] for e in events), 'Request IDs must not be stream labels.'
    allowed = {'event', 'request_id', 'endpoint', 'upstream_status', 'transport_code', 'elapsed_ms', 'loki_timestamp_ns', 'labels'}
    assert all(set(e) <= allowed for e in events), 'Unexpected exported log fields.'
    by_id = {e['request_id']: e for e in events}
    for row in probes:
        if row['expected_forward_log']:
            event = by_id[row['request_id']]
            row['backend_to_ai_ms'] = event['elapsed_ms']
            assert event['event'] == ('food_recognition' if row['http_status'] == 200 else 'food_recognition_failed')
            assert event['upstream_status'] == str(row['http_status'])
    save('loki-forwarding-events.json', payload)
    save('recognition-probes.json', probes)

    # Check Grafana's own data-source path, not just direct Loki connectivity.
    secret = (MONITORING / '.grafana-admin-password.local').read_text(encoding='utf-8').strip()
    grafana_auth = {'Authorization': 'Basic ' + base64.b64encode(('healthpaladmin:' + secret).encode()).decode()}
    status, datasource = http('http://127.0.0.1:3000/api/datasources/uid/healthpal-loki/health', headers=grafana_auth)
    assert status == 200 and datasource.get('status') == 'OK', f'Grafana datasource health failed: {status}.'
    save('grafana-datasource-health.json', datasource)
    status, dashboard = http('http://127.0.0.1:3000/api/dashboards/uid/healthpal-recognition')
    assert status == 200 and len(dashboard['dashboard']['panels']) == 8
    save('grafana-dashboard.json', dashboard)
    status, proxy = http('http://127.0.0.1:3000/api/datasources/proxy/uid/healthpal-loki/loki/api/v1/query_range?'
                         + urllib.parse.urlencode(params))
    assert status == 200
    proxy_ids = {json.loads(line)['request_id'] for s in proxy['data']['result'] for _, line in s['values']}
    assert proxy_ids == expected_ids, 'Grafana proxy did not return the matching request logs.'
    save('grafana-proxy-logs.json', proxy)
    checks = []
    for panel in dashboard['dashboard']['panels']:
        expr = panel['targets'][0]['expr'].replace('$__range', '30m').replace('$request_id', prefix)
        status, result = http('http://127.0.0.1:3100/loki/api/v1/query?' + urllib.parse.urlencode({'query': expr}))
        assert status == 200 and result.get('status') == 'success', f'Panel {panel["id"]} query failed.'
        checks.append({'panel_id': panel['id'], 'title': panel['title'], 'query': expr, 'result': result})
    save('dashboard-query-results.json', checks)
    fields = sorted({key for r in probes for key in r})
    with (out / 'recognition-probes.csv').open('w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(probes)
    summary = {'status': 'passed', 'started_at_utc': datetime.fromtimestamp(started, timezone.utc).isoformat(),
               'finished_at_utc': datetime.now(timezone.utc).isoformat(), 'request_id_prefix': prefix,
               'scope': 'Live authenticated local monitoring verification, not a new load/accuracy test.',
               'api_probes': len(probes), 'http_200': sum(r['http_status'] == 200 for r in probes),
               'expected_pixel_limit_413': 1, 'expected_missing_token_401': 1,
               'forwarding_logs_expected': len(expected_ids), 'forwarding_logs_matched': len(events),
               'grafana_datasource_ok': True, 'grafana_log_correlation_ok': True, 'dashboard_queries_ok': len(checks),
               'output_directory': str(out), 'sample_request_id': probes[0]['request_id'],
               'negative_request_id': next(r['request_id'] for r in probes if r['http_status'] == 413),
               'limits': ['Only backend AI-forwarding events collected; pre-forward 401 is not in this stream.',
                          'No CPU/RAM, Prometheus, Tempo, distributed traces, alert delivery or Mobile verification.',
                          'Log timestamp is collection time; elapsed_ms is measured by the backend.']}
    save('verification-summary.json', summary)
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == '__main__':
    main()
