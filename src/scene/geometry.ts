import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

/** A swept, twisting elliptical section; no external models or stock knot geometry. */
export function createRibbon(spiral = false, segments = 256, sides = 24) {
  const positions: number[] = [];
  const indices: number[] = [];
  const normal = new Vector3();
  const binormal = new Vector3();
  const point = (t: number) =>
    spiral
      ? new Vector3(
          (1.1 + t * 0.07) * Math.cos(t),
          (t - Math.PI * 2.4) * 0.24,
          (1.1 + t * 0.07) * Math.sin(t),
        )
      : new Vector3(
          1.55 * Math.sin(t),
          1.45 * Math.sin(2 * t),
          0.65 * Math.cos(t) + 0.2 * Math.sin(3 * t),
        );
  const length = spiral ? Math.PI * 4.8 : Math.PI * 2;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * length;
    const center = point(t);
    const tangent = point(t + 0.001)
      .sub(point(t - 0.001))
      .normalize();
    normal.crossVectors(tangent, new Vector3(0, 0, 1)).normalize();
    binormal.crossVectors(tangent, normal).normalize();
    const twist = spiral ? t * 0.5 : t + 0.4 * Math.sin(t * 3);
    const width = spiral ? 0.4 : 0.48 + 0.13 * Math.cos(2 * t);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const u = Math.cos(a) * width;
      const v = Math.sin(a) * (spiral ? 0.085 : 0.16);
      const x = u * Math.cos(twist) - v * Math.sin(twist);
      const y = u * Math.sin(twist) + v * Math.cos(twist);
      positions.push(
        center.x + normal.x * x + binormal.x * y,
        center.y + normal.y * x + binormal.y * y,
        center.z + normal.z * x + binormal.z * y,
      );
      if (i < segments && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(
          k,
          k + 1,
          k + sides + 1,
          k + 1,
          k + sides + 2,
          k + sides + 1,
        );
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createDistortion(segments = 128, rings = 80) {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const v = (i / rings) * Math.PI;
    for (let j = 0; j <= segments; j++) {
      const u = (j / segments) * Math.PI * 2;
      const r =
        1.35 +
        0.21 * Math.sin(3 * u + Math.sin(v * 4)) * Math.sin(v) ** 2 +
        0.13 * Math.cos(v * 5);
      positions.push(
        r * Math.sin(v) * Math.cos(u),
        r * Math.cos(v) * 1.18,
        r * Math.sin(v) * Math.sin(u),
      );
      if (i < rings && j < segments) {
        const k = i * (segments + 1) + j;
        indices.push(
          k,
          k + segments + 1,
          k + 1,
          k + 1,
          k + segments + 1,
          k + segments + 2,
        );
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
