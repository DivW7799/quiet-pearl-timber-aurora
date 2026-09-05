import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CameraDirector, Player } from "./Player";
import { SkyAtmosphere } from "./SkyAtmosphere";
import { Structures } from "./Structures";
import { Vegetation } from "./Vegetation";
import { Wildlife } from "./Wildlife";
import { WorldGround } from "./WorldGround";
import { useGardenStore } from "@/lib/garden/store";

export default function GardenCanvas() {
  const playing = useGardenStore((s) => s.playing);
  const cameraMode = useGardenStore((s) => s.cameraMode);
  const orbit = playing && cameraMode === "orbit";

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 1.6]}
      camera={{ fov: 50, near: 0.12, far: 180, position: [22, 13, 26] }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
      style={{ touchAction: "none", width: "100%", height: "100%" }}
    >
      <SkyAtmosphere />
      <WorldGround />
      <Vegetation />
      <Structures />
      <Wildlife />
      <Player />
      <CameraDirector />
      <OrbitControls
        enabled={orbit}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.08}
        minDistance={8}
        maxDistance={48}
        target={[0, 0.6, 0]}
      />
    </Canvas>
  );
}
