import { NextFunction, Request, Response } from 'express';
import { ErrorCodes, HttpError, InvalidParamsError } from '../config/consts';
import { ValidationError } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const handleErrorWithStatus = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message, ...error.errorDetails });
  } else if (error instanceof InvalidParamsError) {
    res.status(ErrorCodes.BadRequest).json({ error: error.message });
  } else if (Array.isArray(error) && error.length > 0) {
    const firstError = error[0];
    if (firstError instanceof ValidationError) {
      res.status(ErrorCodes.BadRequest).json({
        error: {
          key: firstError.property,
          message: firstError.constraints || `invalid value of ${firstError.property}`,
        },
      });
    }
  } else {
    const response = {
      error: `${(error as Error).message}` || 'internal server error',
      s: (error as Error).stack,
    };
    console.error(error);
    if (error?.response?.data) {
      response.error = `${response.error}, ${error?.response?.data}`;
    }
    res.status(500).json({ response });
  }
  res.end();
};
