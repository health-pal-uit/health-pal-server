They work together to help us **see what the backend is doing**.

| Tool                              | Responsibility                              | In HealthPal                                                                                |
| --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Alloy — collector**             | Reads logs and forwards them.               | Collects recognition events from the backend’s log files and sends them to Loki.            |
| **Loki — log storage and search** | Stores logs and answers queries about them. | Finds a request by its ID and calculates counts or latency statistics from recorded events. |
| **Grafana — dashboard**           | Queries Loki and displays the results.      | Shows request counts, failures, latency charts and searchable logs in your browser.         |

For example, suppose recognition takes **400 ms**:

1. **NestJS** writes a log containing the request ID, status and `elapsed_ms: 400`.
2. **Alloy** collects and sends that log.
3. **Loki** stores it so we can search or calculate statistics.
4. **Grafana** displays it on the dashboard.

```text
Backend writes → Alloy collects → Loki stores/searches → Grafana displays
```

**k6 sends the test requests; this monitoring stack helps us observe what happened.**
