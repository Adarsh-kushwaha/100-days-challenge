import React from "react";
import { cn } from "@/lib/utils";
import { type DayData } from "@/lib/hooks/useChallengeData";

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
  let colorClass = "bg-gray-800 dark:border-transparent dark:text-muted-foreground"; // Future/Locked default

  if (status === "missed") {
    colorClass = "bg-red-500/10 dark:border-red-500/30 dark:border-2 dark:text-red-700 dark:text-red-400";
  } else if (data.completedTasks > 0) {
    if (data.completedTasks === 3) colorClass = "bg-green-600/15 dark:border-green-600/50 dark:border-2 dark:text-green-600 dark:text-green-600";
    else if (data.completedTasks === 2) colorClass = "bg-green-400/15 dark:border-green-400/50 dark:border-2 dark:text-green-400 dark:text-green-400";
    else if (data.completedTasks === 1) colorClass = "bg-green-200/15 dark:border-green-200/50 dark:border-2 dark:text-green-200 dark:text-green-200";
  } else if (status === "current") {
    // Current but 0 tasks
    colorClass = "bg-card  dark:text-foreground";
  }

  // Active state styles (hover, scale, ring)
  const activeClass = isClickable
    ? "ring-2 ring-primary/50 shadow-lg scale-105 z-10 cursor-pointer hover:ring-primary/60 transition-transform"
    : "";

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300",
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
