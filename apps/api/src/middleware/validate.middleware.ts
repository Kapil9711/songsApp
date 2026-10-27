import type { Request, Response, NextFunction, RequestHandler } from "express";

import type { ZodType } from "zod";
import { AppError } from "../helper/app-error.js";

export function validateBody(schema: ZodType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new AppError(400, "Request validation failed", errors));

      return;
    }

    req.body = result.data;
    next();
  };
}
