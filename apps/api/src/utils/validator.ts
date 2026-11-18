import { type Request, type Response, type NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { createError } from "../middleware/error-handler";

type Validator<T> = (req: Request, _res: Response, next: NextFunction) => Promise<void>;

export function validateBody<T>(schema: ZodSchema<T>): Validator<T> {
  return async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed; // replace raw body with parsed (safer, typed)
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          createError(
            400,
            "INVALID_INPUT",
            "入力内容に問題があります。",
            "There is a problem with the input.",
            { errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })) }
          )
        );
      }
      next(err);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>): Validator<T> {
  return async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      // Replace query with parsed so downstream sees a typed object.
      // Note: Express query values are strings; zod coercers handle that.
      Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          createError(
            400,
            "INVALID_INPUT",
            "入力内容に問題があります。",
            "There is a problem with the input.",
            { errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })) }
          )
        );
      }
      next(err);
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>): Validator<T> {
  return async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      Object.assign(req.params, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          createError(
            400,
            "INVALID_INPUT",
            "入力内容に問題があります。",
            "There is a problem with the input.",
            { errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })) }
          )
        );
      }
      next(err);
    }
  };
}
