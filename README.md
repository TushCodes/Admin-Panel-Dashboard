# Admin-Panel-Dashboard

JavaScript-based application foundation for the Admin Panel Dashboard. The codebase uses Prisma for schema definition, generated database access, and migrations instead of Python/Flask-style SQLAlchemy and Alembic modules.

## Runtime

- Node.js 20+
- npm 10+

Install dependencies, generate Prisma Client, run tests, and start the API server:

```bash
npm install
npm run prisma:generate
npm test
npm start
```

The Express server starts from `server.js` and listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`).

## Database connection

Provide `DATABASE_URL` and `SECRET_KEY` when enabling the production database path. `db/connection.js` lazily creates a Prisma Client and connects it only when code requests database access.

The application reads the database URL lazily only when a Prisma Client is requested, so the configured value is propagated only for the active DB connection path and is not stored in source code.

- `DATABASE_URL`
- `SECRET_KEY`

Do not commit real database URLs, passwords, or application secret keys. Keep those values in Render environment variables or another deployment secret store.

## Prisma workflow

`prisma.config.js` points Prisma CLI commands at the schema, migration folder, and `DATABASE_URL`.


- `prisma/schema.prisma` is the source of truth for database models, relations, indexes, mapped table/column names, and the generated Prisma Client output path.
- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate:dev` creates and applies development migrations.
- `npm run prisma:migrate:deploy` applies committed Prisma migrations in deployment environments.


## Dummy frontend

A lightweight static frontend lives in `frontend/`. It can be served on its own origin for CORS testing while the Express API runs separately.

Start the backend in one terminal:

```bash
npm start
```

Start the dummy frontend in another terminal:

```bash
npm run frontend
```

Open `http://127.0.0.1:5173`, keep the default `http://localhost:3000/health` URL or change it to the backend URL you want to test, and click **Check backend**. If the request fails while the backend is running, the backend likely still needs CORS headers for the frontend origin.

## Project layout

- `prisma/schema.prisma` contains the Prisma data model schema.
- `model/` contains Prisma model-name exports for code that needs stable model identifiers.
- `db/connection.js` contains lazy Prisma Client configuration helpers that use the generated client and PostgreSQL driver adapter.
- `middleware/` contains framework-neutral authentication and login rate-limit middleware.
- `utils/` contains JSON, logging, error-handling, and pagination helpers.
- `services/` contains MIS PDF and Excel workbook generation helpers.
- `server.js` contains a basic Express API with `/` and `/health` endpoints.
- `frontend/` contains a dummy static page and tiny Node.js static file server for CORS testing.
- `test/` contains Node.js test runner coverage and reusable dashboard test data.
