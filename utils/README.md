# Utils MVP

The `utils/` folder is the shared MVP utility layer for the Admin Panel Dashboard. It provides small, dependency-light helpers that can be used by routes, controllers, tests, and future services without pulling in application-specific state.

## Public entry points

- `utils/index.js` is the main barrel export for all shared helpers.
- `utils/json.js` keeps the JSON-focused compatibility barrel.
- `utils/pagination/index.js` exports pagination constants, parsing, filtering, sorting, and response helpers.

## Included utility areas

- API response envelopes through `jsonResponse`, `errorResponse`, and `APIResponse`.
- Request and serialization helpers through `parseJsonBody`, `toJson`, `fromJson`, and `JsonUtils`.
- Data normalization helpers through `DataNormalizer` and named functions.
- Express async error forwarding through `asyncHandler`.
- Application error classes plus `handleException` for consistent error payloads.
- Minimal namespaced console logging through `getLogger`.
- Database configuration guards through `ensureDatabaseConnectionEnabled`.
- In-memory pagination/filter/sort helpers for MVP endpoints and tests.

## Conventions

Keep utilities framework-light, deterministic, and safe for tests. Prefer named exports for new helpers and update the relevant barrel export when adding a utility module.
