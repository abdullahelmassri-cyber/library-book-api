import { randomUUID } from "node:crypto";
import { NotFoundError } from "../errors.js";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
};

export type NewBook = Omit<Book, "id">;

export type BookUpdate = Partial<Omit<Book, "id">>;

const books: Book[] = [];

export function listBooks(): Book[] {
  return [...books];
}

export function getBookById(id: string): Book {
  const book = books.find((item) => item.id === id);

  if (!book) {
    throw new NotFoundError("Book not found");
  }

  return book;
}

export function createBook(input: NewBook): Book {
  const book: Book = {
    id: randomUUID(),
    ...input,
  };

  books.push(book);
  return book;
}

export function updateBook(id: string, changes: BookUpdate): Book {
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    throw new NotFoundError("Book not found");
  }

  const book = { ...books[index], ...changes };
  books[index] = book;
  return book;
}

export function deleteBook(id: string): void {
  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    throw new NotFoundError("Book not found");
  }

  books.splice(index, 1);
}
