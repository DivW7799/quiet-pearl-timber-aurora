import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BUSHES,
  FLOWER_BEDS,
  GRASS,
  OAKS,
  PINES,
  STONES,
  WILLOWS,
} from "@/lib/garden/layout";
import { useGardenStore } from "@/lib/garden/store";

const _dummy = new THREE.Object3D();

export function Vegetation() {
  return (
    <group>
      <OakField />
      <PineField />
      {WILLOWS.map((w, i) => (
        <Willow key={i} x={w.x} y={w.y} z={w.z} scale={w.scale} rot={w.rot} />
      ))}
      <BushField />
      <StoneField />
      <GrassField />
      <FlowerBeds />
    </group>
  );
}

function OakField() {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const canopy = useRef<THREE.InstancedMesh>(null);
  const n = OAKS.length;

  useLayoutEffect(() => {
    if (!trunk.current || !canopy.current) return;
    OAKS.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.85 * s.scale, s.z);
      _dummy.rotation.set(0, s.rot, 0);
      _dummy.scale.set(s.scale, s.scale, s.scale);
      _dummy.updateMatrix();
      trunk.current!.setMatrixAt(i, _dummy.matrix);

      const c = new THREE.Color().setHSL(0.28 + s.variant * 0.06, 0.45, 0.28 + s.variant * 0.08);
      for (let k = 0; k < 3; k++) {
        const idx = i * 3 + k;
        const ox = (k - 1) * 0.55 * s.scale;
        const oy = (2.15 + (k === 1 ? 0.45 : 0)) * s.scale;
        const oz = (k === 2 ? 0.4 : -0.15) * s.scale;
        _dummy.position.set(s.x + ox, s.y + oy, s.z + oz);
        _dummy.scale.setScalar((0.85 + k * 0.12) * s.scale);
        _dummy.updateMatrix();
        canopy.current!.setMatrixAt(idx, _dummy.matrix);
        canopy.current!.setColorAt(idx, c);
      }
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    canopy.current.instanceMatrix.needsUpdate = true;
    if (canopy.current.instanceColor) canopy.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, undefined, n]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.7, 6]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopy} args={[undefined, undefined, n * 3]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={0.78} />
      </instancedMesh>
    </>
  );
}

function PineField() {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const leaf = useRef<THREE.InstancedMesh>(null);
  const n = PINES.length;

  useLayoutEffect(() => {
    if (!trunk.current || !leaf.current) return;
    PINES.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.9 * s.scale, s.z);
      _dummy.rotation.set(0, s.rot, 0);
      _dummy.scale.set(s.scale, s.scale * 1.15, s.scale);
      _dummy.updateMatrix();
      trunk.current!.setMatrixAt(i, _dummy.matrix);
      const c = new THREE.Color().setHSL(0.32, 0.42, 0.22 + s.variant * 0.08);
      for (let k = 0; k < 2; k++) {
        const idx = i * 2 + k;
        _dummy.position.set(s.x, s.y + (1.7 + k * 1.05) * s.scale, s.z);
        _dummy.scale.set(
          (1.15 - k * 0.32) * s.scale,
          (1.2 - k * 0.1) * s.scale,
          (1.15 - k * 0.32) * s.scale,
        );
        _dummy.updateMatrix();
        leaf.current!.setMatrixAt(idx, _dummy.matrix);
        leaf.current!.setColorAt(idx, c);
      }
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    leaf.current.instanceMatrix.needsUpdate = true;
    if (leaf.current.instanceColor) leaf.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, undefined, n]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 6]} />
        <meshStandardMaterial color="#4a372c" />
      </instancedMesh>
      <instancedMesh ref={leaf} args={[undefined, undefined, n * 2]} castShadow>
        <coneGeometry args={[1, 1.6, 7]} />
        <meshStandardMaterial />
      </instancedMesh>
    </>
  );
}

function Willow({
  x,
  y,
  z,
  scale,
  rot,
}: {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
}) {
  const leaves = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!leaves.current) return;
    leaves.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + rot) * 0.05;
  });
  const strands = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]} scale={scale}>
      <mesh position={[0.15, 1.5, 0]} rotation={[0, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 3.1, 6]} />
        <meshStandardMaterial color="#6a5040" />
      </mesh>
      <group ref={leaves} position={[0.55, 3.1, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.15, 0]} />
          <meshStandardMaterial color="#3d7a48" roughness={0.75} />
        </mesh>
        {strands.map((i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.7, -1.15, Math.sin(a) * 0.7]} castShadow>
              <boxGeometry args={[0.12, 1.8, 0.04]} />
              <meshStandardMaterial color={i % 2 ? "#2f6a3c" : "#4a8a52"} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function BushField() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    BUSHES.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.35 * s.scale, s.z);
      _dummy.rotation.set(0, s.rot, 0);
      _dummy.scale.set(s.scale * 1.1, s.scale * 0.7, s.scale * 1.1);
      _dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, _dummy.matrix);
      mesh.current!.setColorAt(
        i,
        new THREE.Color().setHSL(0.3, 0.4, 0.24 + s.variant * 0.1),
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BUSHES.length]} castShadow>
      <icosahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial roughness={0.85} />
    </instancedMesh>
  );
}

function StoneField() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    STONES.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.18 * s.scale, s.z);
      _dummy.rotation.set(s.variant, s.rot, s.variant * 0.4);
      _dummy.scale.set(s.scale, s.scale * 0.7, s.scale * 0.85);
      _dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, _dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, STONES.length]} castShadow receiveShadow>
      <icosahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial color="#8a8680" roughness={0.95} flatShading />
    </instancedMesh>
  );
}

function GrassField() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const c = new THREE.Color();
    GRASS.forEach((s, i) => {
      _dummy.position.set(s.x, s.y + 0.16, s.z);
      _dummy.rotation.set(0.1 * s.variant, s.rot, 0.08 * (s.variant - 0.5));
      _dummy.scale.set(0.45 + s.variant * 0.3, 0.7 + s.variant * 0.5, 0.45);
      _dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, _dummy.matrix);
      c.setHSL(0.27 + s.variant * 0.08, 0.55, 0.32);
      mesh.current!.setColorAt(i, c);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, GRASS.length]}>
      <coneGeometry args={[0.18, 0.55, 5]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

function FlowerBeds() {
  const picked = useGardenStore((s) => s.pickedBeds);
  return (
    <group>
      {FLOWER_BEDS.map((bed) => (
        <FlowerBedMesh key={bed.id} bed={bed} picked={picked.includes(bed.id)} />
      ))}
    </group>
  );
}

function FlowerBedMesh({
  bed,
  picked,
}: {
  bed: (typeof FLOWER_BEDS)[number];
  picked: boolean;
}) {
  const blooms = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + bed.x;
      const r = 0.35 + (i % 5) * 0.28;
      arr.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        hue: [0.95, 0.08, 0.62, 0, 0.12][i % 5],
        h: 0.18 + (i % 3) * 0.05,
      });
    }
    return arr;
  }, [bed.x]);

  return (
    <group position={[bed.x, bed.y, bed.z]} visible={!picked}>
      {blooms.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h * 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.025, b.h, 4]} />
            <meshStandardMaterial color="#3d6a38" />
          </mesh>
          <mesh position={[0, b.h + 0.07, 0]}>
            <sphereGeometry args={[0.08, 6, 5]} />
            <meshStandardMaterial color={new THREE.Color().setHSL(b.hue, 0.45, 0.62)} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
