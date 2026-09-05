import { fbm } from "./rng";

export const WATER_Y = 0.06;
export const LAKE_RX = 11.6;
export const LAKE_RZ = 8.8;
export const PLAY_RADIUS = 36;
export const FENCE_R = 36.4;
export const PATH_R = 15.4;
export const PATH_W = 1.45;
export const WALK_SPEED = 4.4;
export const TURN_RATE = 2.35;
export const SPAWN = { x: 0, z: 17.8, yaw: 0 };

export const DOCK = {
  minX: -1.35,
  maxX: 1.35,
  minZ: 3.4,
  maxZ: 12.4,
  y: 0.32,
};

export function lakeMetric(x: number, z: number) {
  return Math.hypot(x / LAKE_RX, z / LAKE_RZ);
}

export function onDock(x: number, z: number) {
  return x >= DOCK.minX && x <= DOCK.maxX && z >= DOCK.minZ && z <= DOCK.maxZ;
}

export function inLake(x: number, z: number) {
  return lakeMetric(x, z) < 0.98 && !onDock(x, z);
}

export function isPath(x: number, z: number) {
  const pr = Math.hypot(x * 0.96, z);
  return Math.abs(pr - PATH_R) < PATH_W && lakeMetric(x, z) > 1.08;
}

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function sampleHeight(x: number, z: number): number {
  const ld = lakeMetric(x, z);
  const r = Math.hypot(x, z);
  const roll = (fbm(x * 0.055, z * 0.055) - 0.5) * 1.05;
  const fine = (fbm(x * 0.18, z * 0.18) - 0.5) * 0.22;

  const north = Math.max(0, -z - 20);
  const rim = Math.max(0, r - 40);
  const hills = north * 0.22 + rim * 0.5 + Math.max(0, r - 28) * (fbm(x * 0.03, z * 0.03) - 0.2) * 0.7;

  if (ld < 0.9) {
    return -1.45 + ld * 0.35;
  }
  if (ld < 1.22) {
    const t = smoothstep(0.9, 1.22, ld);
    return -1.1 * (1 - t) + (0.1 + roll * 0.25 + fine) * t;
  }

  let h = 0.12 + roll + fine + hills;

  const pr = Math.hypot(x * 0.96, z);
  const pd = Math.abs(pr - PATH_R);
  if (pd < PATH_W && ld > 1.05) {
    const f = 1 - pd / PATH_W;
    h = h * (1 - f * 0.85) + 0.13 * f * 0.85;
  }

  if (onDock(x, z)) return DOCK.y;
  return h;
}

export function sampleWalkHeight(x: number, z: number) {
  if (onDock(x, z)) return DOCK.y;
  return Math.max(sampleHeight(x, z), WATER_Y + 0.02);
}

export function canWalk(x: number, z: number) {
  if (Math.hypot(x, z) > PLAY_RADIUS - 0.65) return false;
  if (inLake(x, z)) return false;
  return true;
}

export function sunDirection(hour: number) {
  const elev = Math.sin(((hour - 6) / 12) * Math.PI);
  const az = ((hour - 12) / 12) * Math.PI * 0.92;
  const x = Math.sin(az) * 90;
  const z = Math.cos(az) * 36 - 8;
  const y = elev * 88;
  return { x, y, z, elev };
}

export type TimePalette = {
  fog: string;
  ambient: string;
  hemiSky: string;
  hemiGround: string;
  sun: string;
  sunIntensity: number;
  ambientIntensity: number;
  exposure: number;
  skyTurbidity: number;
  skyRayleigh: number;
  night: number;
};

export function timePalette(hour: number): TimePalette {
  const elev = Math.sin(((hour - 6) / 12) * Math.PI);
  const day = smoothstep(-0.15, 0.35, elev);
  const night = 1 - day;
  const golden = smoothstep(0.02, 0.18, elev) * smoothstep(0.45, 0.12, elev);

  const fogDay = [197, 214, 196] as const;
  const fogDusk = [232, 176, 128] as const;
  const fogNight = [18, 24, 36] as const;
  const fog = mix3(mix3(fogNight, fogDusk, golden), mix3(fogDusk, fogDay, day), day);

  return {
    fog: rgb(fog),
    ambient: rgb(mix3([28, 34, 52], [210, 220, 230], day)),
    hemiSky: rgb(mix3([40, 50, 78], [186, 214, 232], day)),
    hemiGround: rgb(mix3([24, 28, 22], [92, 110, 64], day)),
    sun: rgb(mix3([180, 196, 230], mix3([255, 176, 92], [255, 244, 214], day), Math.max(day, golden))),
    sunIntensity: 0.12 + day * 1.55 + golden * 0.35,
    ambientIntensity: 0.18 + day * 0.42,
    exposure: 0.55 + day * 0.55 + golden * 0.12,
    skyTurbidity: 8 + golden * 6 + night * 2,
    skyRayleigh: 0.6 + day * 2.2,
    night,
  };
}

function mix3(a: readonly number[], b: readonly number[], t: number) {
  const k = Math.min(1, Math.max(0, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k] as [
    number,
    number,
    number,
  ];
}

function rgb(c: readonly number[]) {
  return `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})`;
}
