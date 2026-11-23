# Local recognition monitoring

**Backend → Alloy → Loki → Grafana.** The main Compose stack collects the containerized backend's actual AI forwarding calls. The host-run alternative below collects Windows log files instead.

## Default: start the full Compose stack

From the backend repository:

```powershell
docker compose up -d
```

This includes backend, AI, database and monitoring. Grafana's secret is initialized automatically in a private volume. See the [Compose guide](../docker/COMPOSE.md) for the sibling AI source/model prerequisites. Use `--compose` when running `verify-monitoring.py` against this stack.

`config.docker.alloy` discovers the labelled backend in the current Compose project. `recognition-pipeline.alloy` sanitizes its logs before shipping them. No Windows log-file mounts are needed in this mode.

## Alternative: keep the backend on Windows

The backend and AI must already be running. In the current research workspace, from `health-pal-server`:

```powershell
.\monitoring\start-monitoring.ps1
```

Open **[HealthPal Recognition](http://127.0.0.1:3000/d/healthpal-recognition/healthpal-recognition)**. No login is required for local viewing. Grafana is on **3000**, Loki on **3100**, Alloy on **12345**; all published monitoring ports bind only to `127.0.0.1`.

The current default input files are `../.cache/recognition-performance-20261122/backend.stdout.log` and `backend.stderr.log`. On a different checkout, redirect the backend's stdout/stderr to your own log folder and supply it:

```powershell
# Terminal 1, backend repository; dependencies and working .env already required.
New-Item -ItemType Directory -Force logs | Out-Null
npm.cmd run build
node dist/src/main.js >> logs/backend.stdout.log 2>> logs/backend.stderr.log

# Terminal 2, same repository.
.\monitoring\start-monitoring.ps1 -BackendLogDirectory .\logs
```

Docker Desktop must be running. This does not require changes to the backend `.env`. Do not start the original Compose monitoring services on the same ports simultaneously.

## Read the dashboard

| Panel                  | Meaning                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Forwarded AI requests  | Calls the backend actually forwarded to AI.                                                                      |
| AI HTTP 2xx responses  | Upstream HTTP success; **not recognition accuracy**.                                                             |
| AI forwarding failures | Upstream 4xx/5xx or transport errors. A deliberate 413 input rejection belongs here.                             |
| p50 / p95              | Backend-measured `elapsed_ms`, grouped by endpoint over five-minute windows. Excludes authentication and Mobile. |
| Events per second      | Forwarding-event rate over one-minute windows.                                                                   |
| Upstream HTTP status   | Counts by upstream status; an empty status means there was no HTTP response.                                     |
| Logs                   | Sanitized JSON forwarding events.                                                                                |

Paste a **request ID or run prefix** into the top textbox and press Enter. This filters every panel. Leave it blank to see all events in the selected time range. If the page is empty later, select the verification date/time or generate fresh requests.

Useful Explore query, using **HealthPal Loki**:

```logql
{job="healthpal-recognition"} |= "YOUR_REQUEST_ID"
```

The API response's `request_id` matches this log's `request_id`. This is log correlation; no Tempo/distributed tracing is configured. HTTP 401 or upload rejections **before forwarding** do not appear in this stream.

## Reproduce the verification

Copy `performance/k6/auth.local.env.example` to `performance/k6/auth.local.env` and fill a fresh normal User access token, then:

```powershell
python monitoring/verify-monitoring.py --output monitoring/results
```

Python standard library only. The runner makes **18 recognition API probes**: 15 photo/policy requests, one comparison, one expected 413 for a valid PNG exceeding AI's 20 MP limit, and one expected 401 without a token. It checks all **17 forwarded request IDs** in Loki and Grafana, datasource health, eight panel queries and exported field names. It does not write diary data. The 401 is intentionally absent from forwarding logs.

An existing private token file can be supplied with `--token-file PATH`; never pass the token itself as a command argument. Output includes JSON/CSV evidence. This small verification run is separate from the recorded k6 latency benchmark and final recognition evaluation.

## Files / limits

- `compose.local.yaml`: standalone local stack; pinned Grafana 11.0.0 and Loki 3.0.0 reuse the available baseline images, with Alloy 1.22.0.
- `config.alloy`: host-mode file input. Both modes use `recognition-pipeline.alloy`, which drops unrelated lines and exports six allowlisted fields. No tokens, images, SQL or account records are shipped. Request IDs stay in JSON content, not stream labels.
- `grafana/`: provisioned Loki datasource and dashboard; files are the source of truth.
- `.grafana-admin-password.local`: generated private admin password, ignored by Git. Local anonymous access is **Viewer**, not Admin.

The original `promtail-config.yml` is retained for the historical Docker setup. New collection uses Alloy because [Promtail reached end of life on 2 March 2026](https://grafana.com/docs/grafana-cloud/send-data/alloy/set-up/migrate/from-promtail/). See [Alloy file collection](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.file/) and [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/) for the underlying mechanisms.

**Verified scope:** recognition forwarding logs, latency, event rate, failures and request correlation. CPU/RAM/database metrics, alert delivery, Prometheus/Mimir, Tempo and Mobile monitoring remain separate. Log timestamps are collection time; `elapsed_ms` comes from the backend timer.

Stop monitoring without deleting its stored data:

```powershell
docker compose -f monitoring/compose.local.yaml stop
```
