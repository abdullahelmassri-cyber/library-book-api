import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { NotFoundError } from "../errors.js";
import { prisma } from "../lib/prisma.js";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
};

export type NewBook = Omit<Book, "id">;

export type BookUpdate = Partial<Omit<Book, "id">>;

function assertUuidId(id: string): void {
  const result = z.string().uuid().safeParse(id);

  if (!result.success || id !== id.toLowerCase()) {
    throw new NotFoundError("Book not found");
  }
}

async function mapRecordNotFound<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Book not found");
    }

    throw error;
  }
}

export async function listBooks(): Promise<Book[]> {
  return prisma.book.findMany();
}

export async function getBookById(id: string): Promise<Book> {
  assertUuidId(id);
  const book = await prisma.book.findUnique({ where: { id } });

  if (book === null) {
    throw new NotFoundError("Book not found");
  }

  return book;
}

export async function createBook(input: NewBook): Promise<Book> {
  return prisma.book.create({ data: input });
}

export async function updateBook(
  id: string,
  changes: BookUpdate,
): Promise<Book> {
  assertUuidId(id);
  return mapRecordNotFound(() =>
    prisma.book.update({ where: { id }, data: changes }),
  );
}

export async function deleteBook(id: string): Promise<void> {
  assertUuidId(id);
  await mapRecordNotFound(() => prisma.book.delete({ where: { id } }));
}
