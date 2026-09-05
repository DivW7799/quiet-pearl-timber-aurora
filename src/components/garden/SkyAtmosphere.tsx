import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sky, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGardenStore } from "@/lib/garden/store";
import { sunDirection, timePalette } from "@/lib/garden/world";

export function SkyAtmosphere() {
  const hour = useGardenStore((s) => s.timeOfDay);
  const autoTime = useGardenStore((s) => s.autoTime);
  const setTime = useGardenStore((s) => s.setTimeOfDay);
  const pal = timePalette(hour);
  const sun = sunDirection(hour);
  const fog = useThree((s) => s.scene.fog);
  const gl = useThree((s) => s.gl);
  const acc = useRef(0);
  const sunPos = useMemo(
    () => new THREE.Vector3(sun.x, Math.max(sun.y, 2), sun.z),
    [sun.x, sun.y, sun.z],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (autoTime) {
      acc.current += dt;
      if (acc.current > 0.4) {
        acc.current = 0;
        const next = (useGardenStore.getState().timeOfDay + 0.14) % 24;
        setTime(next);
      }
    }
    if (fog && fog instanceof THREE.Fog) {
      fog.color.set(pal.fog);
    }
    gl.toneMappingExposure = pal.exposure;
  });

  return (
    <>
      <color attach="background" args={[pal.fog]} />
      <fog attach="fog" args={[pal.fog, 38, 125]} />
      <hemisphereLight args={[pal.hemiSky, pal.hemiGround, pal.ambientIntensity]} />
      <ambientLight intensity={pal.ambientIntensity * 0.45} color={pal.ambient} />
      <directionalLight
        position={[sun.x, Math.max(sun.y, 6), sun.z]}
        intensity={pal.sunIntensity}
        color={pal.sun}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={2}
        shadow-camera-far={140}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-bias={-0.0004}
      />
      <Sky
        sunPosition={sunPos}
        turbidity={pal.skyTurbidity}
        rayleigh={pal.skyRayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      {pal.night > 0.35 && (
        <Stars radius={110} depth={30} count={800} factor={3.2} fade speed={0.4} saturation={0} />
      )}
      {pal.night > 0.28 && (
        <Sparkles
          count={48}
          size={2.6}
          scale={[34, 5, 34]}
          position={[0, 2.2, 0]}
          speed={0.35}
          opacity={pal.night * 0.85}
          color="#e7efc8"
        />
      )}
      <CloudField night={pal.night} />
    </>
  );
}

function CloudField({ night }: { night: number }) {
  const group = useRef<THREE.Group>(null);
  const tint = night > 0.55 ? "#9aa6b8" : "#f4f6f8";
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += Math.min(delta, 0.1) * 0.012;
  });
  const puffs = useMemo(
    () =>
      [
        [18, 22, -24, 1.3],
        [-22, 20, -18, 1.6],
        [8, 24, 28, 1.1],
        [-30, 21, 10, 1.4],
        [32, 23, 6, 1.2],
        [-6, 26, -34, 1.8],
        [24, 19, 22, 1],
        [-14, 22, 30, 1.25],
      ] as const,
    [],
  );
  return (
    <group ref={group}>
      {puffs.map(([x, y, z, s], i) => (
        <group key={i} position={[x, y, z]} scale={s}>
          <mesh>
            <sphereGeometry args={[2.2, 8, 6]} />
            <meshLambertMaterial color={tint} />
          </mesh>
          <mesh position={[1.8, 0.25, 0.4]}>
            <sphereGeometry args={[1.55, 8, 6]} />
            <meshLambertMaterial color={tint} />
          </mesh>
          <mesh position={[-1.6, 0.15, 0.2]}>
            <sphereGeometry args={[1.4, 8, 6]} />
            <meshLambertMaterial color={tint} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
