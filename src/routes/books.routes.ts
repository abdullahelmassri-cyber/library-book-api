import { Router } from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  listBooks,
  updateBook,
} from "../controllers/books.controller.js";

export const booksRouter = Router();

booksRouter.get("/", listBooks);
booksRouter.get("/:id", getBookById);
booksRouter.post("/", createBook);
booksRouter.patch("/:id", updateBook);
booksRouter.delete("/:id", deleteBook);
