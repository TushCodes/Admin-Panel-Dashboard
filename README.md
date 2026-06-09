# Admin-Panel-Dashboard

## Database connection

The Render deployment should provide database secrets as environment variables.
The application reads `DATABASE_URL` lazily only when a SQLAlchemy engine or
session is created, so the deployment value is propagated only for the active DB
connection path and is not stored in source code.

Supported variable names:

- `DATABASE_URL` (preferred for Render)
- `SUPABASE_DB_URL` (local/project-specific fallback)

Do not commit real database URLs, passwords, or application secret keys. Keep
those values in Render environment variables or another deployment secret store.

## Updates

- Added a `model` folder for shared data model definitions.
- Added `model/dataModel.js` with basic `AdminUser` and `DashboardMetric` classes for dashboard data.
- Added `Consignment`, `Document`, and `Lead` data model classes with schema metadata for required, unique, and foreign-key fields.
