import type { RequestHandler } from "express";
import { z } from "zod";
import { BadRequestError } from "../errors.js";
import {
  createBook as createBookService,
  deleteBook as deleteBookService,
  getBookById as getBookByIdService,
  listBooks as listBooksService,
  updateBook as updateBookService,
} from "../services/books.service.js";

const createBookSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  genre: z.string().trim().min(1),
  available: z.boolean().default(true),
});

const updateBookSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    author: z.string().trim().min(1).optional(),
    genre: z.string().trim().min(1).optional(),
    available: z.boolean().optional(),
  })
  .refine((book) => Object.keys(book).length > 0);

type BookParams = { id: string };

export const listBooks: RequestHandler = async (_req, res) => {
  res.json(await listBooksService());
};

export const getBookById: RequestHandler<BookParams> = async (req, res) => {
  res.json(await getBookByIdService(req.params.id));
};

export const createBook: RequestHandler = async (req, res, next) => {
  const result = createBookSchema.safeParse(req.body);

  if (!result.success) {
    next(new BadRequestError("Invalid book data"));
    return;
  }

  res.status(201).json(await createBookService(result.data));
};

export const updateBook: RequestHandler<BookParams> = async (
  req,
  res,
  next,
) => {
  const result = updateBookSchema.safeParse(req.body);

  if (!result.success) {
    next(new BadRequestError("Invalid book data"));
    return;
  }

  res.json(await updateBookService(req.params.id, result.data));
};

export const deleteBook: RequestHandler<BookParams> = async (req, res) => {
  await deleteBookService(req.params.id);
  res.status(204).end();
};
