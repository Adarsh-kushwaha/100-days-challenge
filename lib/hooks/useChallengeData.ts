import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp, 
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

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
const START_DATE = "2025-12-23"; // YYYY-MM-DD

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

export function useChallengeData(user: User | null) {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) {
      setDays(getChallengeDays());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const dailyEntriesRef = collection(db, "users", user.uid, "dailyEntries");
      const q = query(dailyEntriesRef);
      const querySnapshot = await getDocs(q);

      const fetchedData: Record<number, DayData> = {};

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const dayNumber = data.day;
        
        // Fetch tasks subcollection
        const tasksRef = collection(db, "users", user.uid, "dailyEntries", docSnapshot.id, "tasks");
        const tasksSnapshot = await getDocs(tasksRef);
        
        const tasksState: TaskState = {
            exercise: false,
            programming: false,
            healthyFood: false
        };

        tasksSnapshot.forEach(taskDoc => {
            const taskData = taskDoc.data();
            if (taskData.name && taskData.name in tasksState) {
                tasksState[taskData.name as keyof TaskState] = taskData.completed;
            }
        });

        // Convert Timestamp to YYYY-MM-DD
        const entryDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
        const isoDate = entryDate.toISOString().split("T")[0];

        fetchedData[dayNumber] = {
            day: dayNumber,
            date: isoDate,
            completedTasks: data.completedTasks || 0,
            tasks: tasksState
        };
      }

      // Merge with default 100-day structure
      const defaultDays = getChallengeDays();
      const mergedDays = defaultDays.map(defaultDay => {
        return fetchedData[defaultDay.day] ? fetchedData[defaultDay.day] : defaultDay;
      });

      setDays(mergedDays);

    } catch (error) {
      console.error("Error fetching challenge data:", error);
      // Fallback to default
      setDays(getChallengeDays());
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
        const dayNumber = targetDay.day;
        const dailyEntriesRef = collection(db, "users", user.uid, "dailyEntries");
        
        // Check if entry exists
        const q = query(dailyEntriesRef, where("day", "==", dayNumber));
        const querySnapshot = await getDocs(q);

        let dailyEntryId: string;

        if (!querySnapshot.empty) {
            // Update existing
            const docRef = querySnapshot.docs[0].ref;
            dailyEntryId = docRef.id;
            
            await updateDoc(docRef, {
                completedTasks: completedCount
                // Note: We don't need to update date/day usually unless corrected
            });

        } else {
            // Create new
            const dateObj = new Date(targetDay.date);
            const docRef = await addDoc(dailyEntriesRef, {
                date: Timestamp.fromDate(dateObj),
                day: dayNumber,
                completedTasks: completedCount,
                createdAt: serverTimestamp()
            });
            dailyEntryId = docRef.id;
        }

        // Handle Tasks Sub-collection
        const tasksRef = collection(db, "users", user.uid, "dailyEntries", dailyEntryId, "tasks");
        const tasksSnapshot = await getDocs(tasksRef);
        
        // Create a map of existing task documents for easy lookup
        const existingTaskDocs: Record<string, string> = {}; // name -> docId
        tasksSnapshot.forEach(doc => {
            const data = doc.data();
            existingTaskDocs[data.name] = doc.id;
        });

        // Update or Create each task
        const taskNames: (keyof TaskState)[] = ["exercise", "programming", "healthyFood"];
        
        for (const name of taskNames) {
            const isCompleted = newTasks[name];
            
            if (existingTaskDocs[name]) {
                // Update existing sub-document
                await updateDoc(doc(db, "users", user.uid, "dailyEntries", dailyEntryId, "tasks", existingTaskDocs[name]), {
                    completed: isCompleted
                });
            } else {
                // Create new sub-document
                await addDoc(tasksRef, {
                    name: name,
                    completed: isCompleted
                });
            }
        }

     } catch (error) {
        console.error("Error saving day:", error);
        // Revert optimistic update if needed or verify on refresh
     }
  };

  return { days, loading, saveDay };
}
