import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import AppError from 'src/modules/shared/models/app-error.model';
import { ApiResponseModel } from 'src/modules/shared/models/api-response.model';

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = 'Internal server error';
    let errorCode: string | undefined;
    let errorDetails: any;

    // Handle custom AppError
    if (exception instanceof AppError) {
      message = exception.message;
      errorCode = 'APP_ERROR';
      errorDetails = exception._exception;
    }
    // Handle NestJS built-in HttpException
    else if (exception instanceof HttpException) {
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
    }
    // Other unknown errors
    else {
      console.error('Unexpected error:', exception);
      errorCode = 'UNKNOWN_ERROR';
      errorDetails =
        process.env.NODE_ENV === 'development' ? exception : undefined;
    }

    const errorResponse = ApiResponseModel.error(
      message,
      {
        code: errorCode,
        details: errorDetails,
      },
      request.url,
    );

    response.status(200).json(errorResponse);
  }
}
