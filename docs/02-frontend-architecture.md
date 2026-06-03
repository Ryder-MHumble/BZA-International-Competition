# Frontend Architecture

## Design Direction

A refined, editorial sci-tech experience: morning-fog base, luminous neural particles, serif hero typography, asymmetric composition, and deliberate negative space. The website must feel like a designed cultural/education event platform, not a generic SaaS landing page.

## Anti-Cheapness Rules

- Do not use centered card grids for the tracks section.
- Do not flatten the WebGL spec into a stock gradient hero.
- Do not use generic purple-on-white AI visual tropes as the main identity.
- Do not overfill sections; preserve large breathing space.
- Do not use linear easing for reveal or scroll-linked animation.
- Do not let visual effects block form completion, accessibility, or mobile performance.

## Public Site Structure

```text
frontend/public-site/src/
  app/                         # App shell and provider composition
  components/
    layout/                    # Nav, footer, scroll indicator
    interaction/               # Cursor, smooth-scroll anchors, focus helpers
    primitives/                # Button, field, accordion, language switch
  sections/                    # Loading, Banner, Vision, Tracks, Registration, FAQ, FooterScene
  features/
    registration/              # Form steps, schema bridge, submit flow, success state
    i18n/                      # i18next setup and language transition helpers
  webgl/
    scene/                     # Renderer/camera/root scene orchestration
    particles/                 # Particle system, connection layer, form states
    shaders/                   # GLSL files
    fallback/                  # Reduced-motion and no-WebGL CSS fallback
  animations/                  # GSAP timelines and ScrollTrigger registration
  hooks/                       # useLenis, useMouse, usePerformanceTier, useReducedMotion
  styles/                      # tokens.css, typography.css, globals.css
  content/                     # Static tracks, FAQ, partner, navigation metadata
  locales/                     # zh.json, en.json
```

## Frontend Milestones

1. Token system and static layout skeleton.
2. Bilingual content and language transition.
3. Registration form UX with Zod validation.
4. GSAP/Lenis scroll choreography.
5. WebGL particles with performance fallback.
6. Custom cursor and final micro-interactions.
7. Accessibility and mobile QA.
