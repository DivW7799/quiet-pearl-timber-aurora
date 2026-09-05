import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BENCHES, FLOWER_BEDS } from "@/lib/garden/layout";
import { lookState, sampleActions, setInjectedKeys } from "@/lib/garden/input";
import { movers, playerSim, steerOverride } from "@/lib/garden/player-sim";
import { useGardenStore } from "@/lib/garden/store";
import { canWalk, sampleWalkHeight, TURN_RATE, WALK_SPEED } from "@/lib/garden/world";

const tmpFwd = new THREE.Vector3();
const tmpCam = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpDesired = new THREE.Vector3();

export function Player() {
  const group = useRef<THREE.Group>(null);
  const playing = useGardenStore((s) => s.playing);
  const seated = useGardenStore((s) => s.seated);
  const cameraMode = useGardenStore((s) => s.cameraMode);

  useEffect(() => {
    window.__controlsTest = {
      getYaw: () => playerSim.yaw,
      getSpeed: () => playerSim.speed,
      getPos: () => ({ x: playerSim.x, y: playerSim.y, z: playerSim.z }),
      setSteer: (v) => {
        steerOverride.value = v;
      },
      setKeys: (codes) => {
        setInjectedKeys(codes);
        if (codes.length) useGardenStore.getState().enter();
      },
    };
    return () => {
      delete window.__controlsTest;
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const { throttle, steer: keySteer, interactPressed } = sampleActions();
    const steer = THREE.MathUtils.clamp(keySteer + (steerOverride.value ?? 0), -1, 1);

    if (playing && !seated && cameraMode === "follow") {
      playerSim.yaw += steer * TURN_RATE * dt;
      const target = throttle * WALK_SPEED;
      playerSim.speed += (target - playerSim.speed) * Math.min(1, dt * 6);
      const fx = -Math.sin(playerSim.yaw);
      const fz = -Math.cos(playerSim.yaw);
      let nx = playerSim.x + fx * playerSim.speed * dt;
      let nz = playerSim.z + fz * playerSim.speed * dt;
      if (!canWalk(nx, nz)) {
        if (canWalk(nx, playerSim.z)) nz = playerSim.z;
        else if (canWalk(playerSim.x, nz)) nx = playerSim.x;
        else {
          nx = playerSim.x;
          nz = playerSim.z;
          playerSim.speed = 0;
        }
      }
      playerSim.x = nx;
      playerSim.z = nz;
    } else {
      playerSim.speed = 0;
    }

    playerSim.y = sampleWalkHeight(playerSim.x, playerSim.z);

    if (group.current) {
      const bob =
        playing && !seated
          ? Math.sin(state.clock.elapsedTime * 8) *
            Math.min(1, Math.abs(playerSim.speed) / WALK_SPEED) *
            0.04
          : 0;
      group.current.position.set(playerSim.x, playerSim.y + bob, playerSim.z);
      group.current.rotation.y = playerSim.yaw;
    }

    if (interactPressed && playing) handleInteract(playerSim.x, playerSim.z);
    else if (playing) updateNearby(playerSim.x, playerSim.z);
  });

  return (
    <group ref={group} visible={playing}>
      <Gardener />
    </group>
  );
}

function Gardener() {
  const legs = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!legs.current) return;
    const k = Math.min(1, Math.abs(playerSim.speed) / WALK_SPEED);
    legs.current.children.forEach((ch, i) => {
      ch.rotation.x = Math.sin(state.clock.elapsedTime * 8 + i * Math.PI) * 0.55 * k;
    });
  });
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.55, 4, 8]} />
        <meshStandardMaterial color="#e6dcc8" />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#e8c8a8" />
      </mesh>
      <mesh position={[0, 1.68, 0]} rotation={[0.05, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 10]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <coneGeometry args={[0.16, 0.22, 8]} />
        <meshStandardMaterial color="#b7925e" />
      </mesh>
      <group ref={legs}>
        <mesh position={[-0.1, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
          <meshStandardMaterial color="#5c6b4a" />
        </mesh>
        <mesh position={[0.1, 0.32, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
          <meshStandardMaterial color="#5c6b4a" />
        </mesh>
      </group>
      <mesh position={[-0.28, 1.05, 0]} rotation={[0, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.05, 0.32, 3, 6]} />
        <meshStandardMaterial color="#e6dcc8" />
      </mesh>
      <mesh position={[0.28, 1.05, 0]} rotation={[0, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.05, 0.32, 3, 6]} />
        <meshStandardMaterial color="#e6dcc8" />
      </mesh>
    </group>
  );
}

export function CameraDirector() {
  const { camera, gl } = useThree();
  const playing = useGardenStore((s) => s.playing);
  const cameraMode = useGardenStore((s) => s.cameraMode);
  const seated = useGardenStore((s) => s.seated);
  const introT = useRef(0.6);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" && e.clientX < window.innerWidth * 0.38) return;
      lookState.dragging = true;
      lookState.pointerId = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!lookState.dragging || e.pointerId !== lookState.pointerId) return;
      lookState.yaw -= e.movementX * 0.005;
      lookState.pitch = THREE.MathUtils.clamp(
        lookState.pitch + e.movementY * 0.003,
        -0.15,
        0.7,
      );
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== lookState.pointerId) return;
      lookState.dragging = false;
      lookState.pointerId = -1;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (!playing) {
      introT.current += dt * 0.08;
      const t = introT.current;
      camera.position.set(
        Math.sin(t) * 28,
        12.5 + Math.sin(t * 0.7) * 1.4,
        Math.cos(t) * 28,
      );
      camera.lookAt(0, 0.6, 0);
      return;
    }
    if (cameraMode === "orbit") return;

    if (!lookState.dragging) {
      lookState.yaw *= Math.exp(-dt * 1.4);
    }

    const yaw = playerSim.yaw + lookState.yaw;
    tmpFwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    const dist = seated ? 3.6 : 5.2;
    const height = seated ? 1.7 : 2.35 + lookState.pitch * 2.4;
    tmpDesired.copy(tmpFwd).multiplyScalar(-dist);
    tmpDesired.y += height;
    tmpDesired.x += playerSim.x;
    tmpDesired.z += playerSim.z;
    tmpDesired.y += playerSim.y;
    const k = 1 - Math.exp(-dt * 5.5);
    tmpCam.copy(camera.position).lerp(tmpDesired, k);
    camera.position.copy(tmpCam);
    tmpLook.set(
      playerSim.x + tmpFwd.x * 4.2,
      playerSim.y + (seated ? 0.95 : 1.15),
      playerSim.z + tmpFwd.z * 4.2,
    );
    camera.lookAt(tmpLook);
  });

  return null;
}

