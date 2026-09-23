import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import ErrorResponse from "./errorResponse.js";

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new ErrorResponse(message, 400));
    }

    req.body = result.data;
    next();
  };

// No Express 5 o req.query é somente leitura, então o resultado validado
// fica em res.locals.query.
export const validateQuery =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(new ErrorResponse(message, 400));
    }

    res.locals.query = result.data;
    next();
  };
