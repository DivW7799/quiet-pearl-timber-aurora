import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { BENCHES, COTTAGE, FENCE_POSTS, GAZEBO } from "@/lib/garden/layout";
import { DOCK, FENCE_R, sampleHeight, WATER_Y } from "@/lib/garden/world";

const _dummy = new THREE.Object3D();

export function Structures() {
  return (
    <group>
      <Fence />
      <Dock />
      <Gazebo />
      <Cottage />
      {BENCHES.map((b) => (
        <Bench key={b.id} x={b.x} y={b.y} z={b.z} yaw={b.yaw} />
      ))}
      <Lantern x={GAZEBO.x + 2.4} z={GAZEBO.z + 2} />
      <Lantern x={1.8} z={11.6} />
      <Lantern x={COTTAGE.x - 2.2} z={COTTAGE.z + 1.6} />
      <GateSign />
    </group>
  );
}

function Fence() {
  const posts = useRef<THREE.InstancedMesh>(null);
  const rails = useRef<THREE.InstancedMesh>(null);
  const n = FENCE_POSTS.length;

  useLayoutEffect(() => {
    if (!posts.current || !rails.current) return;
    for (let i = 0; i < n * 2; i++) {
      _dummy.position.set(0, -40, 0);
      _dummy.scale.set(0, 0, 0);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      rails.current.setMatrixAt(i, _dummy.matrix);
    }
    FENCE_POSTS.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.7, s.z);
      _dummy.rotation.set(0, s.rot, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      posts.current!.setMatrixAt(i, _dummy.matrix);

      const next = FENCE_POSTS[(i + 1) % n]!;
      const dx = next.x - s.x;
      const dz = next.z - s.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 3.2) return;
      const midX = (s.x + next.x) / 2;
      const midZ = (s.z + next.z) / 2;
      const yaw = Math.atan2(dx, dz);
      for (let r = 0; r < 2; r++) {
        const idx = i * 2 + r;
        _dummy.position.set(midX, s.y + 0.35 + r * 0.42, midZ);
        _dummy.rotation.set(0, yaw, 0);
        _dummy.scale.set(0.08, 0.07, dist);
        _dummy.updateMatrix();
        rails.current!.setMatrixAt(idx, _dummy.matrix);
      }
    });
    posts.current.instanceMatrix.needsUpdate = true;
    rails.current.instanceMatrix.needsUpdate = true;
  }, [n]);

  return (
    <>
      <instancedMesh ref={posts} args={[undefined, undefined, n]} castShadow>
        <boxGeometry args={[0.14, 1.4, 0.14]} />
        <meshStandardMaterial color="#6b5344" roughness={0.88} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[undefined, undefined, n * 2]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7a624c" roughness={0.86} />
      </instancedMesh>
    </>
  );
}

function Dock() {
  const y = DOCK.y;
  const len = DOCK.maxZ - DOCK.minZ;
  const zc = (DOCK.minZ + DOCK.maxZ) / 2;
  return (
    <group>
      <mesh position={[0, y, zc]} receiveShadow castShadow>
        <boxGeometry args={[2.5, 0.12, len]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
      </mesh>
      {[-1.05, 1.05].map((x) =>
        [4.2, 6.8, 9.4, 11.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, WATER_Y - 0.35, z]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 1.1, 6]} />
            <meshStandardMaterial color="#5c4636" />
          </mesh>
        )),
      )}
      {Array.from({ length: 9 }, (_, i) => {
        const z = DOCK.minZ + 0.5 + i * 1.05;
        return (
          <mesh key={i} position={[0, y + 0.07, z]} receiveShadow>
            <boxGeometry args={[2.45, 0.05, 0.9]} />
            <meshStandardMaterial color={i % 2 ? "#7a5a3c" : "#8d6b48"} />
          </mesh>
        );
      })}
    </group>
  );
}

function Gazebo() {
  const { x, y, z } = GAZEBO;
  const posts = Array.from({ length: 6 }, (_, i) => i);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.15, 2.15, 0.1, 6]} />
        <meshStandardMaterial color="#cfc4ae" />
      </mesh>
      {posts.map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.85, 1.15, Math.sin(a) * 1.85]} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 2.2, 6]} />
            <meshStandardMaterial color="#7a6248" />
          </mesh>
        );
      })}
      <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
        <coneGeometry args={[2.55, 1.15, 6]} />
        <meshStandardMaterial color="#6e4e3a" roughness={0.78} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#c9a06a" />
      </mesh>
    </group>
  );
}

function Cottage() {
  const { x, y, z } = COTTAGE;
  return (
    <group position={[x, y, z]} rotation={[0, -0.35, 0]}>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.3, 3.2]} />
        <meshStandardMaterial color="#cbb79a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.15, 1.6, 4]} />
        <meshStandardMaterial color="#6a4332" />
      </mesh>
      <mesh position={[1.55, 3.35, 0.2]} castShadow>
        <boxGeometry args={[0.45, 0.9, 0.45]} />
        <meshStandardMaterial color="#7a5a4a" />
      </mesh>
      <mesh position={[0, 0.7, 1.62]}>
        <boxGeometry args={[0.7, 1.35, 0.08]} />
        <meshStandardMaterial color="#4a3226" />
      </mesh>
      {[-1.1, 1.1].map((wx) => (
        <mesh key={wx} position={[wx, 1.35, 1.62]}>
          <boxGeometry args={[0.55, 0.5, 0.06]} />
          <meshStandardMaterial color="#87a8b0" emissive="#1a3038" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ x, y, z, yaw }: { x: number; y: number; z: number; yaw: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.1, 0.5]} />
        <meshStandardMaterial color="#7a5a40" />
      </mesh>
      <mesh position={[0, 0.72, -0.22]} castShadow>
        <boxGeometry args={[1.6, 0.42, 0.08]} />
        <meshStandardMaterial color="#6e5138" />
      </mesh>
      {[-0.65, 0.65].map((lx) => (
        <mesh key={lx} position={[lx, 0.2, 0.12]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
      ))}
    </group>
  );
}

function Lantern({ x, z }: { x: number; z: number }) {
  const y = sampleHeight(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.4, 6]} />
        <meshStandardMaterial color="#4a3a2c" />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#f0d9a0" emissive="#f0c878" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 1.45, 0]} intensity={0.85} distance={8} color="#ffd7a0" />
    </group>
  );
}

function GateSign() {
  const z = FENCE_R - 0.2;
  const y = sampleHeight(0, z);
  return (
    <group position={[0, y, z + 0.4]}>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 1.05, 0]} castShadow>
          <boxGeometry args={[0.12, 2.1, 0.12]} />
          <meshStandardMaterial color="#5c4638" />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[3.2, 0.9, 0.1]} />
        <meshStandardMaterial color="#6e5340" />
      </mesh>
      <Text
        position={[0, 1.55, 0.07]}
        fontSize={0.32}
        color="#f3efe4"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        WILLOWMERE
      </Text>
    </group>
  );
}
