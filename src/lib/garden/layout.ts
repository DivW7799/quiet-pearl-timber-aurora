import { mulberry32 } from "./rng";
import {
  FENCE_R,
  lakeMetric,
  onDock,
  PLAY_RADIUS,
  sampleHeight,
  isPath,
} from "./world";

export type Spot = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
  variant: number;
};

export type FlowerBed = {
  id: string;
  x: number;
  z: number;
  y: number;
  radius: number;
};

const rand = mulberry32(0x5f3759df);

function blocked(x: number, z: number, extra = 0) {
  if (lakeMetric(x, z) < 1.28 + extra * 0.04) return true;
  if (Math.hypot(x, z) > PLAY_RADIUS - 2.4) return true;
  if (Math.hypot(x, z - 17.8) < 4.2) return true;
  if (isPath(x, z)) return true;
  if (onDock(x, z)) return true;
  if (Math.hypot(x - 7.5, z - 28.5) < 4.2) return true;
  if (Math.hypot(x + 13.5, z + 1.2) < 4) return true;
  if (Math.hypot(x + 1, z - 11.5) < 2.4) return true;
  return false;
}

function scatter(
  count: number,
  kind: "tree" | "bush" | "stone" | "grass",
): Spot[] {
  const out: Spot[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 40) {
    guard += 1;
    const ang = rand() * Math.PI * 2;
    const rad =
      kind === "grass"
        ? 8 + rand() * (PLAY_RADIUS - 10)
        : 12 + rand() * (PLAY_RADIUS - 14);
    const x = Math.cos(ang) * rad * (0.85 + rand() * 0.3);
    const z = Math.sin(ang) * rad;
    const pad = kind === "tree" ? 0.6 : 0;
    if (blocked(x, z, pad)) continue;
    if (kind === "grass" && lakeMetric(x, z) < 1.15) continue;
    const tooClose = out.some((s) => {
      const min = kind === "tree" ? 2.6 : kind === "bush" ? 1.4 : 0.7;
      return Math.hypot(s.x - x, s.z - z) < min;
    });
    if (tooClose) continue;
    out.push({
      x,
      y: sampleHeight(x, z),
      z,
      scale:
        kind === "tree"
          ? 0.85 + rand() * 0.55
          : kind === "bush"
            ? 0.7 + rand() * 0.55
            : 0.55 + rand() * 0.7,
      rot: rand() * Math.PI * 2,
      variant: rand(),
    });
  }
  return out;
}

function placeShoreWillows(): Spot[] {
  const seeds = [
    [-9.4, 4.2],
    [-11.2, -2.6],
    [10.8, 3.1],
    [8.6, -6.4],
    [-4.8, -8.6],
  ] as const;
  return seeds.map(([x, z], i) => ({
    x,
    y: sampleHeight(x, z),
    z,
    scale: 1.05 + (i % 3) * 0.12,
    rot: i * 1.1,
    variant: i / 5,
  }));
}

export const OAKS = scatter(38, "tree");
export const PINES = scatter(18, "tree").filter(
  (s) => s.z < 8 || Math.hypot(s.x, s.z) > 20,
);
export const WILLOWS = placeShoreWillows();
export const BUSHES = scatter(48, "bush");
export const STONES = scatter(34, "stone");
export const GRASS = scatter(780, "grass");

export const FLOWER_BEDS: FlowerBed[] = [
  { id: "east-meadow", x: 18.5, z: 6.5, y: 0, radius: 3.2 },
  { id: "south-bed", x: -6.5, z: 17.4, y: 0, radius: 2.4 },
  { id: "west-bank", x: -18.2, z: 4.8, y: 0, radius: 2.8 },
  { id: "north-grove", x: 6.4, z: -16.5, y: 0, radius: 2.6 },
  { id: "gate-patch", x: 4.8, z: 24.2, y: 0, radius: 2.1 },
  { id: "gazebo-ring", x: -13.5, z: -6.4, y: 0, radius: 2.3 },
].map((b) => ({ ...b, y: sampleHeight(b.x, b.z) }));

export const BENCHES = [
  { id: "south-bench", x: -4.6, z: 12.6, yaw: -0.4 },
  { id: "west-bench", x: -16.4, z: 1.2, yaw: 1.15 },
  { id: "dock-bench", x: 3.6, z: 11.2, yaw: -0.2 },
].map((b) => ({ ...b, y: sampleHeight(b.x, b.z) }));

export const GAZEBO = { x: -13.6, z: 1.1, y: sampleHeight(-13.6, 1.1) };
export const COTTAGE = { x: 7.6, z: 28.4, y: sampleHeight(7.6, 28.4) };

export const HILLS = [
  { x: -18, z: -62, s: 18, h: 16 },
  { x: 8, z: -70, s: 22, h: 20 },
  { x: 32, z: -58, s: 16, h: 14 },
  { x: -42, z: -48, s: 14, h: 11 },
  { x: 48, z: -42, s: 15, h: 12 },
  { x: -8, z: -78, s: 26, h: 24 },
];

export function fencePosts() {
  const posts: Spot[] = [];
  const n = 92;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    // Gap at the south gate (+Z)
    const around = ((t + Math.PI / 2) % (Math.PI * 2)) - Math.PI;
    if (Math.abs(around) < 0.22) continue;
    const x = Math.cos(t) * FENCE_R;
    const z = Math.sin(t) * FENCE_R;
    posts.push({
      x,
      y: sampleHeight(x, z),
      z,
      scale: 1,
      rot: t,
      variant: i,
    });
  }
  return posts;
}

export const FENCE_POSTS = fencePosts();
