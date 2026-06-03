# Implementation Roadmap

## Phase 1: Contracts And Static Skeleton

- Finalize registration fields in `shared/contracts`.
- Build public site shell, token system, bilingual content, and all sections without heavy animation.
- Create backend health endpoint and registration validation boundary.

## Phase 2: Registration Closure

- Implement public registration submit API.
- Persist registration records.
- Add admin list/detail/export path.
- Connect front-end form to backend with error, loading, and success states.

## Phase 3: Motion And WebGL

- Add Lenis and ScrollTrigger orchestration.
- Implement section reveal timelines.
- Add WebGL particle system with reduced-motion, no-WebGL, and low-FPS fallbacks.
- Keep form usability stable while adding the visual layer.

## Phase 4: Quality Gate

- API tests for validation, duplicate policy, and admin export.
- Browser checks for desktop/mobile, keyboard navigation, reduced motion, and registration submission.
- Performance review for LCP, CLS, frame rate, and WebGL degradation.
