import { Environment, Lightformer } from "@react-three/drei";

export function Studio() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} color="#f4f3ff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#161619"]} />
        <Lightformer
          intensity={4}
          position={[0, 5, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 3, 1]}
        />
        <Lightformer
          intensity={5}
          position={[-5, 1, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 8, 1]}
        />
        <Lightformer
          intensity={3}
          position={[4, 2, 3]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[1, 8, 1]}
        />
        <Lightformer
          intensity={2.5}
          color="#ff387d"
          position={[2, -3, 2]}
          rotation={[Math.PI / 3, 0, 0]}
          scale={[6, 1, 1]}
        />
        <Lightformer intensity={2} position={[0, 1, 6]} scale={[5, 1, 1]} />
      </Environment>
    </>
  );
}
