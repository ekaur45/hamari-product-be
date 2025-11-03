import { HttpStatus } from "@nestjs/common";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
  path: string;
}

export class ApiResponseModel<T = any> implements ApiResponse<T> {
  statusCode:HttpStatus = HttpStatus.OK;
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
  path: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: { code?: string; details?: any },
    path: string = '',
    pagination?: ApiResponse<T>["pagination"],
    statusCode: HttpStatus = HttpStatus.OK,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.pagination = pagination;
    this.statusCode = statusCode;
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    path: string = '',
    statusCode: HttpStatus = HttpStatus.OK,
    ): ApiResponseModel<T> {
    return new ApiResponseModel(true, message, data, undefined, path, undefined, statusCode);
  }

  static successWithPagination<T>(
    data: T,
    pagination: ApiResponse<T>["pagination"],
    message: string = 'Success',
    path: string = '',
    statusCode: HttpStatus = HttpStatus.OK,
  ): ApiResponseModel<T> {
    return new ApiResponseModel(true, message, data, undefined, path, pagination, statusCode);
  }

  static error(
    message: string,
    error?: { code?: string; details?: any },
    path: string = '',
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponseModel {
    return new ApiResponseModel(false, message, undefined, error, path, undefined, statusCode);
  }
}
