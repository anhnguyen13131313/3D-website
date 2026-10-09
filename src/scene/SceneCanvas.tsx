import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Group, MathUtils } from "three";
import { Sculpture } from "./Sculpture";
import { Studio } from "./Studio";
import type { MotionState } from "../data/artworks";
import type { SurfaceSettings } from "../data/surfaces";
import { SceneBoundary } from "../components/SceneBoundary";

type SceneProps = {
  artwork: number;
  surface: SurfaceSettings | null;
  reduced: boolean;
  motion: RefObject<MotionState>;
  inspecting: boolean;
  portalTarget?: HTMLDivElement | null;
  onReady: () => void;
  onError: () => void;
};

function SceneRig({
  artwork,
  surface,
  reduced,
  motion,
  inspecting,
  onReady,
}: SceneProps) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport, invalidate, camera } = useThree();
  const mobile = viewport.width < 6;

  useLayoutEffect(() => {
    camera.position.set(0, 0, 8.5);
    camera.lookAt(0, 0, 0);
    if (inspecting) group.current?.rotation.set(0.1, 0.35, -0.12);
    invalidate();
  }, [inspecting, camera, invalidate]);

  useEffect(() => {
    onReady();
    invalidate();
  }, [onReady, invalidate]);
  useEffect(() => {
    if (!reduced) return;
    const update = () => invalidate();
    window.addEventListener("scroll", update, { passive: true });
    invalidate();
    return () => window.removeEventListener("scroll", update);
  }, [reduced, invalidate]);
  useEffect(() => {
    const update = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced)
      window.addEventListener("pointermove", update, { passive: true });
    return () => window.removeEventListener("pointermove", update);
  }, [reduced]);

  useFrame((_, delta) => {
    if (!group.current || inspecting) return;
    const dt = Math.min(delta, 0.05);
    const { hero, gallery, finale, stage } = motion.current;
    const exhibition = gallery * (1 - finale);
    const x =
      MathUtils.lerp(
        mobile ? 0 : viewport.width * 0.215,
        (stage?.x ?? -0.22) * viewport.width,
        exhibition,
      ) *
      (1 - finale);
    const y =
      MathUtils.lerp(
        mobile ? -0.75 : 0.1,
        (stage?.y ?? -0.1) * viewport.height,
        exhibition,
      ) *
      (1 - finale);
    const stageScale = stage
      ? Math.min(stage.width * viewport.width, stage.height * viewport.height) /
        4.4
      : 0.6;
    const scale =
      MathUtils.lerp(mobile ? 0.48 : 1.16, stageScale, exhibition) +
      finale * 0.25;
    if (reduced) {
      group.current.position.set(x, y, 0);
      group.current.scale.setScalar(scale);
      group.current.rotation.set(0.1, 0.35, -0.12);
      camera.position.set(0, 0, 8.5);
      return;
    }
    const damping = 5;
    group.current.position.x = MathUtils.damp(
      group.current.position.x,
      x,
      damping,
      dt,
    );
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      y,
      damping,
      dt,
    );
    group.current.scale.setScalar(
      MathUtils.damp(group.current.scale.x, scale, damping, dt),
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.1 + pointer.current.y * 0.12,
      4,
      dt,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      0.35 +
        pointer.current.x * 0.25 +
        hero * 0.9 * (1 - exhibition) +
        finale * 1.4,
      4,
      dt,
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      -0.12 + exhibition * 0.3 + finale * 0.4,
      damping,
      dt,
    );
    // R3F owns this mutable Three camera; frame-loop mutation avoids React renders.
    // oxlint-disable-next-line react/immutability
    camera.position.z = MathUtils.damp(
      camera.position.z,
      8.5 - hero * 0.6,
      damping,
      dt,
    );
  });

  return (
    <>
      <Studio />
      <group
        ref={group}
        position={
          inspecting ? [0, 0, 0] : [mobile ? 0 : viewport.width * 0.215, 0.1, 0]
        }
        scale={
          inspecting
            ? Math.min(1, viewport.width / 4.8, viewport.height / 4.8)
            : mobile
              ? 0.48
              : 1.16
        }
      >
        <Sculpture artwork={artwork} surface={surface} reduced={reduced} />
      </group>
      {inspecting && (
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          enableDamping={!reduced}
          dampingFactor={0.08}
        />
      )}
    </>
  );
}

function ContextLifecycle({ onError }: { onError: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onError);
    // A disposed Canvas deliberately loses its context; only report losses while mounted.
    return () => canvas.removeEventListener("webglcontextlost", onError);
  }, [gl, onError]);
  return null;
}

/** One renderer follows the exhibition; dialog inspection reuses that renderer. */
export default function SceneCanvas(props: SceneProps) {
  const [visible, setVisible] = useState(!document.hidden);
  const [host] = useState(() => {
    const element = document.createElement("div");
    element.className = "scene-host";
    return element;
  });
  useLayoutEffect(() => {
    (props.portalTarget ?? document.body).appendChild(host);
    return () => host.remove();
  }, [host, props.portalTarget]);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const canvas = (
    <SceneBoundary onError={props.onError}>
      <Canvas
        aria-hidden="true"
        className={props.inspecting ? "webgl is-inspecting" : "webgl"}
        dpr={[1, window.innerWidth < 700 ? 1.25 : 1.5]}
        camera={{ position: [0, 0, 8.5], fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        frameloop={!visible ? "never" : props.reduced ? "demand" : "always"}
        fallback={
          <span className="sr-only">
            A folded chrome sculpture. WebGL is unavailable.
          </span>
        }
        onCreated={({ gl }) => {
          gl.setClearColor("#101012", 0);
        }}
      >
        <ContextLifecycle onError={props.onError} />
        <Suspense fallback={null}>
          <SceneRig {...props} />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
  return createPortal(canvas, host);
}
