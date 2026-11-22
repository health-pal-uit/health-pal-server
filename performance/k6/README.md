# Recognition performance — k6

Measures the real authenticated `POST /food-vision/recognize` endpoint. Default: **P1, 1 virtual user, 60 requests**, five fixed photos in rotation, plus five warm-up requests. No food diary entries are saved.

## Run

1. Start the frozen AI service on `127.0.0.1:8001` and this backend on `127.0.0.1:3001`, with working authentication/database settings.
2. Install k6 and put it on PATH (`k6 version`). The recorded baseline used **k6 v2.4.0**.
3. From the repository root:

```powershell
cd performance/k6
Copy-Item auth.local.env.example auth.local.env
notepad auth.local.env
```

Paste a fresh **User access token** after `HP_TOKEN=`, save, then:

```powershell
k6 run test.js
```

`auth.local.env` is ignored by Git. Alternatively supply `HP_TOKEN` through the process environment. Backend `.env` does not need changing for the test. An expired token normally fails warm-up with HTTP 401.

## Compare the four profiles

Run each profile separately; each uses **60 measured requests + 5 warm-ups**. P0/P1 use one original inference; P2 adds a brightened inference only when its original candidate passes P1.

| Profile               | `HP_POLICY` | `HP_VUS` |
| --------------------- | ----------- | -------- |
| P0 / 1 user           | P0          | 1        |
| P1 / 1 user (default) | P1          | 1        |
| P2 / 1 user           | P2          | 1        |
| P1 / 2 users          | P1          | 2        |

Example:

```powershell
$env:HP_POLICY = 'P2'
$env:HP_VUS = '1'
k6 run test.js
```

Change those two values for the next profile. `HP_BASE_URL` overrides the backend address. Advanced controls: `HP_ITERATIONS` (multiple of five, maximum 300), `HP_THINK_SECONDS` (default 0.25), `HP_RUN_ID` and `HP_MAX_DURATION` (default 5m). Keep the normal defaults when reproducing the baseline. `HP_WARMUP=0` is for script checks, not the recorded protocol.

## Dashboard / saved evidence

```powershell
New-Item -ItemType Directory -Force results | Out-Null
$env:K6_WEB_DASHBOARD = 'true'
$env:K6_WEB_DASHBOARD_OPEN = 'true'
$env:K6_WEB_DASHBOARD_PERIOD = '1s'
$env:K6_WEB_DASHBOARD_EXPORT = 'results/dashboard.html'
k6 run test.js
```

The **k6 built-in dashboard** is at `http://127.0.0.1:5665` during the run. Close its tab after completion if k6 keeps waiting. Open `results/dashboard.html` afterwards. This UI is separate from the application's Grafana/Loki monitoring.

For raw metrics and redacted request IDs, use a fresh results folder/name per run:

```powershell
$env:HP_RUN_ID = 'p2-v1-example'
$env:HP_LOG_SAMPLES = '1'
k6 run --out json=results/metrics.json test.js 2> results/samples.log
```

`HP_SAMPLE` records contain no token, image bytes or raw response body. Join their `request_id` to backend log events `food_recognition` / `food_recognition_failed`; **`elapsed_ms` is Backend → AI timing**. Calculate p50/p95 from those matched samples. Never subtract aggregate percentiles to estimate this timing. Keep credentials and generated reports out of Git.

## Read the result

| Metric                 | Meaning                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `hp_http_failure`      | Fraction of measured requests that did not return HTTP 200.                                            |
| `hp_contract_failure`  | Fraction failing response schema, release identity, request ID or policy consistency checks.           |
| `hp_round_trip_ms`     | Full client round trip: backend authentication, forwarding, AI and response.                           |
| `hp_http_duration_ms`  | k6 HTTP send + wait + receive; excludes connection setup.                                              |
| `hp_ai_processing_ms`  | AI-reported processing, including decode/queue/inference/policy; not the full backend forwarding call. |
| `hp_brightened_passes` | Number of additional P2 inference passes.                                                              |

**Pass criteria: zero measured HTTP and contract failures.** No latency target was predeclared. All `hp_*` metrics exclude warm-up; built-in `http_*` totals include it. With defaults, expect **60 measured requests, 120 checks, 65 total HTTP requests**. A failed warm-up stops before measurement.

The script verifies the model SHA, frozen versions, candidate floor **0.05**, acceptance threshold **0.36970099806785583**, box bounds, statuses and inference counts. It checks internal consistency, not food-label accuracy or every part of P2's brightened-view matching. Responses marked `X-HealthPal-Fixture` fail live checks. `HP_ALLOW_FIXTURES=1` is reserved for engineering self-checks; those results are never live performance evidence.

## Scope and files

- [workload.json](workload.json): release lock, four profiles, photo hashes and historical predictions. Historical labels/confidences are reference only, not exact runtime assertions.
- [fixtures/attribution.json](fixtures/attribution.json): source and licence notices for the five unchanged photos. The Sushi filename describes a saved detector output; its source category is bánh khọt.
- [BASELINE-2026-11-22.md](BASELINE-2026-11-22.md): completed live benchmark summary, recorded before this repository packaging.

This is a bounded local API benchmark. Five repeated photos and 1–2 users do not establish production capacity, Mobile latency or new recognition accuracy. These previously inspected test photos must stay out of training/tuning. Preserve source attribution when copying them.
