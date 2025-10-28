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
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.pagination = pagination;
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    path: string = '',
  ): ApiResponseModel<T> {
    return new ApiResponseModel(true, message, data, undefined, path);
  }

  static successWithPagination<T>(
    data: T,
    pagination: ApiResponse<T>["pagination"],
    message: string = 'Success',
    path: string = '',
  ): ApiResponseModel<T> {
    return new ApiResponseModel(true, message, data, undefined, path, pagination);
  }

  static error(
    message: string,
    error?: { code?: string; details?: any },
    path: string = '',
  ): ApiResponseModel {
    return new ApiResponseModel(false, message, undefined, error, path);
  }
}
