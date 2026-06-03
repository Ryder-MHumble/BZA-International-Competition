# Requirements Understanding

## Source Boundaries

- Original Markdown remains the UI/UX design specification.
- Screenshots are used only for data hints such as activity names, FAQ topics, and form field ideas.
- Screenshot UI must not be copied.

## Current Product Scope

A bilingual-feeling public registration website plus a local admin dashboard for the Beijing Youth AI Academy international AI competition.

## Public User Flow

1. Visitor lands on a high-design hero with an academic-futurist particle environment.
2. Visitor reviews core activities and competition direction.
3. Visitor enters a four-step registration flow.
4. Student provides identity and contact information.
5. Student chooses one competition track.
6. Student provides guardian information and at least one material URL.
7. Student confirms privacy and guardian consent, then submits.
8. Backend stores the registration in local JSON and queues a success email template.

## Admin Flow

1. Admin logs into the local dashboard.
2. Admin reviews counts and filters by `submitted`, `reviewed`, or `contacted`.
3. Admin opens a registration detail view.
4. Admin previews submitted URLs, opens/copies links, updates status, and moves to previous/next student quickly.
5. Admin exports CSV when needed.

## Current Business Rules

- Age range: 13-16 inclusive.
- Guardian consent required.
- One normalized email equals one applicant and one application.
- No team registration and no advisor field.
- No payment flow.
- URL materials replace file uploads for development simplicity.
- Mobile adaptation is required and animation can remain enabled with reduced-motion fallback.
