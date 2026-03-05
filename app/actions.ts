"use server";

import clientPromise from "@/lib/mongodb";
import { DayData, TaskState } from "@/lib/hooks/useChallengeData";

const DB_NAME = "100dayschallenge";
const COLLECTION_NAME = "dailyEntries";

export async function fetchUserChallengeData(uid: string) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        // Fetch start date from a users collection or fallback
        const userDoc = await db.collection("users").findOne({ uid });
        let challengeStartDate = "2026-03-06"; // Hardcoded default per requirements

        if (userDoc?.challengeStartDate) {
            challengeStartDate = userDoc.challengeStartDate;
        } else {
            await db.collection("users").updateOne(
                { uid },
                { $set: { challengeStartDate } },
                { upsert: true }
            );
        }

        const entriesCursor = db.collection(COLLECTION_NAME).find({ uid });
        const entries = await entriesCursor.toArray();

        return {
            success: true,
            challengeStartDate,
            entries: entries.map((e) => ({
                day: e.day,
                date: e.date,
                completedTasks: e.completedTasks,
                tasks: e.tasks,
            })),
        };
    } catch (error: any) {
        console.error("Error fetching user challenge data:", error);
        return { success: false, error: error.message };
    }
}

export async function saveDailyEntry(uid: string, dayData: DayData) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        await db.collection(COLLECTION_NAME).updateOne(
            { uid, day: dayData.day },
            {
                $set: {
                    uid,
                    day: dayData.day,
                    date: dayData.date,
                    completedTasks: dayData.completedTasks,
                    tasks: dayData.tasks,
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );

        return { success: true };
    } catch (error: any) {
        console.error("Error saving daily entry:", error);
        return { success: false, error: error.message };
    }
}
