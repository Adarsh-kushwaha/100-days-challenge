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
  serverTimestamp,
  getDoc,
  setDoc,
  writeBatch
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
const DEFAULT_START_DATE = "2026-01-01"; // YYYY-MM-DD

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

  // Reset Challenge
  const resetChallenge = useCallback(async () => {
      if (!user) return;
      console.log("Resetting challenge...");

      try {
          // 1. Delete all dailyEntries
          const dailyEntriesRef = collection(db, "users", user.uid, "dailyEntries");
          const q = query(dailyEntriesRef);
          const snapshot = await getDocs(q);
          
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => {
              batch.delete(doc.ref);
          });
          await batch.commit();

          // 2. Set new start date to TODAY
          const today = getLocalAuthDate();
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { challengeStartDate: today }, { merge: true });
          
          setStartDate(today);
          setDays(getChallengeDays(today));
          
      } catch (error) {
          console.error("Error resetting challenge:", error);
      }
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
      // 1. Fetch Challenge Start Date
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let currentStartDate = DEFAULT_START_DATE;

      if (userSnap.exists() && userSnap.data().challengeStartDate) {
          currentStartDate = userSnap.data().challengeStartDate;
      } else {
          // Initialize if missing
           await setDoc(userRef, { challengeStartDate: DEFAULT_START_DATE }, { merge: true });
      }
      setStartDate(currentStartDate);

      // 2. Fetch Entries
      const dailyEntriesRef = collection(db, "users", user.uid, "dailyEntries");
      const q = query(dailyEntriesRef);
      const querySnapshot = await getDocs(q);

      const fetchedData: Record<number, DayData> = {};
      const filledDates: Set<string> = new Set();
      
      // Temporary storage to check for validity before finalizing
      // We need to fetch sub-tasks for each to calculate completed count accurately if not stored?
      // Actually standard logic: relying on `completedTasks` field in doc.
      
      const entriesByDate: Record<string, { completedTasks: number }> = {};

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
        
        entriesByDate[isoDate] = { completedTasks: data.completedTasks || 0 };
      }

      // 3. Check for Missed Days (Logic: Iterate from Start Date -> Yesterday)
      // If any day in that range has 0 completed tasks (or no entry), RESET.
      
      const today = getLocalAuthDate();
      let shouldReset = false;
      const start = new Date(currentStartDate);
      const now = new Date(today);
      
      // We iterate day by day
      // Avoid infinite loop if dates are weird
      const maxCheckDays = 365; 
      let checkDate = new Date(start);
      
      // If start date is in future (e.g. user manually set it?), we don't reset.
      // If start date is today, we don't reset.
      
      if (checkDate < now) {
          let loopCount = 0;
           while (checkDate < now && loopCount < maxCheckDays) {
              const isoCheck = checkDate.toISOString().split("T")[0];
              
              // Check if this date has > 0 tasks
              // We need to find if we have an entry for this date in `entriesByDate`
              const entry = entriesByDate[isoCheck];
              
              if (!entry || entry.completedTasks === 0) {
                  console.log(`Missed day found: ${isoCheck}. Resetting...`);
                  shouldReset = true;
                  break;
              }
              
              checkDate.setDate(checkDate.getDate() + 1);
              loopCount++;
           }
      }

      if (shouldReset) {
          await resetChallenge();
          setLoading(false);
          return; // fetch will be re-triggered or state updated by resetChallenge
      }

      // 4. Merge with default structure
      const defaultDays = getChallengeDays(currentStartDate);
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
  }, [user, resetChallenge]);

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
        
        // Check if entry exists for this specific DAY NUMBER (which is tied to date in our logic now)
        // Ideally we should query by Date to be safer, but Day Number is derived from Start Date
        // so it should be consistent unless Start Date changes mid-operation.
        
        const q = query(dailyEntriesRef, where("day", "==", dayNumber));
        const querySnapshot = await getDocs(q);

        let dailyEntryId: string;

        if (!querySnapshot.empty) {
            // Update existing
            const docRef = querySnapshot.docs[0].ref;
            dailyEntryId = docRef.id;
            
            await updateDoc(docRef, {
                completedTasks: completedCount
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
        
        const existingTaskDocs: Record<string, string> = {}; 
        tasksSnapshot.forEach(doc => {
            const data = doc.data();
            existingTaskDocs[data.name] = doc.id;
        });

        const taskNames: (keyof TaskState)[] = ["exercise", "programming", "healthyFood"];
        
        for (const name of taskNames) {
            const isCompleted = newTasks[name];
            
            if (existingTaskDocs[name]) {
                await updateDoc(doc(db, "users", user.uid, "dailyEntries", dailyEntryId, "tasks", existingTaskDocs[name]), {
                    completed: isCompleted
                });
            } else {
                await addDoc(tasksRef, {
                    name: name,
                    completed: isCompleted
                });
            }
        }

     } catch (error) {
        console.error("Error saving day:", error);
     }
  };

  return { days, loading, saveDay, resetChallenge };
}
