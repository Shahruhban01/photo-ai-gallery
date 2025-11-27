import { Request, Response, NextFunction } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => {
      const fieldError = error as FieldValidationError;
      return {
        field: fieldError.path || 'unknown',
        message: fieldError.msg,
      };
    });

    res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }
  
  next();
};
