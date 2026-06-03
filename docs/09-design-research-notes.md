# Design Research Notes

## Reference Use

Research is used for implementation technique, not for copying UI. The chosen direction keeps the original Markdown's premium visual intent while avoiding the screenshot's literal UI.

## Technique References

- GSAP ScrollTrigger documentation informs the scroll-progress orchestration pattern for future section and WebGL timing.
- Three.js WebGLRenderer documentation informs the current transparent renderer, antialiasing, pixel-ratio and graceful fallback strategy.
- MDN URL API documentation informs URL validation and parsing behavior for the material preview module.

## Current Implemented Direction

- Public site: bright academic futurism with a real Three.js particle field, editorial typography, large spacing, asymmetric hero copy, soft glass registration shell, and mobile responsive form steps.
- Registration form: componentized steps with an independent URL material validation/preview module.
- Admin console: calmer operations cockpit with the same color discipline, compact data density, status badges, quick switching, and embedded URL material preview.

## Future Motion Layer

The current WebGL layer already morphs by scroll progress. The next fidelity step is to move morph math into custom GLSL shaders and use GSAP ScrollTrigger as the global timing authority.
