-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);
