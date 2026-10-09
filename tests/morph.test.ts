import test from "node:test";
import assert from "node:assert/strict";
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import {
  applyArtworkSurface,
  applySurface,
} from "../src/scene/surfaceMaterial.ts";
import { createMorphGeometry } from "../src/scene/morphGeometry.ts";
import {
  createMorphState,
  retargetMorph,
  advanceMorph,
} from "../src/scene/morph.ts";
import { sanitizeSurface, surfacePresets } from "../src/data/surfaces.ts";

test("every sculptural target shares vertex correspondence and usable normals", () => {
  const geometry = createMorphGeometry();
  const positions = [
    geometry.attributes.position,
    ...geometry.morphAttributes.position,
  ];
  const normals = [
    geometry.attributes.normal,
    ...geometry.morphAttributes.normal,
  ];
  for (const attribute of positions) {
    assert.equal(attribute.count, positions[0].count);
    assert.ok([...attribute.array].every(Number.isFinite));
  }
  for (const attribute of normals) {
    assert.equal(attribute.count, positions[0].count);
    for (let i = 0; i < attribute.count; i++) {
      const length = Math.hypot(
        attribute.getX(i),
        attribute.getY(i),
        attribute.getZ(i),
      );
      assert.ok(
        length > 0.95 && length < 1.05,
        `normal ${i} has length ${length}`,
      );
    }
  }
  assert.ok(geometry.index!.array.every((index) => index < positions[0].count));
  assert.notDeepEqual(positions[0].array, positions[1].array);
  assert.notDeepEqual(positions[1].array, positions[2].array);
  geometry.dispose();
});

test("the GPU morph matches target endpoints and stays within culling bounds", () => {
  const geometry = createMorphGeometry();
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);
  const point = new Vector3();
  for (let target = 0; target < 3; target++) {
    mesh.morphTargetInfluences![0] = target === 1 ? 1 : 0;
    mesh.morphTargetInfluences![1] = target === 2 ? 1 : 0;
    const attribute =
      target === 0
        ? geometry.attributes.position
        : geometry.morphAttributes.position[target - 1];
    for (let i = 0; i < attribute.count; i += 17) {
      mesh.getVertexPosition(i, point);
      assert.ok(
        point.distanceTo(new Vector3().fromBufferAttribute(attribute, i)) <
          0.00001,
      );
      assert.ok(geometry.boundingSphere!.containsPoint(point));
    }
  }
  geometry.dispose();
  material.dispose();
});

test("morph has a real midpoint, reaches its target and can return to the base", () => {
  const state = createMorphState(0);
  retargetMorph(state, 1);
  advanceMorph(state, 0.65);
  assert.ok(Math.abs(state.weights[0] - 0.5) < 0.00001);
  assert.ok(Math.abs(state.weights[1] - 0.5) < 0.00001);
  assert.equal(advanceMorph(state, 0.65), false);
  assert.deepEqual([...state.weights], [0, 1, 0]);
  retargetMorph(state, 0);
  advanceMorph(state, 2);
  assert.deepEqual([...state.weights], [1, 0, 0]);
});

test("rapid retarget starts at the currently visible shape, with no weight snap", () => {
  const state = createMorphState(0);
  const array = state.weights;
  retargetMorph(state, 1);
  advanceMorph(state, 0.4);
  const before = [...state.weights];
  retargetMorph(state, 2);
  advanceMorph(state, 0);
  assert.deepEqual([...state.weights], before);
  advanceMorph(state, 0.65);
  assert.ok(
    state.weights[0] > 0 && state.weights[1] > 0 && state.weights[2] > 0,
  );
  assert.ok(
    Math.abs(state.weights.reduce((sum, value) => sum + value, 0) - 1) <
      0.00001,
  );
  advanceMorph(state, 0.65);
  assert.deepEqual([...state.weights], [0, 0, 1]);
  assert.equal(state.weights, array);
});

test("reduced motion snaps even when enabled during a transition", () => {
  const state = createMorphState(0);
  retargetMorph(state, 1);
  advanceMorph(state, 0.3);
  advanceMorph(state, 0, true);
  assert.deepEqual([...state.weights], [0, 1, 0]);
});

test("surface inputs remain finite, bounded, and safe for physical materials", () => {
  const surface = sanitizeSurface({
    color: "invalid",
    roughness: -2,
    metalness: 3,
    transmission: NaN,
    iridescence: 0.5,
  });
  assert.equal(surface.color, "#c4c6cc");
  assert.equal(surface.roughness, 0);
  assert.equal(surface.metalness, 1);
  assert.equal(surface.transmission, 0);
  assert.equal(surface.iridescence, 0.5);
  for (const preset of surfacePresets)
    assert.deepEqual(sanitizeSurface(preset), {
      color: preset.color,
      roughness: preset.roughness,
      metalness: preset.metalness,
      transmission: preset.transmission,
      iridescence: preset.iridescence,
    });
});

test("surface blending and zero-value presets keep shader features stable", () => {
  const material = new MeshPhysicalMaterial();
  applySurface(material, surfacePresets[0]);
  const version = material.version;
  for (let step = 0; step <= 100; step++) {
    const t = step / 100;
    applyArtworkSurface(material, new Float32Array([1 - t, t, 0]));
    assert.equal(material.version, version);
    assert.ok(
      Math.abs(material.roughness - (0.15 * (1 - t) + 0.13 * t)) < 0.00001,
    );
  }
  for (const preset of surfacePresets) {
    applySurface(material, preset);
    assert.equal(material.version, version);
    assert.ok(material.color.equals(new Color(preset.color)));
    assert.ok(Math.abs(material.transmission - preset.transmission) <= 0.00001);
    assert.ok(Math.abs(material.iridescence - preset.iridescence) <= 0.00001);
  }
  material.dispose();
});
