import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DoubleSide, Mesh, MeshPhysicalMaterial } from "three";
import { createMorphGeometry } from "./morphGeometry";
import { advanceMorph, createMorphState, retargetMorph } from "./morph";
import { applyArtworkSurface, applySurface } from "./surfaceMaterial";
import type { SurfaceSettings } from "../data/surfaces";

export function Sculpture({
  artwork = 0,
  surface,
  reduced,
}: {
  artwork?: number;
  surface: SurfaceSettings | null;
  reduced: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const physical = useRef<MeshPhysicalMaterial>(null);
  const geometry = useMemo(() => createMorphGeometry(), []);
  const morph = useRef(createMorphState(artwork));
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    mesh.current!.updateMorphTargets();
  }, [geometry]);
  useLayoutEffect(() => {
    retargetMorph(morph.current, artwork);
    advanceMorph(morph.current, 0, reduced);
    invalidate();
  }, [artwork, reduced, invalidate]);
  useLayoutEffect(() => {
    invalidate();
  }, [surface, invalidate]);

  useFrame((_, delta) => {
    const object = mesh.current;
    const material = physical.current;
    if (!object?.morphTargetInfluences || !material) return;
    const active = advanceMorph(morph.current, Math.min(delta, 0.05), reduced);
    const weights = morph.current.weights;
    object.morphTargetInfluences[0] = weights[1];
    object.morphTargetInfluences[1] = weights[2];
    if (surface) applySurface(material, surface);
    else applyArtworkSurface(material, weights);
    if (active) invalidate();
  });

  return (
    <mesh ref={mesh}>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial
        ref={physical}
        color="#c4c6cc"
        metalness={1}
        roughness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.08}
        iridescence={0.12}
        iridescenceIOR={1.4}
        iridescenceThicknessRange={[100, 500]}
        transmission={0.00001}
        thickness={1.2}
        ior={1.6}
        envMapIntensity={1.4}
        side={DoubleSide}
      />
    </mesh>
  );
}
