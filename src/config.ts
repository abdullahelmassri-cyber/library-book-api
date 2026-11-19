import { z } from "zod";

const portResult = z.coerce
  .number()
  .int()
  .min(1)
  .max(65535)
  .safeParse(process.env.PORT);

if (!portResult.success) {
  throw new Error(
    `Invalid PORT environment variable: ${portResult.error.issues
      .map((issue) => issue.message)
      .join(", ")}`,
  );
}

export const port = portResult.data;
