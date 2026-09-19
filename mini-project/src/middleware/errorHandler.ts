import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(err.stack ?? err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
}