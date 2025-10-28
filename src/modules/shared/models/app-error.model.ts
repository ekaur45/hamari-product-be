import { HttpStatus, Logger } from '@nestjs/common';

export default class AppError extends Error {
  _message: string;
  _status: number;
  _exception: any;
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    exception?: any,
  ) {
    super(message);
    this._message = message;
    this._exception = exception;
    this._status = status;
    this.logError();
  }
  logError() {
    new Logger('AppError').error(this._message, this._exception);
  }
}
