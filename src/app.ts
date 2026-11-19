import express from "express";
import { errorHandler } from "./errorHandler.js";
import { booksRouter } from "./routes/books.routes.js";

export const app = express();

app.use((req, _res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/books", booksRouter);
app.use(errorHandler);
