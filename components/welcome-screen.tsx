"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
    isLoading: boolean;
}

export const WelcomeScreen = ({ isLoading }: WelcomeScreenProps) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Ensure the welcome screen stays for at least 2 seconds
        const timer = setTimeout(() => {
            // Only hide if loading is also done
            if (!isLoading) {
                setShow(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isLoading]);

    // Effect to hide after loading is done, even if timer finished earlier
    useEffect(() => {
        if (!isLoading) {
            // We need to check if 2 seconds have passed since mount.
            // But to simplify, we can just rely on the first effect to set a minimum time,
            // and this one to react to isLoading changes *after* the minimum time.
            // Actually the first effect handles the "minimum time" logic mostly.

            // Let's refine:
            // The screen should show for MAX(2s, loadingTime).

            // We can track if minimum time has passed.
        }
    }, [isLoading]);

    // Refined logic:
    const [minTimePassed, setMinTimePassed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimePassed(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const shouldShow = show && (!minTimePassed || isLoading);

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="relative w-26 h-26 md:w-40 md:h-40 rounded-full">
                            <Image
                                src="/logo.png"
                                alt="App Logo"
                                fill
                                className="object-contain rounded-lg"
                                priority
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                                100 Days Challenge
                            </h1>
                            <p className="text-muted-foreground text-sm md:text-base">
                                Build consistency, achieve your goals.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
