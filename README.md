# Admin Panel Dashboard

MVP JavaScript admin dashboard with a small Express API, Prisma database access, and a static Vue frontend.

## Runtime

- Node.js 20+
- npm 10+

```bash
npm install
npm run prisma:generate
npm test
npm start
```

The server starts from `server.js` and listens on `PORT` (default `3000`) and `HOST` (default `0.0.0.0`).

## Configuration

Copy `.env.example` to `.env` and set these values when using the database-backed API:

- `DATABASE_URL`

The Prisma client is created lazily, so local frontend/static checks can run without a database. Do not commit real database URLs or passwords.

## API routes

- `GET /consignments/aggregated-consignments`
- `GET|POST /leads`, `GET|PATCH /leads/:id`
- `GET|POST /documents`, `GET|PATCH /documents/:id`
- `GET /health`

## Frontend

The static MVP frontend lives in `frontend/` and is served by the main Express app:

- `/auth/login`
- `/admin`
- `/admin/consignments`
- `/admin/lead`
- `/admin/documents`

For frontend-only local work, run:

```bash
npm run build:frontend
```

To smoke-test the database connection, run:

```bash
npm run test:db
```

## Prisma workflow

- `models/schema.prisma` is the source of truth for the database model.
- `npm run prisma:generate` regenerates Prisma Client after schema changes.
- `npm run prisma:migrate:dev` creates and applies development migrations.
- `npm run prisma:migrate:deploy` applies committed migrations in deployment environments.

## Onboarding / KT

This branch includes a structured knowledge-transfer path for junior and frontend-leaning developers in [`docs/knowledge-transfer.md`](docs/knowledge-transfer.md). Use it as the recommended sequence for setup, request-lifecycle walkthroughs, backend/frontend boundaries, Prisma workflow, testing expectations, debugging, and capstone exercises.

## Project layout

- `server.js` creates the Express app, serves the frontend, and mounts routes.
- `routes/` defines resource endpoints and delegates data access to controllers.
- `api/` contains the external API integration scaffold that prepares data for aggregation.
- `controllers/` contains resource handlers.
- `db/` contains lazy Prisma connection helpers.
- `frontend/` contains the static Vue MVP screens.
- `services/` contains dashboard aggregation helpers used by tests and the frontend.
- `utils/` contains shared API response, JSON parsing, error, logging, and database connection helpers.
- `test/` contains Node.js test runner coverage.
