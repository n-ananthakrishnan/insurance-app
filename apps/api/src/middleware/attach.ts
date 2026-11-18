import type { RequestHandler } from "express";

export const attach: RequestHandler = (_req, _res, next) => {
  next();
};
