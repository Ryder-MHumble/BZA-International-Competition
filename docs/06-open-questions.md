# Open Questions

These are still intentionally unresolved.

## Identity And Eligibility

- Is email uniqueness sufficient for "one person can apply once", or should a stronger identity field be added later?
- What exact guardian consent copy should be displayed?
- Should guardian email become required?

## URL Materials

- What material types should be officially accepted: GitHub, video, document, personal site, cloud drive, or all public URLs?
- Should backend fetch metadata for URL previews, or should preview remain client-side only?
- Should unsafe or private-network URLs be blocked before production?

## Operations

- Who receives registration-success or admin-alert emails?
- Is a single local admin account enough for testing, or should multiple operator identities be added?
- Should CSV export include all guardian contact details by default?

## Visual Fidelity

- Should the current CPU-morphed Three.js particles be upgraded to custom GLSL shaders?
- Should GSAP ScrollTrigger become the global scroll progress authority in the next animation pass?
