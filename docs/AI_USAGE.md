# AI usage

AI assistance was used for the initial source and Postman audit, the Prisma 7
schema and PostgreSQL migration setup, replacing the in-memory service with
Prisma calls, updating the README, and exercising the API and database.

The implementation was checked against `docs/api-contract-before.md`, the
existing Zod schemas, and the Postman collection. In particular, Zod request
validation was left unchanged, the service's in-memory array was removed,
missing-record Prisma errors are translated to the existing `NotFoundError`,
and the existing response bodies/status codes are retained.

One concrete issue found by checking behavior: before the refactor, both an
unknown UUID and a malformed ID returned `404` with
`{"error":{"message":"Book not found"}}`. The database column is PostgreSQL
`uuid`, where passing a malformed string to Prisma can raise a database error
instead. The service now rejects non-canonical UUID path values as the same
not-found error before querying, and the HTTP checks cover both ID cases.

Results were verified with a TypeScript build, real HTTP requests for every
route and validation/error cases, a real server stop/restart followed by a
successful GET of persisted data, and a PostgreSQL `SELECT * FROM books`.
The observed requests and responses are recorded in `docs/TESTING.md`.
