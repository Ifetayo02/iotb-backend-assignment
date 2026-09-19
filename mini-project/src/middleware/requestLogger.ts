import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`);
  });

  next();
}