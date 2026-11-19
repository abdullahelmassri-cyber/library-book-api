import type { ErrorRequestHandler } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";

function isInvalidJsonError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  );
}

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  console.error(err);

  let status = 500;
  let message = "Internal Server Error";

  if (isInvalidJsonError(err)) {
    status = 400;
    message = "Invalid JSON";
  } else if (err instanceof BadRequestError) {
    status = 400;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    status = 404;
    message = err.message;
  }

  res.status(status).json({ error: { message } });
};
