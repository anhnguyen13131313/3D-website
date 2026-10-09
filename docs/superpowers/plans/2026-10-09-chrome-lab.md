# CHROME//LAB Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a sculptural, cinematic digital exhibition with an exceptional hero.
**Architecture:** Semantic React content above one fixed R3F Canvas. Shared mutable section progress connects GSAP and the frame loop. Declarative procedural geometry owns all visual assets.
**Tech Stack:** React 19, TypeScript, Vite, Fiber 9, Drei 10, compatible Three, GSAP.
**Spec:** docs/superpowers/specs/2026-10-09-chrome-lab-design.md

## Global constraints
Palette: #080809, #101012, #F1F0EC, #969699, #FF387D. Local fonts. One Canvas, no bloom, DPR capped. Native interactive controls and dialog. Reduced motion and WebGL fallback. Preserve untracked installed skills.

## Review focus
Mobile overflow; failed WebGL; reduced-motion changes at runtime; dialog keyboard/focus; repeated StrictMode effects.

### Task 1: Hero
Files: src/App.tsx, src/index.css, src/App.css, src/scene/geometry.ts, src/scene/Sculpture.tsx, src/scene/Studio.tsx, src/scene/SceneCanvas.tsx, public/fonts, index.html.
Interfaces: SceneCanvas receives artwork index, material, reduced-motion state, mutable MotionState, and loading callback. Geometry factories return BufferGeometry owned by declarative meshes.
- [x] Install matching peers and fonts; build the procedural ribbon and studio environment.
- [x] Build responsive navigation, monumental hero, material control, loading/fallback state.
- [x] Inspect hero in browser and adjust composition, lighting, scale.

### Task 2: Exhibition and finale
Files: src/components/Exhibition.tsx, src/components/Inspector.tsx, src/hooks/useExperienceMotion.ts, src/hooks/useReducedMotion.ts, src/data/artworks.ts, scene files, CSS.
Interfaces: artwork buttons call onSelect(index); Inspector receives open and onClose; scroll model has hero, gallery, finale numeric values.
- [x] Add distinct procedural artwork geometry and gallery selection.
- [x] Add section-owned ScrollTriggers and damped camera/object progression.
- [x] Add accessible dialog inspection and finale return action.

### Task 3: Verification and documentation
Files: README.md, docs/superpowers/progress.md.
- [x] Inspect desktop, 390px mobile, gallery selection, inspection/Escape, and reduced motion. Review WebGL fallback in source; unavailable hardware not reproduced.
- [x] Run npm run lint and npm run build; resolve material failures.
- [x] Document architecture, rendering and animation in Vietnamese; mark completed stages.

Visual changes use browser verification; no unit tests for cosmetic implementation. Add focused automated browser checks for meaningful interaction and accessibility behavior.
