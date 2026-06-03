# Current Business Rules

These rules supersede the earlier scaffold assumptions.

## Data Source Boundary

- The attached screenshots are used only as information references for activities, FAQ topics, and registration fields.
- Screenshot UI layout, card styling, spacing, and visual treatment must not be copied.
- Public UI/UX remains based on the original Markdown design direction: bright academic futurism, asymmetric composition, scroll-driven motion, WebGL-like light field, high polish, and mobile adaptation.

## Registration Rules

- Age range is temporarily 13-16 inclusive.
- Guardian consent is required for every applicant.
- One student email can submit only one registration.
- One person can apply only once; the enforceable v1 rule is email uniqueness.
- No team registration and no advisor/teacher fields in v1.
- No payment and no money-related fields in v1.

## Submitted Materials

- Students submit URL materials instead of uploading original files.
- At least one URL is required; the prototype allows up to six.
- URLs must use `http` or `https`.
- The public form generates a client-side preview card showing validity and hostname.
- The admin detail page renders URL preview cards with iframe preview, open-in-new-tab, and copy-link actions.

## Admin Dashboard

- Admin status model is: `submitted`, `reviewed`, `contacted`.
- Dashboard supports counts, filtering, search, CSV export, student list, detail page, URL material preview, status update, notes, and quick previous/next switching.
- Local admin login uses development credentials and bearer token only for testing.

## Local Backend Storage

- Backend uses local JSON files for development and testing:
  - `backend/data/catalog.json`
  - `backend/data/dev-db.json`
- Writes use temporary-file then rename replacement to reduce JSON corruption risk.
- This is not intended for production or multi-user concurrent deployment.

## Email

- Registration success email is represented as a rendered template and queued in `outbox`.
- The local prototype does not send real SMTP mail yet.
- Template file: `backend/templates/registration-success-email.txt`.
