export enum ErrorCodes {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
}

export class InvalidParamsError extends Error {}

export class HttpError extends Error {
  public statusCode: ErrorCodes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public errorDetails: Record<string, any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode: ErrorCodes, message: string, errorDetails?: Record<string, any>) {
    super();
    this.statusCode = statusCode;
    this.errorDetails = errorDetails || {};
    this.message = message;
  }
}

export const RESOURCE_TABLE_NAME = 'resource_locks';
