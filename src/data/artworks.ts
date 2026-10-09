export const artworks = [
  {
    title: "Continuum",
    kind: "Liquid chrome",
    year: "2026",
    description:
      "A single surface. An impossible return. A study of tension, reflection, and the space in between.",
    detail: "Folded surface / polished chromium",
    number: "001",
  },
  {
    title: "Soft distortion",
    kind: "Iridescent glass",
    year: "2026",
    description:
      "Something familiar, becoming something else. Light bends around a form that refuses to settle.",
    detail: "Organic volume / spectral glass",
    number: "002",
  },
  {
    title: "Afterimage",
    kind: "Brushed titanium",
    year: "2026",
    description:
      "An echo made physical. Repetition becomes rhythm as a ribbon unwinds into an open spiral.",
    detail: "Helical surface / satin titanium",
    number: "003",
  },
] as const;

export type MaterialMode = "chrome" | "glass";
export type MotionState = {
  hero: number;
  gallery: number;
  finale: number;
  stage?: { x: number; y: number; width: number; height: number };
};
