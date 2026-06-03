# International Youth AI Future Summit Registration

Front/back-end separated local prototype for the `国际少年AI未来峰会 / International Youth AI Future Summit` registration website.

Source specifications:

- `/Users/sunminghao/Desktop/国际少年AI未来峰会_报名网页_PRD.docx`
- `/Users/sunminghao/Desktop/v2设计文档.md`
- `/Users/sunminghao/Desktop/北京少年人工智能学院-国际AI赛事报名网站.md`

## Current Scope

- Bilingual public site with PRD-aligned hero, organizer copy, three highlight cards, core activities, five-step registration, searchable FAQ and success state.
- V2 "language of light" interaction system: lazy-loaded Three/WebGL light field, continuous scroll progress, CSS fallbacks and mobile adaptation.
- Five-step registration flow: profile, school/org, contact, technical background and confirmations.
- Local draft autosave/reset in `localStorage`; one email can submit one application.
- URL-only material submission and preview cards for the local prototype; no real file upload or payment flow.
- Local JSON backend for development testing, PRD field validation, email outbox queue and CSV export.
- Admin dashboard with stats, filters/search, CSV export, PRD field detail view, URL preview, quick previous/next switching and statuses `submitted/reviewed/contacted`.

## Run Locally

```bash
npm install
npm run dev:backend
npm run dev:public
npm run dev:admin
```

Default URLs:

- Public site: `http://localhost:5173`
- Admin console: `http://localhost:5174`
- API: `http://localhost:3000`

Default local admin credentials:

- Username: `admin`
- Password: `admin123`

## Verify

```bash
npm run verify
```

This runs structure checks, backend API tests, shared types and frontend builds.
