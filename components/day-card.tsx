import React from "react";
import { cn } from "@/lib/utils";
import { type DayData } from "@/app/page";

// We can define the status type here or import it if we export it from page
export type DayStatus = "locked" | "current" | "future" | "completed" | "missed";

interface DayCardProps {
  data: DayData;
  status: DayStatus;
  onClick: () => void;
  isClickable: boolean;
}

export function DayCard({
  data,
  status,
  onClick,
  isClickable,
}: DayCardProps) {

  // Base styles
  let colorClass = "bg-secondary/50 border-transparent text-muted-foreground"; // Future/Locked default

  if (status === "missed") {
    colorClass = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
  } else if (data.completedTasks > 0) {
    if (data.completedTasks === 3) colorClass = "bg-green-500/15 border-green-500/50 text-green-700 dark:text-green-400";
    else if (data.completedTasks === 2) colorClass = "bg-yellow-500/15 border-yellow-500/50 text-yellow-700 dark:text-yellow-400";
    else if (data.completedTasks === 1) colorClass = "bg-orange-500/15 border-orange-500/50 text-orange-700 dark:text-orange-400";
  } else if (status === "current") {
    // Current but 0 tasks
    colorClass = "bg-card border-primary text-foreground";
  }

  // Active state styles (hover, scale, ring)
  const activeClass = isClickable 
    ? "ring-2 ring-primary/20 shadow-lg scale-105 z-10 cursor-pointer hover:ring-primary/40 transition-transform" 
    : "";
  
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-300",
        colorClass,
        activeClass,
        !isClickable && "cursor-not-allowed opacity-60 grayscale-[0.5]",
        // If it's a colored card, add specific hover if clickable
        isClickable && data.completedTasks > 0 && "hover:brightness-95 dark:hover:brightness-110"
      )}
    >
      <span className="text-sm sm:text-lg font-bold">{data.day}</span>
      {data.completedTasks > 0 && (
        <div className="flex gap-0.5 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i < data.completedTasks ? "bg-current" : "bg-current/20"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
