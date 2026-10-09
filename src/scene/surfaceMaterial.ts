import { Color } from "three";
import type { MeshPhysicalMaterial } from "three";
import { artworkSurfaces } from "../data/surfaces.ts";
import type { SurfaceSettings } from "../data/surfaces.ts";

const colors = artworkSurfaces.map((surface) => new Color(surface.color));
// These features stay compiled. An effectively opaque surface still costs a
// transmission pass, in exchange for uninterrupted edits across the zero point.
const FEATURE_FLOOR = 0.00001;

export function applySurface(
  material: MeshPhysicalMaterial,
  surface: SurfaceSettings,
) {
  material.color.set(surface.color);
  material.roughness = surface.roughness;
  material.clearcoatRoughness = Math.max(0.04, surface.roughness * 0.55);
  material.metalness = surface.metalness;
  material.transmission = Math.max(FEATURE_FLOOR, surface.transmission);
  material.iridescence = Math.max(FEATURE_FLOOR, surface.iridescence);
}

/** Linear-light color and physical parameters follow the same shape weights. */
export function applyArtworkSurface(
  material: MeshPhysicalMaterial,
  weights: Float32Array,
) {
  material.color.setRGB(0, 0, 0);
  let roughness = 0,
    metalness = 0,
    transmission = 0,
    iridescence = 0;
  for (let i = 0; i < 3; i++) {
    material.color.r += colors[i].r * weights[i];
    material.color.g += colors[i].g * weights[i];
    material.color.b += colors[i].b * weights[i];
    roughness += artworkSurfaces[i].roughness * weights[i];
    metalness += artworkSurfaces[i].metalness * weights[i];
    transmission += artworkSurfaces[i].transmission * weights[i];
    iridescence += artworkSurfaces[i].iridescence * weights[i];
  }
  material.roughness = roughness;
  material.clearcoatRoughness = Math.max(0.04, roughness * 0.55);
  material.metalness = metalness;
  material.transmission = Math.max(FEATURE_FLOOR, transmission);
  material.iridescence = Math.max(FEATURE_FLOOR, iridescence);
}
