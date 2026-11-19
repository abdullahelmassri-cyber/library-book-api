# Library Book API

A small Express 5 API built with TypeScript, ESM, NodeNext, and Zod. Books are stored in memory and reset when the server restarts.

## Install and run

```bash
npm install
copy .env.example .env
npm run dev
```

On Mac/Linux, use `cp .env.example .env` instead. `.env` is gitignored and is not included in the repository. Set `PORT=3000` in your local `.env` file before starting the server.

Node.js 20.6+ is required for native environment-file support. The scripts use `--env-file-if-exists`, which requires Node.js 20.18+ (or 22.9+).

To run a production build:

```bash
npm run typecheck
npm run build
npm start
```

## Endpoints

### `GET /health`

```json
{ "status": "ok" }
```

### `GET /api/books`

Lists all books.

```http
GET /api/books
```

Example `200` response:

```json
[
  {
    "id": "a-book-id",
    "title": "The Hobbit",
    "author": "J. R. R. Tolkien",
    "genre": "Fantasy",
    "available": true
  }
]
```

### `GET /api/books/:id`

Returns one book.

```http
GET /api/books/a-book-id
```

Example `200` response:

```json
{
  "id": "a-book-id",
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": true
}
```

A missing ID returns `404`:

```json
{ "error": { "message": "Book not found" } }
```

### `POST /api/books`

Create a book. `title`, `author`, and `genre` are required non-empty strings. `available` is optional and defaults to `true`.

```http
POST /api/books
Content-Type: application/json
```

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy"
}
```

Example `201` response:

```json
{
  "id": "a-book-id",
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": true
}
```

### `PATCH /api/books/:id`

Updates one or more provided fields. Fields use the same validation as create; `available` must be a boolean. An empty update is invalid.

```http
PATCH /api/books/a-book-id
Content-Type: application/json
```

```json
{ "available": false }
```

Example `200` response:

```json
{
  "id": "a-book-id",
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": false
}
```

### `DELETE /api/books/:id`

```http
DELETE /api/books/a-book-id
```

Deletes one book and returns `204` with no body.

Invalid book data returns `400`:

```json
{ "error": { "message": "Invalid book data" } }
```

Malformed JSON returns `400`:

```json
{ "error": { "message": "Invalid JSON" } }
```

## How I used AI

AI generated the first version of the project. I reviewed the result against the lesson's checklist. I tested the endpoints with scripted HTTP requests, not Postman; a Postman collection is included in the repository.

### Issues I found and fixed myself

- I corrected the README: `.env` is gitignored and is absent from a fresh clone.
- I changed the dev/start scripts to `--env-file-if-exists` so a missing `.env` reaches PORT validation instead of failing in Node's CLI.
- I removed the unwanted AI `Co-authored-by` trailer from the first commit.
- I checked that controllers contain no data operations, services hold the logic, and POST/PATCH pass validated `result.data` rather than `req.body`.

## Postman collection

Import `postman/library-book-api.postman_collection.json` into Postman, start the API with `npm run dev`, then run the collection in the listed order. The collection uses `baseUrl` (default `http://localhost:3000`); the create request saves `bookId` for the following requests.

Run the collection with Newman: `npx newman run postman/library-book-api.postman_collection.json --env-var baseUrl=http://localhost:3000`.
