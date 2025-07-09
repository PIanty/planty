import { NextFunction, Request, Response } from 'express';
import { logger } from '@utils/logger';
import { HttpException } from '@/exceptions/HttpException';

export const ErrorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Meow? 😿 Something went wrong with the JusCat app!';

    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

    // Format response with validation object to match successful responses
    const responseObj = {
      validation: {
        validityFactor: 0,
        descriptionOfAnalysis: message
      },
      catMessage: message,
      error: true
    };

    // Remove stack trace in production
    if (process.env.NODE_ENV !== 'production') {
      responseObj['stack'] = error.stack;
    }

    res.status(status).json(responseObj);
  } catch (error) {
    next(error);
  }
};
