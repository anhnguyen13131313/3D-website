export type SurfaceSettings = {
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  iridescence: number;
};
export type SurfacePreset = SurfaceSettings & {
  id: string;
  name: string;
  note: string;
};

export const surfacePresets: readonly SurfacePreset[] = [
  {
    id: "chrome",
    name: "Mercury",
    note: "Cold, liquid reflection",
    color: "#c4c6cc",
    roughness: 0.15,
    metalness: 1,
    transmission: 0,
    iridescence: 0.12,
  },
  {
    id: "glass",
    name: "Prism",
    note: "Light through spectral glass",
    color: "#afb5e7",
    roughness: 0.13,
    metalness: 0.28,
    transmission: 0.65,
    iridescence: 1,
  },
  {
    id: "ceramic",
    name: "Pink porcelain",
    note: "Warm, lacquered pigment",
    color: "#ff387d",
    roughness: 0.28,
    metalness: 0.05,
    transmission: 0,
    iridescence: 0,
  },
  {
    id: "titanium",
    name: "Titanium",
    note: "Soft, satin reflections",
    color: "#a5a9b4",
    roughness: 0.38,
    metalness: 0.9,
    transmission: 0,
    iridescence: 0.25,
  },
];

export const artworkSurfaces = [
  surfacePresets[0],
  surfacePresets[1],
  surfacePresets[3],
];
export type SurfaceProperty = Exclude<keyof SurfaceSettings, "color">;

export function sanitizeSurface(input: SurfaceSettings): SurfaceSettings {
  const unit = (value: number) =>
    Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return {
    color: /^#[0-9a-f]{6}$/i.test(input.color)
      ? input.color.toLowerCase()
      : "#c4c6cc",
    roughness: unit(input.roughness),
    metalness: unit(input.metalness),
    transmission: unit(input.transmission),
    iridescence: unit(input.iridescence),
  };
}
