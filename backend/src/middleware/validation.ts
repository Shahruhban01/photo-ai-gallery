import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ExpressValidationError) => {
      if ('path' in error) {
        return {
          field: error.path,
          message: error.msg,
        };
      }
      return { message: error.msg };
    });

    res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }
  
  next();
};
