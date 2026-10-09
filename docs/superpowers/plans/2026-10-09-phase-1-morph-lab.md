# Phase 1: morphing and initial Shader Lab

User clarification: Phase 1 includes morphing plus a first Shader Lab. Preserve the page, studio lighting, scroll rig, material buttons and existing dialog/renderer lifecycle. Work in place with existing uncommitted work intact.

## Design

Retain #101012 / #080809 / #F1F0EC / #969699 / #FF387D and the existing Anton/Space Grotesk typography. Add a single Surface lab entry beside material controls. Extend the native inspection dialog with a disciplined right-hand material panel (bottom panel on mobile), keeping the artwork large and selectable. No new page sections.

One persistent mesh uses built-in Three GPU morph targets for positions and normals. Resample three existing sculptural definitions to the same 192×48 indexed grid; bake each original orientation into its target. Blend three normalized weights with a 1.3-second smootherstep curve. Retarget from current weights, preserve geometry identity, and snap under reduced motion. Keep scroll/pointer transformations on the parent group. Sphere poles and loop/open-spiral boundaries can fold or intersect in intermediate shapes; this is an artistic interpolation rather than a physics/topology solver. New imported meshes require compatible vertex correspondence.

Material presets: Mercury, Prism, Pink porcelain, Titanium. Controls: tint, roughness, metalness, transmission and iridescence. The initial/default material follows the artwork. An explicit preset or edit overrides it until Reset material; overrides persist across form changes. Range limits 0–1, tint hex RGB. Blend surface values along with shape transitions, but apply slider/color input immediately. Material compilation keeps transmission supported to avoid shader rebuild on each drag.

## Tasks

- [x] Add failing Node tests for target compatibility, conservative bounds, morph endpoint/retarget/reduced behavior, and material validation/presets.
- [x] Implement compatible geometry, pure transition controller and tested material helpers.
- [x] Integrate one persistent mesh, GPU weights and live physical material without rebuilding geometry on selection.
- [x] Add responsive Shader Lab and form controls to the existing dialog, retaining Escape/focus and one renderer.
- [x] Browser inspect desktop/mobile, rapid retarget, sliders/presets, reduced motion and existing navigation/material controls.
- [x] Run test, lint and production build; document state/render/morph flows and limitations in Vietnamese.

## Review and verification

Source review found a repeated material-version invalidation when default surface values were reset through zero every frame. Replaced it with numeric accumulation and stable epsilon feature values in surfaceMaterial.ts. A regression test failed with the old zero reset (material version 6 versus expected 2) and passed after restoration. Seven Node tests pass. Production build and oxlint pass. Browser checked at desktop and 390 CSS pixels: continuous retargeting, presets/hex/all sliders, persistent overrides, Reset, one Canvas, Escape/focus, reduced motion with visible live edits and no horizontal overflow. No runtime errors observed; vendor THREE.Clock deprecation remains. GPU performance on low-end hardware was not benchmarked.
