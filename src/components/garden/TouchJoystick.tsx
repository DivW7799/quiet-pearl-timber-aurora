import { useRef } from "react";
import { touchSteer } from "@/lib/garden/input";

export function TouchJoystick() {
  const root = useRef<HTMLDivElement>(null);

  const setFromEvent = (clientX: number, clientY: number) => {
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (clientX - cx) / (rect.width * 0.5);
    const ny = (cy - clientY) / (rect.height * 0.5);
    const m = Math.hypot(nx, ny);
    const k = m > 1 ? 1 / m : 1;
    touchSteer.x = nx * k;
    touchSteer.y = ny * k;
  };

  const clear = () => {
    touchSteer.x = 0;
    touchSteer.y = 0;
  };

  return (
    <div
      ref={root}
      className="pointer-events-auto relative size-[112px] rounded-full border border-border bg-surface/70"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        setFromEvent(e.clientX, e.clientY);
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
      aria-label="Walk"
    >
      <div
        className="pointer-events-none absolute size-11 rounded-full bg-primary/90"
        style={{
          left: `calc(50% + ${touchSteer.x * 28}px)`,
          top: `calc(50% + ${-touchSteer.y * 28}px)`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
