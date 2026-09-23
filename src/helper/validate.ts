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
