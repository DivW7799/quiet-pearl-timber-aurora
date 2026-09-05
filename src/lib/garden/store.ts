import { create } from "zustand";

export type CameraMode = "follow" | "orbit";

type GardenState = {
  playing: boolean;
  cameraMode: CameraMode;
  timeOfDay: number;
  autoTime: boolean;
  seated: boolean;
  flowersPicked: number;
  pickedBeds: string[];
  hint: string | null;
  nearby: string | null;
  enter: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setTimeOfDay: (hour: number) => void;
  setAutoTime: (on: boolean) => void;
  setSeated: (on: boolean) => void;
  pickBed: (id: string) => void;
  setHint: (hint: string | null) => void;
  setNearby: (id: string | null) => void;
};

const savedTime = (() => {
  if (typeof localStorage === "undefined") return 9.25;
  const n = Number(localStorage.getItem("willowmere-hour"));
  return Number.isFinite(n) ? n : 9.25;
})();

export const useGardenStore = create<GardenState>((set, get) => ({
  playing: false,
  cameraMode: "follow",
  timeOfDay: savedTime,
  autoTime: false,
  seated: false,
  flowersPicked: 0,
  pickedBeds: [],
  hint: null,
  nearby: null,
  enter: () => set({ playing: true, seated: false }),
  setCameraMode: (cameraMode) => set({ cameraMode, seated: false }),
  setTimeOfDay: (timeOfDay) => {
    set({ timeOfDay });
    try {
      localStorage.setItem("willowmere-hour", String(timeOfDay));
    } catch {
      /* ignore */
    }
  },
  setAutoTime: (autoTime) => set({ autoTime }),
  setSeated: (seated) => set({ seated }),
  pickBed: (id) => {
    const { pickedBeds } = get();
    if (pickedBeds.includes(id)) return;
    set({
      pickedBeds: [...pickedBeds, id],
      flowersPicked: get().flowersPicked + 3 + Math.floor(Math.random() * 3),
      hint: "You gathered a small handful of blooms.",
    });
  },
  setHint: (hint) => set({ hint }),
  setNearby: (nearby) => set({ nearby }),
}));
