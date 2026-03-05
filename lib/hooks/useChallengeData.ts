import { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { fetchUserChallengeData, saveDailyEntry } from "@/app/actions";

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
  tasks: TaskState;
};

// --- Constants ---
const TOTAL_DAYS = 100;
const DEFAULT_START_DATE = "2026-03-06"; // YYYY-MM-DD

// --- Helper Functions ---
const getChallengeDays = (startDateStr: string): DayData[] => {
  const days: DayData[] = [];
  const start = new Date(startDateStr);

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

const getLocalAuthDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

export function useChallengeData(user: User | null) {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(DEFAULT_START_DATE);

  // Reset Challenge is no longer used for missed days, but kept for manual reset if needed
  const resetChallenge = useCallback(async () => {
    if (!user) return;
    console.log("Resetting challenge (Mongo migration means this is likely manual)");
    // Note: Full reset logic in MongoDB would involve server action
    // For now, we update local state
    const today = getLocalAuthDate();
    setStartDate(today);
    setDays(getChallengeDays(today));
  }, [user]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) {
      setDays(getChallengeDays(DEFAULT_START_DATE));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchUserChallengeData(user.uid);
      if (!response.success) {
        throw new Error(response.error);
      }

      setStartDate(response.challengeStartDate || DEFAULT_START_DATE);

      const fetchedData: Record<number, DayData> = {};

      if (response.entries) {
        for (const entry of response.entries) {
          fetchedData[entry.day] = {
            day: entry.day,
            date: entry.date,
            completedTasks: entry.completedTasks || 0,
            tasks: entry.tasks || { exercise: false, programming: false, healthyFood: false }
          };
        }
      }

      // Merge with default structure
      const defaultDays = getChallengeDays(response.challengeStartDate || DEFAULT_START_DATE);
      const mergedDays = defaultDays.map(defaultDay => {
        return fetchedData[defaultDay.day] ? fetchedData[defaultDay.day] : defaultDay;
      });

      setDays(mergedDays);

    } catch (error) {
      console.error("Error fetching challenge data:", error);
      setDays(getChallengeDays(DEFAULT_START_DATE));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Save function
  const saveDay = async (dayIndex: number, newTasks: TaskState) => {
    if (!user) return;

    // Optimistic update locally
    const newDays = [...days];
    const targetDay = newDays[dayIndex];
    const completedCount = Object.values(newTasks).filter(Boolean).length;

    newDays[dayIndex] = {
      ...targetDay,
      tasks: newTasks,
      completedTasks: completedCount
    };
    setDays(newDays);

    try {
      await saveDailyEntry(user.uid, newDays[dayIndex]);
    } catch (error) {
      console.error("Error saving day:", error);
      // rollback if failed
      setDays([...days]);
    }
  };

  return { days, loading, saveDay, resetChallenge, startDate };
}
