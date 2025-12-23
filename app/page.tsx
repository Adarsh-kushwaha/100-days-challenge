"use client";

import React, { useState, useEffect } from "react";
import { StatsHeader } from "@/components/stats-header";
import { DayCard, type DayStatus } from "@/components/day-card";
import { TaskModal } from "@/components/task-modal";

// --- Types ---

export type TaskState = {
  exercise: boolean;
  programming: boolean;
  healthyFood: boolean;
};

export type DayData = {
  day: number;
  date: string; // ISO Date string YYYY-MM-DD
  completedTasks: number;
  tasks: TaskState; // optimizing UX by persisting specific tasks
};

// --- Constants ---
const TOTAL_DAYS = 100;
const START_DATE = "2025-12-23"; // YYYY-MM-DD
const STORAGE_KEY = "100DayChallenge";

// --- Helper Functions ---

const getChallengeDays = (): DayData[] => {
  const days: DayData[] = [];
  const start = new Date(START_DATE);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      day: i + 1,
      date: date.toISOString().split("T")[0],
      completedTasks: 0,
      tasks: { exercise: false, programming: false, healthyFood: false },
    });
  }
  return days;
};

const getLocalTimeISO = () => {
  const now = new Date();
  // We want the local date string YYYY-MM-DD
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

// --- Main Application ---

export default function ChallengeApp() {
  const [days, setDays] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setDays(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data", e);
        setDays(getChallengeDays());
      }
    } else {
      setDays(getChallengeDays());
    }
    setIsLoaded(true);
  }, []);

  // Save Data
  useEffect(() => {
    if (isLoaded && days.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
    }
  }, [days, isLoaded]);

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setIsModalOpen(true);
  };

  const handleSaveTask = (tasks: TaskState) => {
    if (selectedDay === null) return;

    const completedCount = Object.values(tasks).filter(Boolean).length;
    
    setDays((prev) => {
      const newDays = [...prev];
      newDays[selectedDay] = {
        ...newDays[selectedDay],
        tasks: tasks,
        completedTasks: completedCount,
      };
      return newDays;
    });
    
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  const todayDate = getLocalTimeISO();
  
  // Scoring
  const score = days.reduce((acc, day) => {
      // 3 points for 3 tasks (green), 2 for 2 (yellow), 1 for 1 (orange)
      return acc + day.completedTasks;
  }, 0);

  // Days left calculation (same logic as before)
  const todayIndex = days.findIndex(d => d.date === todayDate);
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
      </main>

      {/* Footer / Legend */}
      <footer className="mt-12 text-center text-sm text-muted-foreground space-y-4">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> 3 Tasks</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> 2 Tasks</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> 1 Task</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Missed</div>
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
