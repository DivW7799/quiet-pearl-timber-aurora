import { SPAWN } from "./world";

export const playerSim = {
  x: SPAWN.x,
  y: 0,
  z: SPAWN.z,
  yaw: SPAWN.yaw,
  speed: 0,
};

export const movers: Record<string, { x: number; z: number; label: string }> = {};

export const steerOverride = { value: null as number | null };

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getPos?: () => { x: number; y: number; z: number };
      setSteer?: (v: number) => void;
      setKeys?: (codes: string[]) => void;
    };
  }
}
