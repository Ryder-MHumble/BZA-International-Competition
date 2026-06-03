# Frontend

Frontend code is split into public and operator surfaces.

## Folders

- `public-site`: the high-design public bilingual registration website.
- `admin-console`: future operator dashboard for viewing/exporting registrations.
- `shared-ui`: shared tokens, primitives, and motion conventions used across front-end surfaces.

## Public Site Priorities

1. Preserve the source spec's editorial, asymmetric, high-spatial design.
2. Build form and accessibility before heavy WebGL polish.
3. Keep WebGL decorative and degradable.
4. Store all public copy in locales/content, not hardcoded throughout components.