function updateNearby(x: number, z: number) {
  const store = useGardenStore.getState();
  if (store.seated) {
    store.setNearby("stand");
    store.setHint("Press E to stand");
    return;
  }
  let best: { id: string; d: number; hint: string } | null = null;
  for (const b of BENCHES) {
    const d = Math.hypot(b.x - x, b.z - z);
    if (d < 2.2 && (!best || d < best.d)) {
      best = { id: b.id, d, hint: "Press E to sit and watch the lake" };
    }
  }
  for (const bed of FLOWER_BEDS) {
    if (store.pickedBeds.includes(bed.id)) continue;
    const d = Math.hypot(bed.x - x, bed.z - z);
    if (d < 2.4 && (!best || d < best.d)) {
      best = { id: bed.id, d, hint: "Press E to gather flowers" };
    }
  }
  for (const [id, m] of Object.entries(movers)) {
    const d = Math.hypot(m.x - x, m.z - z);
    if (d < 2.6 && (!best || d < best.d)) {
      best = { id, d, hint: `${m.label}. Press E to linger.` };
    }
  }
  if (!best) {
    if (store.nearby) store.setNearby(null);
    if (store.hint && !store.hint.startsWith("You ")) store.setHint(null);
    return;
  }
  store.setNearby(best.id);
  store.setHint(best.hint);
}

function handleInteract(x: number, z: number) {
  const store = useGardenStore.getState();
  if (store.seated) {
    store.setSeated(false);
    store.setHint(null);
    return;
  }
  for (const b of BENCHES) {
    if (Math.hypot(b.x - x, b.z - z) < 2.2) {
      playerSim.x = b.x;
      playerSim.z = b.z + 0.15;
      playerSim.yaw = b.yaw + Math.PI;
      store.setSeated(true);
      store.setHint("The lake holds still. Press E to stand.");
      return;
    }
  }
  for (const bed of FLOWER_BEDS) {
    if (store.pickedBeds.includes(bed.id)) continue;
    if (Math.hypot(bed.x - x, bed.z - z) < 2.4) {
      store.pickBed(bed.id);
      return;
    }
  }
  for (const m of Object.values(movers)) {
    if (Math.hypot(m.x - x, m.z - z) < 2.6) {
      store.setHint(`${m.label}.`);
      return;
    }
  }
}
