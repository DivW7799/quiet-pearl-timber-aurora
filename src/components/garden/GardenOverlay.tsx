import { CloudSun, Eye, Flower2, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGardenStore } from "@/lib/garden/store";
import { TouchJoystick } from "./TouchJoystick";

export function GardenOverlay() {
  const playing = useGardenStore((s) => s.playing);
  const enter = useGardenStore((s) => s.enter);
  const cameraMode = useGardenStore((s) => s.cameraMode);
  const setCameraMode = useGardenStore((s) => s.setCameraMode);
  const timeOfDay = useGardenStore((s) => s.timeOfDay);
  const setTimeOfDay = useGardenStore((s) => s.setTimeOfDay);
  const autoTime = useGardenStore((s) => s.autoTime);
  const setAutoTime = useGardenStore((s) => s.setAutoTime);
  const hint = useGardenStore((s) => s.hint);
  const flowers = useGardenStore((s) => s.flowersPicked);
  const seated = useGardenStore((s) => s.seated);

  const hourLabel = formatHour(timeOfDay);

  const onInteract = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyE", key: "e" }));
    window.setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyE", key: "e" }));
    }, 90);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      {!playing && (
        <div className="pointer-events-auto flex h-full flex-col items-center justify-end bg-bg/35 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-16 sm:justify-center sm:pb-0">
          <div className="w-full max-w-md rounded-xl border border-border bg-bg/80 px-6 py-7">
            <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
              Lakeside garden
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight tracking-[-0.03em] italic">
              Willowmere
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Walk the path around the lake. Sit a while. The willows lean, the ducks paddle, and
              the sky keeps its own hours.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={enter} className="w-full sm:w-auto">
                Enter garden
              </Button>
              <p className="text-xs text-muted">W S walk · A D turn · E interact</p>
            </div>
          </div>
        </div>
      )}

      {playing && (
        <>
          <header className="pointer-events-auto absolute top-0 right-0 left-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div>
              <p className="font-display text-lg tracking-[-0.03em] italic">Willowmere</p>
              <p className="text-xs text-muted">{hourLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-bg/70 px-3 text-sm tabular-nums">
                <Flower2 className="size-4 text-sage" />
                {flowers}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label={cameraMode === "follow" ? "Look around" : "Walk"}
                onClick={() => setCameraMode(cameraMode === "follow" ? "orbit" : "follow")}
              >
                {cameraMode === "follow" ? <Eye /> : <Footprints />}
              </Button>
            </div>
          </header>

          <div className="pointer-events-auto absolute top-20 right-4 left-4 flex max-w-56 flex-col gap-2 rounded-lg border border-border bg-bg/70 p-3 max-sm:ml-auto sm:left-auto">
            <label className="flex items-center justify-between text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CloudSun className="size-3.5" />
                Hour
              </span>
              <span className="tabular-nums text-fg">{hourLabel}</span>
            </label>
            <input
              type="range"
              min={0}
              max={24}
              step={0.1}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Time of day"
            />
            <button
              type="button"
              className="text-left text-xs text-muted hover:text-fg"
              onClick={() => setAutoTime(!autoTime)}
            >
              {autoTime ? "Pause the sky" : "Let the day drift"}
            </button>
          </div>

          {hint && (
            <p className="absolute bottom-28 left-1/2 max-w-[min(90vw,28rem)] -translate-x-1/2 rounded-md border border-border bg-bg/75 px-3 py-2 text-center text-sm text-fg sm:bottom-8">
              {hint}
            </p>
          )}

          <div className="pointer-events-auto absolute right-0 bottom-0 left-0 flex items-end justify-between gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
            <TouchJoystick />
            <Button variant="outline" size="icon" aria-label="Sit or gather" onClick={onInteract}>
              {seated ? <Footprints /> : <Flower2 />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function formatHour(h: number) {
  const wrapped = ((h % 24) + 24) % 24;
  const hr = Math.floor(wrapped);
  const min = Math.round((wrapped - hr) * 60) % 60;
  const hh = hr % 12 === 0 ? 12 : hr % 12;
  const ap = hr < 12 ? "AM" : "PM";
  return `${hh}:${min.toString().padStart(2, "0")} ${ap}`;
}
