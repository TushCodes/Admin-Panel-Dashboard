# Admin-Panel-Dashboard

JavaScript-based application foundation for the Admin Panel Dashboard. The codebase has been migrated away from Python/Flask-style modules to framework-neutral JavaScript modules that can be used from Node.js services, serverless handlers, or a future web framework.

## Runtime

- Node.js 20+
- npm 10+

Install dependencies and run tests:

```bash
npm install
npm test
```

This repository currently uses Node.js built-ins for the included report-generation services, so `npm install` creates the lockfile without third-party runtime packages.

## Database connection

Provide `DATABASE_URL` and `SECRET_KEY` when enabling the production database path.

The application reads the database URL lazily only when a database connection is requested, so the configured value is propagated only for the active DB connection path and is not stored in source code.

- `DATABASE_URL`
- `SECRET_KEY`

Do not commit real database URLs, passwords, or application secret keys. Keep those values in Render environment variables or another deployment secret store.

## Project layout

- `model/` contains JavaScript data model classes and schema metadata.
- `db/connection.js` contains lazy database configuration helpers.
- `middleware/` contains framework-neutral authentication and login rate-limit middleware.
- `utils/` contains JSON, logging, error-handling, and pagination helpers.
- `services/` contains MIS PDF and Excel workbook generation helpers.
- `test/` contains Node.js test runner coverage and reusable dashboard test data.
