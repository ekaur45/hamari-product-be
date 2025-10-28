import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponseModel } from '../modules/shared/models/api-response.model';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseModel<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseModel<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponseModel, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponseModel<T>;
        }

        // Otherwise, wrap the data in a success response
        return ApiResponseModel.success(data as T, 'Success', path);
      }),
    );
  }
}
