import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';
import { Observable, tap } from 'rxjs';

// module-level singletons — safe across hot-reloads
const reqCounter: Counter<string> =
  (register.getSingleMetric('http_requests_total') as Counter<string>) ??
  new Counter({
    name: 'http_requests_total',
    help: 'total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

const reqDuration: Histogram<string> =
  (register.getSingleMetric('http_request_duration_seconds') as Histogram<string>) ??
  new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method: string; path: string }>();
    const { method, path: route } = req;
    const endTimer = reqDuration.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<{ statusCode: number }>();
          endTimer();
          reqCounter.inc({ method, route, status_code: String(res.statusCode) });
        },
        error: () => {
          endTimer();
          reqCounter.inc({ method, route, status_code: '500' });
        },
      }),
    );
  }
}
