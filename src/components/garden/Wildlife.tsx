import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { movers } from "@/lib/garden/player-sim";
import { PATH_R, sampleHeight, WATER_Y } from "@/lib/garden/world";

const lookTmp = new THREE.Vector3();

export function Wildlife() {
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => (
        <Duck key={i} seed={i} />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <Rabbit key={i} seed={i} />
      ))}
      <Deer seed={0} anchor={[-10, -14]} />
      <Deer seed={1} anchor={[-6.5, -17]} />
      <Fox />
      {Array.from({ length: 8 }, (_, i) => (
        <Bird key={i} seed={i} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Butterfly key={i} seed={i} />
      ))}
    </group>
  );
}

function Duck({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const phase = seed * 1.7;
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.22 + phase;
    const r = 3.2 + (seed % 3) * 0.7;
    const x = Math.cos(t) * r + (seed - 2) * 0.4;
    const z = Math.sin(t) * r * 0.72;
    const y = WATER_Y + 0.12 + Math.sin(t * 3) * 0.03;
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t + Math.PI / 2;
    movers[`duck-${seed}`] = { x, z, label: "A mallard paddles by" };
  });
  return (
    <group ref={ref}>
      <mesh scale={[0.34, 0.2, 0.22]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={seed % 2 ? "#c8b06a" : "#3d4a38"} />
      </mesh>
      <mesh position={[0, 0.16, 0.16]}>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial color="#1e241c" />
      </mesh>
      <mesh position={[0, 0.14, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.12, 5]} />
        <meshStandardMaterial color="#d98a3a" />
      </mesh>
    </group>
  );
}

function Rabbit({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const anchors = useMemo(
    () =>
      [
        [16, 8],
        [-8, 18],
        [12, -8],
        [-17, 8],
      ][seed] as [number, number],
    [seed],
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.55 + seed * 2;
    const hop = Math.abs(Math.sin(t * 2.4));
    const moving = Math.sin(t * 0.4) > 0.15;
    const a = t * 0.35;
    const x = anchors[0] + Math.cos(a) * 2.2;
    const z = anchors[1] + Math.sin(a) * 1.6;
    const y = sampleHeight(x, z) + (moving ? hop * 0.28 : 0.08);
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = a + Math.PI / 2;
    movers[`rabbit-${seed}`] = { x, z, label: "A rabbit pauses in the grass" };
  });
  return (
    <group ref={ref}>
      <mesh scale={[0.18, 0.14, 0.24]} castShadow>
        <sphereGeometry args={[1, 7, 5]} />
        <meshStandardMaterial color="#d9cbb8" />
      </mesh>
      {[-0.06, 0.06].map((e) => (
        <mesh key={e} position={[e, 0.2, 0.02]} rotation={[0.2, 0, e * 2]}>
          <capsuleGeometry args={[0.03, 0.16, 2, 5]} />
          <meshStandardMaterial color="#cbb8a4" />
        </mesh>
      ))}
    </group>
  );
}

function Deer({ seed, anchor }: { seed: number; anchor: [number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.18 + seed * 3;
    const graze = Math.sin(t * 1.4) > 0.35;
    const x = anchor[0] + Math.cos(t) * 2.4;
    const z = anchor[1] + Math.sin(t * 0.8) * 1.8;
    const y = sampleHeight(x, z);
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t + 0.4;
    if (head.current) head.current.rotation.x = graze ? 0.7 : 0.1;
    movers[`deer-${seed}`] = { x, z, label: "A deer grazes under the pines" };
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.85, 0]} scale={[0.28, 0.4, 0.7]} castShadow>
        <sphereGeometry args={[1, 7, 5]} />
        <meshStandardMaterial color="#8a623c" />
      </mesh>
      {[
        [-0.14, 0.22],
        [0.14, 0.22],
        [-0.14, -0.22],
        [0.14, -0.22],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.32, lz]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, 0.64, 5]} />
          <meshStandardMaterial color="#6a4a2c" />
        </mesh>
      ))}
      <group ref={head} position={[0, 1.15, 0.42]}>
        <mesh scale={[0.16, 0.18, 0.28]}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshStandardMaterial color="#7a562e" />
        </mesh>
        {[-0.08, 0.08].map((a) => (
          <mesh key={a} position={[a, 0.22, -0.04]} rotation={[0.2, 0, a * 1.4]}>
            <cylinderGeometry args={[0.012, 0.02, 0.28, 4]} />
            <meshStandardMaterial color="#d8c8b0" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Fox() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.16;
    const x = Math.cos(t) * PATH_R;
    const z = Math.sin(t) * PATH_R;
    const y = sampleHeight(x, z) + 0.08;
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t + Math.PI / 2;
    movers.fox = { x, z, label: "A fox trots the garden path" };
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.32, 0]} scale={[0.18, 0.16, 0.42]} castShadow>
        <sphereGeometry args={[1, 7, 5]} />
        <meshStandardMaterial color="#c36a32" />
      </mesh>
      <mesh position={[0, 0.42, 0.28]} scale={[0.12, 0.12, 0.16]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color="#c36a32" />
      </mesh>
      <mesh position={[0, 0.38, -0.4]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.08, 0.36, 5]} />
        <meshStandardMaterial color="#d8c8b4" />
      </mesh>
    </group>
  );
}

function Bird({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = t * 0.28 + seed * 0.7;
    const x = Math.cos(a) * (16 + seed) + Math.sin(a * 2.1) * 2;
    const z = Math.sin(a) * (11 + seed * 0.4);
    const y = 7.5 + Math.sin(a * 2 + seed) * 1.4 + seed * 0.2;
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    const look = lookTmp.set(x - Math.sin(a) * 4, y, z + Math.cos(a) * 4);
    ref.current.lookAt(look);
    const flap = Math.sin(t * 11 + seed) * 0.55;
    if (wingL.current) wingL.current.rotation.z = 0.35 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.35 - flap;
  });
  const color = seed % 3 === 0 ? "#2c3038" : seed % 3 === 1 ? "#4a5c6a" : "#6a5340";
  return (
    <group ref={ref}>
      <mesh scale={[0.14, 0.1, 0.28]}>
        <sphereGeometry args={[1, 6, 5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={wingL} position={[-0.16, 0, 0]}>
        <boxGeometry args={[0.42, 0.03, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={wingR} position={[0.16, 0, 0]}>
        <boxGeometry args={[0.42, 0.03, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Butterfly({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const l = useRef<THREE.Mesh>(null);
  const r = useRef<THREE.Mesh>(null);
  const beds = [
    [18.5, 6.5],
    [-6.5, 17.4],
    [-18.2, 4.8],
    [6.4, -16.5],
    [4.8, 24.2],
    [-13.5, -6.4],
    [2, 8],
  ] as const;
  const home = beds[seed % beds.length]!;
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.7 + seed;
    const x = home[0] + Math.sin(t) * 1.6;
    const z = home[1] + Math.cos(t * 1.3) * 1.2;
    const y = sampleHeight(x, z) + 0.9 + Math.sin(t * 2.2) * 0.35;
    if (!ref.current) return;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t;
    const flap = Math.sin(t * 14) * 0.7;
    if (l.current) l.current.rotation.z = flap;
    if (r.current) r.current.rotation.z = -flap;
  });
  const color = seed % 2 ? "#d9c46a" : "#c46a7a";
  return (
    <group ref={ref}>
      <mesh ref={l} position={[-0.07, 0, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={r} position={[0.07, 0, 0]}>
        <planeGeometry args={[0.16, 0.12]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
