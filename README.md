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

Copy `.env.example` to `.env` for local development or add the same keys to Render, Supabase, or another deployment secret store. The Supabase pooled PostgreSQL URL should be assigned to `DATABASE_URL`; do not paste it directly into source files, tests, logs, or frontend code because it includes the database password.

Do not commit real database URLs, passwords, JWT secrets, or application secret keys. The login page is a standalone frontend and does not require browser or server authentication keys.

## Prisma workflow

`prisma.config.js` points Prisma CLI commands at the schema, migration folder, and `DATABASE_URL`.


- `prisma/schema.prisma` is the source of truth for database models, relations, indexes, mapped table/column names, and the generated Prisma Client output path.
- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate:dev` creates and applies development migrations.
- `npm run prisma:migrate:deploy` applies committed Prisma migrations in deployment environments.



## API route naming

Versioned application API routes use the `/api/v1` prefix so clients can distinguish stable resource endpoints from server utility endpoints. Authentication backend routes have been removed; the standalone login frontend is served from `/auth/login`. The routes selected for `/api/v1` are the business-resource routes because they represent application behavior that may need future versioning:

- `GET|POST|PATCH /api/v1/consignments` and `GET|PATCH /api/v1/consignments/:consignmentNum`
- `GET|POST|PATCH /api/v1/leads` and `GET|PATCH /api/v1/leads/:id`
- `GET|POST /api/v1/archived/consignments` plus archive/restore sub-routes

The root discovery route `/` and operational health route `/health` are intentionally not versioned because they are infrastructure/status endpoints rather than business API resources.

## Dummy frontend

A lightweight static frontend lives in `frontend/`. The login page is standalone and can be served by Express at `/auth/login` or on its own origin for local frontend work.

Start the backend in one terminal:

```bash
npm start
```

Start the dummy frontend in another terminal:

```bash
npm run frontend
```

Open `http://127.0.0.1:5173/auth/login` or `http://localhost:3000/auth/login`. The login page does not call a backend authentication endpoint; clicking **Continue** opens the standalone admin page.

## Project layout

- `prisma/schema.prisma` contains the Prisma data model schema.
- `model/` contains Prisma model-name exports for code that needs stable model identifiers.
- `db/connection.js` contains lazy Prisma Client configuration helpers that use the generated client and PostgreSQL driver adapter.
- `middleware/` contains a small framework-neutral middleware composition helper.
- `utils/` contains JSON, logging, error-handling, and pagination helpers.
- `services/` contains MIS PDF and Excel workbook generation helpers.
- `server.js` contains a basic Express API with `/` and `/health` status endpoints, serves the standalone login frontend at `/auth/login`, and mounts resource routes under `/api/v1`.
- `frontend/` contains a standalone login/admin frontend and tiny Node.js static file server for local frontend testing.
- `test/` contains Node.js test runner coverage and reusable dashboard test data.
