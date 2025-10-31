import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBackendRes } from 'src/interfaces/backend.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IBackendRes<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IBackendRes<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // if the response is already wrapped with responseHelper, return as is
        if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data) {
          return data;
        }

        // otherwise, wrap it automatically
        return {
          data,
          message: data?.message || 'Success',
          statusCode: response.statusCode || 200,
        };
      }),
    );
  }
}
