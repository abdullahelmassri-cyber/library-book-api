# API and persistence verification

Tested against the local PostgreSQL 16 `library_db` database on 2026-11-26.
Requests were sent to the production build with `curl.exe`; JSON request bodies
were passed as UTF-8 request data. The expected behavior below is from
`docs/api-contract-before.md`. Additional required-field edge cases were sent
with PowerShell `Invoke-WebRequest`.

## Contract comparison

| endpoint | expected (from contract) | actual | pass |
| --- | --- | --- | --- |
| `GET /health` | `200`, `{"status":"ok"}` | `200`, `{"status":"ok"}` | Yes |
| `GET /api/books` (fresh database) | `200`, `[]` | `200`, `[]` | Yes |
| `POST /api/books` | `201`, Book with generated string UUID; supplied text is trimmed and omitted `available` defaults to `true` | `201`, `{"id":"8c0de0d1-2243-4a31-84e1-3d2b23dd15ec","title":"The Hobbit","author":"J. R. R. Tolkien","genre":"Fantasy","available":true}` | Yes |
| `GET /api/books/:id` (created ID) | `200`, complete Book | `200`, `{"id":"8c0de0d1-2243-4a31-84e1-3d2b23dd15ec","title":"The Hobbit","author":"J. R. R. Tolkien","genre":"Fantasy","available":true}` | Yes |
| `GET /api/books` (after create) | `200`, Book array | `200`, `[{"id":"8c0de0d1-2243-4a31-84e1-3d2b23dd15ec","title":"The Hobbit","author":"J. R. R. Tolkien","genre":"Fantasy","available":true}]` | Yes |
| `PATCH /api/books/:id` | `200`, complete updated Book | `200`, `{"id":"8c0de0d1-2243-4a31-84e1-3d2b23dd15ec","title":"The Hobbit Updated","author":"J. R. R. Tolkien","genre":"Fantasy","available":false}` | Yes |
| `POST /api/books` (empty title) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `POST /api/books` (wrong `available` type) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `POST /api/books` (missing `author`) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `POST /api/books` (whitespace-only `genre`) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `POST /api/books` (malformed JSON) | `400`, `{"error":{"message":"Invalid JSON"}}` | `400`, `{"error":{"message":"Invalid JSON"}}` | Yes |
| `PATCH /api/books/:id` (empty update) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `PATCH /api/books/:id` (`title: null`) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `PATCH /api/books/:id` (whitespace-only `author`) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `PATCH /api/books/:id` (`available: null`) | `400`, `{"error":{"message":"Invalid book data"}}` | `400`, `{"error":{"message":"Invalid book data"}}` | Yes |
| `GET /api/books/:id` (unknown UUID `00000000-0000-4000-8000-000000000001`) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `PATCH /api/books/:id` (unknown UUID; exercises Prisma P2025 mapping) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `DELETE /api/books/:id` (unknown UUID; exercises Prisma P2025 mapping) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `GET /api/books/:id` (`not-a-uuid`) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `PATCH /api/books/:id` (`not-a-uuid`) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `DELETE /api/books/:id` (`not-a-uuid`) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `GET /api/books/:id` (uppercase form of existing UUID) | `404`, exact ID comparison | `404`, `{"error":{"message":"Book not found"}}` | Yes |
| `DELETE /api/books/:id` (created ID) | `204`, no body | `204`, no body | Yes |
| `GET /api/books/:id` (deleted ID) | `404`, `{"error":{"message":"Book not found"}}` | `404`, `{"error":{"message":"Book not found"}}` | Yes |

## Request bodies used

Create:

```json
{"title":"  The Hobbit  ","author":"J. R. R. Tolkien","genre":"Fantasy"}
```

Update (including an unknown key, which Zod strips):

```json
{"available":false,"title":"  The Hobbit Updated  ","ignored":"stripped"}
```

Validation cases:

```json
{"title":"","author":"J. R. R. Tolkien","genre":"Fantasy"}
```

```json
{"title":"Book","author":"Author","genre":"Genre","available":"yes"}
```

The additional required/trim validation requests were
`{"title":"Book","genre":"Fantasy"}` (missing `author`) and
`{"title":"Book","author":"Writer","genre":"   "}` (blank after trimming).
PATCH validation also used `{"author":"   "}` and `{"available":null}`.

Malformed JSON was sent as the literal `{`. The invalid PATCH cases were `{}` and
`{"title":null}`. Unknown UUID update used `{"available":false}`.

## Restart persistence and SQL

A separate create/update test used ID
`8ab8af84-62c9-4c9b-aa3e-c5d7e62653e7`. The production server was stopped
completely and started again with `npm start`. After restart:

```text
GET /health -> HTTP 200 {"status":"ok"}
GET /api/books/8ab8af84-62c9-4c9b-aa3e-c5d7e62653e7 after server restart -> HTTP 200 {"id":"8ab8af84-62c9-4c9b-aa3e-c5d7e62653e7","title":"The Hobbit Updated","author":"J. R. R. Tolkien","genre":"Fantasy","available":false}
```

Actual PostgreSQL output for `SELECT * FROM books;` on `library_db` before
deleting that test record:

```text
                  id                  |       title        |      author      |  genre  | available
--------------------------------------+--------------------+------------------+---------+-----------
 8ab8af84-62c9-4c9b-aa3e-c5d7e62653e7 | The Hobbit Updated | J. R. R. Tolkien | Fantasy | f
(1 row)
```

The test record was then deleted through the API (`204`); GET for the deleted
ID returned the contract's `404` JSON response.

Exact ID matching was checked separately: after creating
`501329ab-1c50-4c4e-a641-47071ebb345b`, GET using its uppercase form returned
`404` with `{"error":{"message":"Book not found"}}`; deleting the canonical ID
returned `204`.

## Build and run scripts

- `npm run build`: passed (`tsc`, exit code `0`).
- `npm start`: served the production build; health and CRUD requests passed.
- `npm run dev`: started the TypeScript watch server; `GET /health` returned
  `200` with `{"status":"ok"}`.
- `package.json` has no `test` script, so there was no project test command to
  run. The HTTP checks above exercised the Postman collection's endpoint and
  validation cases plus missing-record and malformed-ID cases.
