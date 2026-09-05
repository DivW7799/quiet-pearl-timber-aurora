import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fbm } from "@/lib/garden/rng";
import {
  isPath,
  lakeMetric,
  LAKE_RX,
  LAKE_RZ,
  sampleHeight,
  WATER_Y,
} from "@/lib/garden/world";
import { HILLS as HILL_SPOTS } from "@/lib/garden/layout";

function makeTerrain() {
  const size = 160;
  const seg = 112;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const rock = new THREE.Color("#6a7064");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = sampleHeight(x, z);
    pos.setY(i, y);
    const ld = lakeMetric(x, z);
    const n = fbm(x * 0.11, z * 0.11);
    const r = Math.hypot(x, z);
    if (y < WATER_Y - 0.25) {
      c.setRGB(0.34 + n * 0.08, 0.4, 0.3);
    } else if (ld < 1.2) {
      c.setRGB(0.78 + n * 0.06, 0.7, 0.5);
    } else if (isPath(x, z)) {
      c.setRGB(0.52 + n * 0.06, 0.4, 0.26);
    } else {
      c.setRGB(0.2 + n * 0.1, 0.36 + n * 0.2, 0.16 + n * 0.06);
      if (r > 36) c.lerp(rock, Math.min(1, (r - 36) / 22));
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

const waterVert = /* glsl */ `
  varying vec3 vWorld;
  uniform float uTime;
  void main() {
    vec3 p = position;
    p.y += sin(p.x * 0.42 + uTime * 1.25) * 0.07 + cos(p.z * 0.36 + uTime * 0.95) * 0.05;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const waterFrag = /* glsl */ `
  varying vec3 vWorld;
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  void main() {
    vec3 viewd = normalize(cameraPosition - vWorld);
    vec3 n = normalize(vec3(
      sin(vWorld.x * 0.5 + uTime * 1.25) * 0.22,
      1.0,
      cos(vWorld.z * 0.45 + uTime * 0.95) * 0.22
    ));
    float fres = pow(1.0 - clamp(dot(n, viewd), 0.0, 1.0), 2.6);
    vec3 col = mix(uDeep, uShallow, fres);
    float spec = pow(max(dot(n, normalize(viewd + vec3(0.35, 0.8, 0.2))), 0.0), 40.0);
    col += spec * vec3(0.9, 0.95, 0.85) * 0.5;
    float spark = sin(vWorld.x * 2.8 + uTime * 1.8) * sin(vWorld.z * 3.1 + uTime * 1.4);
    col += vec3(0.12, 0.18, 0.16) * max(spark, 0.0) * 0.28;
    gl_FragColor = vec4(col, 0.9);
  }
`;

export function WorldGround() {
  const terrain = useMemo(() => makeTerrain(), []);
  const waterMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color("#143844") },
          uShallow: { value: new THREE.Color("#4ea0a4") },
        },
        vertexShader: waterVert,
        fragmentShader: waterFrag,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const waterGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(LAKE_RX * 2.12, LAKE_RZ * 2.12, 48, 36);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useFrame((state) => {
    waterMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(
    () => () => {
      terrain.dispose();
      waterGeo.dispose();
      waterMat.dispose();
    },
    [terrain, waterGeo, waterMat],
  );

  return (
    <group>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh geometry={waterGeo} position={[0, WATER_Y, 0]} material={waterMat} />
      <LilyPads />
      <Cattails />
      <DistantHills />
    </group>
  );
}

function LilyPads() {
  const pads = useMemo(
    () =>
      [
        [2.4, 1.8, 0.55, 0.4],
        [-3.1, 0.6, 0.7, 1.1],
        [1.2, -2.8, 0.48, 2.2],
        [-1.6, -1.4, 0.62, 0.8],
        [4.2, -0.9, 0.42, 1.7],
        [-4.4, 2.2, 0.5, 2.6],
        [0.4, 3.4, 0.38, 0.2],
      ] as const,
    [],
  );
  return (
    <group>
      {pads.map(([x, z, s, ph], i) => (
        <mesh
          key={i}
          position={[x, WATER_Y + 0.03, z]}
          rotation={[-Math.PI / 2, 0, ph]}
          scale={s}
        >
          <circleGeometry args={[1, 7]} />
          <meshStandardMaterial color={i % 2 ? "#3d7a45" : "#2f6a3a"} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Cattails() {
  const stems = useMemo(
    () =>
      [
        [10.2, 2.4],
        [10.6, 3.1],
        [9.7, 3.6],
        [-10.4, 1.8],
        [-10.8, 2.6],
        [3.8, 7.6],
        [4.4, 7.9],
        [-5.6, 7.2],
      ] as const,
    [],
  );
  return (
    <group>
      {stems.map(([x, z], i) => {
        const y = sampleHeight(x, z);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, i, 0.08]}>
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 1.4, 5]} />
              <meshStandardMaterial color="#5c6b3a" />
            </mesh>
            <mesh position={[0, 1.42, 0]}>
              <cylinderGeometry args={[0.06, 0.05, 0.22, 6]} />
              <meshStandardMaterial color="#4a3024" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function DistantHills() {
  return (
    <group>
      {HILL_SPOTS.map((h, i) => (
        <mesh
          key={i}
          position={[h.x, h.h * 0.18, h.z]}
          scale={[h.s, h.h * 0.42, h.s * 0.82]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 9, 6]} />
          <meshStandardMaterial
            color={i % 2 ? "#5a6750" : "#4e5c48"}
            roughness={0.96}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
