# Backend

Backend responsibility: make registrations reliable, inspectable, exportable, and safe.

Suggested stack: TypeScript API service, schema validation, PostgreSQL/SQLite development database, OpenAPI contract, and focused tests.

## First Modules

- `registrations`: public submission, admin list/detail/export.
- `content`: static/dynamic event content boundary.
- `admin`: authentication and permissions when requested.
- `health`: service health checks.
- `notifications`: deferred integration point.
