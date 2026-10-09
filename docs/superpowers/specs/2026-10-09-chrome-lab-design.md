# CHROME//LAB design

An experimental digital exhibition for visitors who want to explore sculptural materials. Success means an immediately distinctive hero, responsive live 3D, a coherent scroll narrative, and usable controls on desktop, touch, keyboard, and reduced-motion devices.

## Art direction
Digital foundry: monumental condensed typography behind a custom folded chrome sculpture, with disciplined laboratory captions and pink interaction marks. Carbon #080809, charcoal #101012, chalk #F1F0EC, silver #969699, pink #FF387D. Locally hosted Anton for display and Space Grotesk for text. Left-aligned asymmetric composition, generous negative space, no bloom or ornamental particles.

## Narrative
Hero: “Matter without limits.” A parametric folded ribbon occupies the right two-thirds, overlaps display type, and reacts to pointer position with damping. A compact material switch changes chrome to iridescent glass. Entry content is readable before the scene loads.
Exhibition: three material studies (Continuum, Soft distortion, Afterimage), each with distinct custom geometry, selectable using native buttons. A shared fixed Canvas presents the active artwork. Inspect opens a native modal with OrbitControls and resets on close. Escape and focus restoration are native dialog behavior.
Finale: “Stay curious.” The initial ribbon returns enlarged behind the closing statement. A return-to-start action completes the narrative; no invented external contact details.

## Architecture and motion
App owns selected artwork/material/inspection state. SceneCanvas owns one renderer. Sculpture owns parametric geometry and materials; Studio owns one procedurally captured reflection environment. SceneRig reads a shared mutable scroll model in useFrame, never React state per frame. GSAP ScrollTrigger writes normalized section values; all triggers and listeners clean up on unmount. Entrance: 0.85s with 0.1s stagger. Pointer damping: 5/s, maximum yaw 0.25rad and pitch 0.12rad. Camera moves from z=8.5 to z=7.5 through the hero. Gallery and finale blend over section boundaries.

## Resilience and performance
Keep React 19, Fiber 9 and compatible Drei/Three peers. The cinematic skill's three@0.136.0 pin conflicts with Fiber 9's >=0.156 peer requirement; use compatible current Three instead. DPR <=1.5 desktop / 1.25 mobile; no postprocessing, external models, or HDR requests. Procedural geometry and studio environment are generated locally. Visibility suspends rendering; reduced motion uses demand rendering and removes pointer/scroll interpolation and entrance animation. Canvas loading and failure leave the full HTML exhibition usable; a CSS sculpture silhouette supplies fallback artwork. Mobile simplifies layout and camera framing. Test at 390px and desktop, check keyboard controls, modal Escape, selection, no horizontal overflow, reduced motion, and production build.
