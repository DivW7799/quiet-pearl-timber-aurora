const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "KeyE",
  "Space",
]);

const held = new Set<string>();
let injected: string[] | null = null;

export const touchSteer = { x: 0, y: 0 };
export const lookState = { yaw: 0, pitch: 0.08, dragging: false, pointerId: -1 };

export type GardenActions = {
  throttle: number;
  steer: number;
  interact: boolean;
};

export function isDown(code: string) {
  if (injected) return injected.includes(code);
  return held.has(code);
}

export function setInjectedKeys(codes: string[]) {
  if (codes.length === 0) {
    injected = null;
    held.clear();
    return;
  }
  injected = codes;
}

export function bindGardenInput() {
  const onDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    held.add(e.code);
    if (GAME_KEYS.has(e.code)) e.preventDefault();
  };
  const onUp = (e: KeyboardEvent) => {
    held.delete(e.code);
  };
  const onClear = () => held.clear();

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", onClear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) onClear();
  });

  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", onClear);
  };
}

function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

let prevInteract = false;

export function sampleActions(): GardenActions & { interactPressed: boolean } {
  let steer = 0;
  let throttle = 0;

  if (isDown("KeyA") || isDown("ArrowLeft")) steer += 1;
  if (isDown("KeyD") || isDown("ArrowRight")) steer -= 1;
  if (isDown("KeyW") || isDown("ArrowUp")) throttle += 1;
  if (isDown("KeyS") || isDown("ArrowDown")) throttle -= 1;

  steer += -touchSteer.x;
  throttle += touchSteer.y;

  const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
  if (pads) {
    for (const pad of pads) {
      if (!pad || pad.mapping !== "standard") continue;
      const stick = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
      steer += -stick.x;
      throttle += -stick.y;
      if (pad.buttons[14]?.pressed) steer += 1;
      if (pad.buttons[15]?.pressed) steer -= 1;
      if (pad.buttons[12]?.pressed) throttle += 1;
      if (pad.buttons[13]?.pressed) throttle -= 1;
    }
  }

  steer = Math.max(-1, Math.min(1, steer));
  throttle = Math.max(-1, Math.min(1, throttle));

  const interact =
    isDown("KeyE") || isDown("Space") || Boolean(pads?.[0]?.buttons[0]?.pressed);
  const interactPressed = interact && !prevInteract;
  prevInteract = interact;

  return { throttle, steer, interact, interactPressed };
}
