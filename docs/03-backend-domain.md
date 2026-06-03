# Backend Domain Logic

## Backend Responsibility

The backend makes the registration experience operationally real during local testing. It receives, validates, stores, exports, and exposes registration data through local JSON files.

## Current Scope

- Ages 13-16 only.
- Guardian consent is required.
- One normalized student email can submit only one application.
- One applicant can apply once; v1 enforces this by email uniqueness.
- No team registration, advisor, payment, judging, or file upload in v1.
- Submitted materials are external URLs, not uploaded files.
- Admin statuses are `submitted`, `reviewed`, and `contacted`.

## Local Storage

- `backend/data/catalog.json`: season, activities, tracks, registration-open state, contact email.
- `backend/data/dev-db.json`: registrations, status logs, email index, notification outbox.
- Writes use a temp-file then rename replacement pattern.
- This storage is for local development only, not production concurrency.

## Core Domain Model

### Registration

- `id`
- `seasonCode`
- `trackCode`
- `trackName`
- `status`: `submitted`, `reviewed`, `contacted`
- `studentName`
- `age`
- `studentEmail`
- `phone`
- `locationText`
- `guardianName`
- `guardianRelationship`
- `guardianPhone`
- `guardianEmail`
- `guardianConsent`
- `guardianConsentAt`
- `materials`: URL material records
- `submissionSummary`
- `privacyAgreed`
- `privacyAgreedAt`
- `privacyConsentVersion`
- `locale`
- `source`
- `dedupeKey`
- `emailSentStatus`
- `createdAt`
- `updatedAt`
- `submittedAt`

### URL Material

- `id`
- `title`
- `url`
- `kind`: `project`, `video`, `code`, `portfolio`, `document`, `other`
- `description`
- `hostname`
- `previewStatus`
- `previewTitle`

### RegistrationStatusLog

- `id`
- `registrationId`
- `fromStatus`
- `toStatus`
- `operatorId`
- `note`
- `createdAt`

### NotificationOutbox

- `id`
- `registrationId`
- `type`: `registration_success_email`
- `channel`: `email`
- `to`
- `status`
- `retryCount`
- `subject`
- `body`
- `createdAt`
- `updatedAt`

## API Surface

Public:

- `GET /api/health`
- `GET /api/v1/public/season/current`
- `POST /api/v1/public/registrations`

Admin:

- `POST /api/v1/admin/session`
- `GET /api/v1/admin/registrations`
- `GET /api/v1/admin/registrations/:id`
- `PATCH /api/v1/admin/registrations/:id/status`
- `GET /api/v1/admin/registrations/export.csv`

## Validation Rules

- `studentName`, `age`, `studentEmail`, `locationText`, `trackCode`, guardian fields, `guardianConsent`, `materials`, and `privacyAgreed` are required.
- Age must be an integer between 13 and 16 inclusive.
- Email is normalized to lower case and must be unique.
- Track must exist and be enabled.
- At least one material URL is required; up to six are accepted.
- URL protocol must be `http` or `https`.
- Status updates cannot move backward in v1.
