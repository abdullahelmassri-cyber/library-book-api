# Library Book API

A small Express 5 API built with TypeScript, ESM, NodeNext, Zod, Prisma 7,
and PostgreSQL.

## Prerequisites

- Node.js 20.18+ or 22.9+ (the run scripts use `--env-file-if-exists`).
- PostgreSQL 16 running locally, with a role that can create a database and
  connect to it.

## Database and environment setup

From PowerShell, create the empty database (skip this if `library_db` already
exists):

```powershell
$env:PGPASSWORD = "your-postgres-password"
try {
  & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE library_db;"
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
```

Install dependencies, create your local environment file, and replace
`YOUR_PASSWORD` in `.env` with the PostgreSQL password:

```powershell
npm install
Copy-Item .env.example .env
```

`.env` is ignored by Git. Keep credentials there; do not put them in
`.env.example`. The default database URL targets `library_db` on
`localhost:5432`; keep the existing `PORT` entry.

Apply committed migrations and generate the ignored Prisma Client before
building (also required after cloning):

```powershell
npx prisma migrate deploy
npx prisma generate
```

## Run and build

For development:

```powershell
npm run dev
```

For a production build and run:

```powershell
npm run typecheck
npm run build
npm start
```

The server gracefully closes its HTTP listener and disconnects Prisma on
SIGINT or SIGTERM.

## Endpoints

| Method | Path | Success |
| --- | --- | --- |
| `GET` | `/health` | `200` |
| `GET` | `/api/books` | `200` |
| `GET` | `/api/books/:id` | `200`; missing book `404` |
| `POST` | `/api/books` | `201`; invalid body `400` |
| `PATCH` | `/api/books/:id` | `200`; invalid body `400`; missing book `404` |
| `DELETE` | `/api/books/:id` | `204`; missing book `404` |

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
    "id": "550e8400-e29b-41d4-a716-446655440000",
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
GET /api/books/550e8400-e29b-41d4-a716-446655440000
```

Example `200` response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
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
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": true
}
```

### `PATCH /api/books/:id`

Updates one or more provided fields. Fields use the same validation as create; `available` must be a boolean. An empty update is invalid.

```http
PATCH /api/books/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{ "available": false }
```

Example `200` response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": false
}
```

### `DELETE /api/books/:id`

```http
DELETE /api/books/550e8400-e29b-41d4-a716-446655440000
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

## AI usage

AI assistance during the original project and this database integration is
described in [docs/AI_USAGE.md](docs/AI_USAGE.md).

## Postman collection

Import `postman/library-book-api.postman_collection.json` into Postman, start the API with `npm run dev`, then run the collection in the listed order. The collection uses `baseUrl` (default `http://localhost:3000`); the create request saves `bookId` for the following requests.

Run the collection with Newman: `npx newman run postman/library-book-api.postman_collection.json --env-var baseUrl=http://localhost:3000`.
