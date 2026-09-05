import { lazy, Suspense, useEffect, useState } from "react";
import { bindGardenInput } from "@/lib/garden/input";
import { GardenOverlay } from "./GardenOverlay";

const GardenCanvas = lazy(() => import("./GardenCanvas"));

export function GardenApp() {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
    return bindGardenInput();
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {client ? (
        <Suspense fallback={<div className="absolute inset-0 bg-bg" />}>
          <div className="absolute inset-0">
            <GardenCanvas />
          </div>
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-bg" />
      )}
      <GardenOverlay />
    </main>
  );
}
