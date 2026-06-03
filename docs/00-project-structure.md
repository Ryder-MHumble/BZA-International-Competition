# Project Structure

## Purpose

Create a project that can support both the high-design public registration experience and the business backend needed to collect and operate registrations.

## Root Layout

```text
beijing-youth-ai-registration-site/
  frontend/
    public-site/                 # Main public bilingual registration website
    admin-console/               # Future operator UI for registrations/content
    shared-ui/                   # Reusable visual primitives, tokens, motion helpers
  backend/
    src/
      modules/
        public/                  # Public route grouping only; delegates to domain modules
        catalog/                 # Current season, tracks, registration-open state
        registrations/           # Public registration intake and admin read/export
        review/                  # Lightweight registration status changes and notes
        admin/                   # Admin auth/permissions/session boundaries
        content/                 # FAQ/partners/page copy only if made dynamic
        notifications/           # Deferred: email/SMS hooks and outbox workers
        health/                  # Health and readiness endpoints
      database/                  # Simple DB boundary, migrations, seeds
      infra/                     # Mail, queue/outbox, logger, storage adapters
      common/                    # Cross-cutting errors, logging, validation
    tests/
  shared/
    contracts/                   # Shared DTOs/schemas between frontend and backend
    openapi/                     # API contract drafts/spec
  docs/
  infra/
  scripts/
```

## Why This Shape

- `frontend/public-site` keeps the public visual experience independent from backend and admin work.
- `frontend/admin-console` is reserved because registration data operation is a real product need, even if it is not in the visual spec.
- `shared/contracts` prevents frontend Zod validation and backend validation from drifting.
- `backend/modules/catalog` avoids hardcoding event year, tracks, and open/closed registration state into the submit endpoint.
- `backend/modules/registrations` is the first true business module; visual sections should not hide that the product succeeds only when data is safely collected.
- `backend/modules/review` is intentionally lightweight so v1 does not become a full judging platform.
- `docs` captures decisions missing from the original UI-only spec so implementation agents do not invent conflicting backend rules.
