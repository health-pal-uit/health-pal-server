# Start HealthPal's local services

From `health-pal-server`:

```powershell
docker compose up -d
```

This starts **NestJS, the selected CPU AI service, PostgreSQL, Loki, Alloy and Grafana**. A small Grafana initialization job creates its private admin credential automatically. Images build on first use; after changing application source, use `docker compose up -d --build`.

`grafana-init` finishing with exit code **0** is expected; the other six services remain running.

## First-time requirements

1. Keep the working private backend `.env`. **`DB_TARGET=cloud` continues using `CLOUD_DB_*`**; its Supabase/database project must be active. Local PostgreSQL also starts for compatibility, and is used only when `DB_TARGET=local`.
2. Place the AI source checkout beside the backend as `../healthpal-ai-service`. For a new workspace:

   ```powershell
   git clone https://github.com/health-pal-uit/healthpal-food-recognization-v1.git ../healthpal-ai-service
   ```

3. Import the separately supplied frozen checkpoint into `../healthpal-ai-service/models/healthpal-selected-92.pt`, following that repository's installation guide. Compose mounts it read-only; it is not included in Git or the image.
4. Stop the older Windows backend/AI processes and `monitoring/compose.local.yaml` stack before switching, so their ports are available. Stopping the old stack preserves its volumes.

No change to your existing cloud credentials is required. `HEALTHPAL_AI_SOURCE`, `HEALTHPAL_AI_DOCKERFILE` and `HEALTHPAL_MODEL_FILE` optionally override source/model locations. The Compose backend overrides its AI URL to **`http://healthpal-ai:8001`**, using Docker service discovery.

## Open / check

| Service             | Address                                                             |
| ------------------- | ------------------------------------------------------------------- |
| Backend Swagger     | http://localhost:3001/api                                           |
| AI readiness / docs | http://127.0.0.1:8001/health/ready / http://127.0.0.1:8001/docs     |
| Grafana dashboard   | http://127.0.0.1:3000/d/healthpal-recognition/healthpal-recognition |
| Loki readiness      | http://127.0.0.1:3100/ready                                         |
| Alloy collector     | http://127.0.0.1:12345                                              |

```powershell
docker compose ps
docker compose logs --tail 50 health-pal-server healthpal-ai
```

The backend waits for database and AI readiness. Use `/food-vision/recognize` or `/compare` with a normal User token. The legacy `/analyze` route still needs its separate host service on port 5000; `FOOD_VISION_CONTAINER_URL` can override that optional legacy connection. Flutter, Supabase and Sepolia are not local services started by this Compose file.

## Monitoring / data

Alloy discovers only the labelled backend in this Compose project, then sanitizes its stdout events before Loki. The dashboard and datasource are provisioned from `monitoring/grafana/`; no Windows log redirection is needed. Existing research benchmarks remain historical measurements of their recorded environments.

Database and monitoring data live in named volumes. The main stack uses `recognition-*` monitoring volumes; the host-mode stack's volumes remain separate. Grafana is available as a local anonymous **Viewer**. Its generated admin secret lives in a private volume and is never committed.

The original workspace's verified Grafana/Loki history was copied into the new main-stack volumes during this integration; the source volumes were retained. The [dated verification record](compose-verification.json) describes the tested integration, not a new performance benchmark.

Reproduce the authenticated API/log verification:

```powershell
python monitoring/verify-monitoring.py --compose --token-file performance/k6/auth.local.env --output monitoring/results
```

Supply a fresh token in the ignored file first. No diary entries are saved by that verification.

Stop services while retaining data:

```powershell
docker compose stop
```

Sources: [Compose networking](https://docs.docker.com/compose/how-tos/networking/), [Alloy Docker collection](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.docker/). This is local service integration; it does not add full LGTM or change the frozen research model/policy.
