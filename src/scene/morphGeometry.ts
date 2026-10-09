import { Euler, Matrix4, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { createDistortion, createRibbon } from "./geometry.ts";

function repairNormals(
  geometry: BufferGeometry,
  segments: number,
  sides: number,
  closed: boolean,
) {
  geometry.computeVertexNormals();
  const normals = geometry.getAttribute("normal");
  const positions = geometry.getAttribute("position");
  const normal = new Vector3();
  for (let i = 0; i < normals.count; i++) {
    normal.fromBufferAttribute(normals, i);
    if (normal.lengthSq() < 0.01) {
      normal.fromBufferAttribute(positions, i).normalize();
      normals.setXYZ(i, normal.x, normal.y, normal.z);
    }
  }
  const join = (a: number, b: number) => {
    normal
      .set(
        normals.getX(a) + normals.getX(b),
        normals.getY(a) + normals.getY(b),
        normals.getZ(a) + normals.getZ(b),
      )
      .normalize();
    normals.setXYZ(a, normal.x, normal.y, normal.z);
    normals.setXYZ(b, normal.x, normal.y, normal.z);
  };
  for (let i = 0; i <= segments; i++)
    join(i * (sides + 1), i * (sides + 1) + sides);
  if (closed)
    for (let j = 0; j <= sides; j++) join(j, segments * (sides + 1) + j);
}

/** All targets are generated before first render, with one index/vertex order. */
export function createMorphGeometry() {
  const segments = 192;
  const sides = 48;
  const targets = [
    createRibbon(false, segments, sides),
    createDistortion(sides, segments),
    createRibbon(true, segments, sides),
  ];
  const base = targets[0];
  targets.forEach((geometry, index) => {
    geometry.setIndex(base.index);
    repairNormals(geometry, segments, sides, index === 0);
    geometry.applyMatrix4(
      new Matrix4().makeRotationFromEuler(
        index === 2 ? new Euler(0.2, 0, -0.3) : new Euler(0, 0, -0.38),
      ),
    );
  });
  base.morphTargetsRelative = false;
  base.morphAttributes.position = targets
    .slice(1)
    .map((geometry) => geometry.getAttribute("position"));
  base.morphAttributes.normal = targets
    .slice(1)
    .map((geometry) => geometry.getAttribute("normal"));
  base.computeBoundingBox();
  base.computeBoundingSphere();
  base.boundingSphere!.radius *= 1.001;
  targets.slice(1).forEach((geometry) => geometry.dispose());
  return base;
}
