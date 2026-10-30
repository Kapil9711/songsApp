import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../helper/app-error.js";

export const validateBody = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError(400, "Request validation failed", errors));
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError(400, "Query validation failed", errors));
    }

    Object.assign(req, { validatedQuery: result.data });
    next();
  };
};

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError(400, "Parameter validation failed", errors));
    }

    (req as any).params = result.data;
    next();
  };
};
