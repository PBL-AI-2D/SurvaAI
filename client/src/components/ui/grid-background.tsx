import { cn } from "@/lib/utils";
import React from "react";

export function GridBackgroundDemo({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 z-0 bg-center",
          "[background-size:160px_160px]",
          "[background-image:linear-gradient(to_right,rgba(120,120,120,0.30)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.12)_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.20)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]",
          "[mask-image:radial-gradient(circle_at_center,black,transparent_75%)]",
          "[mask-size:100%_100%] [mask-repeat:no-repeat]"
        )}
      />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
