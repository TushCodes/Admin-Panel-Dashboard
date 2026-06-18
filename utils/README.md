# Utils MVP

The `utils/` folder is intentionally small. It only contains shared helpers needed for current API routing, frontend/backend response handling, JSON request parsing, logging, and database connection guards.

## Public entry points

- `utils/index.js` is the main barrel export for active shared helpers.
- `utils/json.js` is a minimal compatibility barrel for JSON request parsing.

## Included utility areas

- API response envelopes through `jsonResponse`, `errorResponse`, and `APIResponse`.
- Minimal JSON request-body parsing through `parseJsonBody`.
- Express async error forwarding through `asyncHandler`.
- Application error classes plus `handleException` for consistent error payloads.
- Minimal namespaced console logging through `getLogger`.
- Database configuration guards through `ensureDatabaseConnectionEnabled`.

Pagination helpers and PDF/Excel converter utilities are not part of the current MVP utility layer.
