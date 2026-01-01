"use client";

import React, { useState } from "react";
import { StatsHeader } from "@/components/stats-header";
import { DayCard, type DayStatus } from "@/components/day-card";
import { TaskModal } from "@/components/task-modal";
import { useAuthContext } from "@/context/AuthContext";
import { useChallengeData, type TaskState } from "@/lib/hooks/useChallengeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// --- Helper Functions ---

const getLocalTimeISO = () => {
  const now = new Date();
  // We want the local date string YYYY-MM-DD
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

// --- Main Application ---

export default function ChallengeApp() {
  const { user, loading: authLoading } = useAuthContext();
  const { days, loading: challengeLoading, saveDay, resetChallenge } = useChallengeData(user);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (tasks: TaskState) => {
    if (selectedDay === null) return;
    await saveDay(selectedDay, tasks);
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  const todayDate = getLocalTimeISO();

  // Scoring
  const score = days.reduce((acc, day) => {
    // 3 points for 3 tasks (green), 2 for 2 (yellow), 1 for 1 (orange)
    return acc + day.completedTasks;
  }, 0);

  // Days left calculation
  const todayIndex = days.findIndex((d) => d.date === todayDate);
  let daysLeft = 100;
  if (todayIndex !== -1) {
    daysLeft = 100 - todayIndex;
  } else {
    // Check if we are past the end
    if (days.length > 0 && days[days.length - 1].date < todayDate) {
      daysLeft = 0;
    }
    // Check if we are before start
    else if (days.length > 0 && days[0].date > todayDate) {
      daysLeft = 100;
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 font-sans selection:bg-primary/20">
      <StatsHeader daysLeft={daysLeft} score={score} />
      <main className="max-w-4xl mx-auto px-4">
        {authLoading || challengeLoading ? (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
            {Array.from({ length: 100 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
            {days.map((day, index) => {
              const isToday = day.date === todayDate;
              const isPast = day.date < todayDate;
              const isFuture = day.date > todayDate;

              let status: DayStatus = "future";

              if (isFuture) status = "future";
              else if (isToday) {
                status = "current";
              } else if (isPast) {
                if (day.completedTasks > 0) status = "completed";
                else status = "missed";
              }

              // Logic for clickability stays in parent or passed to child?
              // Passed to child as prop.
              const isClickable = status === "current" || (status === "completed" && isToday);

              return (
                <DayCard
                  key={day.day}
                  data={day}
                  status={status}
                  isClickable={isClickable}
                  onClick={() => handleDayClick(index)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer / Legend */}
      <footer className="mt-12 text-center text-sm text-muted-foreground space-y-4">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> 3 Tasks</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> 2 Tasks</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> 1 Task</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Missed</div>
        </div>
        <div className="pt-8">
          {/* <Button
            variant="destructive"
            onClick={async () => {
              if (confirm("Are you sure you want to DELETE ALL DATA and reset the challenge? This cannot be undone.")) {
                await resetChallenge();
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            [Debug] Reset / Clear All Data
          </Button> */}
        </div>
      </footer>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTasks={selectedDay !== null ? days[selectedDay].tasks : { exercise: false, programming: false, healthyFood: false }}
        dayNumber={selectedDay !== null ? days[selectedDay].day : 0}
      />
    </div>
  );
}
