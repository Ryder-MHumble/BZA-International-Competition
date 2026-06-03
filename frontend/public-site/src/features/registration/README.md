# Registration Feature

Owns the four-step registration flow:

1. Identity information.
2. Track selection.
3. Guardian consent and URL material links.
4. Confirmation and privacy consent.

## Current Rules

- Age range: 13-16 inclusive.
- Guardian consent is required.
- One student email can submit only one registration.
- No team or advisor fields in v1.
- At least one URL material is required; the backend accepts only `http` and `https` URLs.

## Component Split

- `IdentityStep.tsx`
- `TrackStep.tsx`
- `MaterialsStep.tsx`
- `ConfirmStep.tsx`
- `materialPreview.ts`
- `types.ts`
- `constants.ts`

Keep validation semantics aligned with `shared/contracts/registration.schema.ts` and backend validation in `backend/src/server.mjs`.
