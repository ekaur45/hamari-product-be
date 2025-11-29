import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import AppError from 'src/modules/shared/models/app-error.model';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';
import { LoggerService } from 'src/modules/logger/logger.service';

@Catch()
@Injectable()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = 'Internal server error';
    let errorCode: string | undefined;
    let errorDetails: any;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle custom AppError
    if (exception instanceof AppError) {
      message = exception.message;
      errorCode = 'APP_ERROR';
      errorDetails = exception._exception;

      this.logger.error(
        `AppError: ${message}`,
        JSON.stringify({
          url: request.url,
          method: request.method,
          errorCode,
          errorDetails,
        }),
      );
    }
    // Handle NestJS built-in HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else {
        const errorResponse = res as Record<string, any>;
        message =
          errorResponse.message || errorResponse.error || 'An error occurred';
        errorCode = errorResponse.error || 'HTTP_EXCEPTION';
        errorDetails = errorResponse.details;
      }

      this.logger.error(
        `HttpException: ${message}`,
        exception.stack,
        JSON.stringify({
          url: request.url,
          method: request.method,
          statusCode,
          errorCode,
          errorDetails,
        }),
      );
    }
    // Other unknown errors
    else {
      console.error('Unexpected error:', exception);
      errorCode = 'UNKNOWN_ERROR';
      errorDetails =
        process.env.NODE_ENV === 'development' ? exception : undefined;

      this.logger.error(
        `Unknown Error: ${exception instanceof Error ? exception.message : 'Unknown error occurred'}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify({
          url: request.url,
          method: request.method,
          errorCode,
          errorDetails: exception instanceof Error ? {
            name: exception.name,
            message: exception.message,
          } : errorDetails,
        }),
      );
    }

    const errorResponse = ApiResponseModel.error(
      message,
      {
        code: errorCode,
        details: errorDetails,
      },
      request.url,
      statusCode,
    );

    response.status(200).json(errorResponse);
  }
}
