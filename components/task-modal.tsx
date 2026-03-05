import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TaskState } from "@/lib/hooks/useChallengeData";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tasks: TaskState) => Promise<void>;
  initialTasks: TaskState;
  dayNumber: number;
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  initialTasks,
  dayNumber,
}: TaskModalProps) {
  const [tasks, setTasks] = useState<TaskState>(initialTasks);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setTasks(initialTasks);
      setIsSaving(false);
    }
  }, [isOpen, initialTasks]);

  const toggleTask = (key: keyof TaskState) => {
    if (isSaving) return;
    setTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(tasks);
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setIsSaving(false);
      // Wait a tick then close to allow visual "saved" confirmation if desired, but parent handles closing normally.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-sm bg-zinc-950/70 backdrop-blur-2xl border-white/20 shadow-2xl overflow-hidden rounded-xl p-0">
        <div className="px-6 pt-6 pb-2 relative">
          {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div> */}
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-emerald-400">Day {dayNumber}</span> Mission
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs font-medium text-left">
              Complete your daily tasks.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-6 py-4">
          {[
            { key: "exercise", label: "🏋️ Exercise", desc: "Did you exercise for 30 min and walk 5,000 steps?" },
            { key: "programming", label: "💻 Programming", desc: "Did you do at least 2 DSA and 1 Machine Coding Q?" },
            { key: "healthyFood", label: "🥗 Healthy Food", desc: "Did you eat clean at least 2 meals a day?" },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              onClick={() => toggleTask(key as keyof TaskState)}
              className={cn(
                "group relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 select-none overflow-hidden",
                tasks[key as keyof TaskState]
                  ? "bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5",
                isSaving && "opacity-50 pointer-events-none cursor-default"
              )}
            >
              {/* Active Glow Effect */}
              {tasks[key as keyof TaskState] && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
              <div
                className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  tasks[key as keyof TaskState]
                    ? "bg-emerald-500/10 dark:bg-emerald-500/20 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]"
                    : "bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
                )}
              >
                <div className="text-xl leading-none">{label.split(" ")[0]}</div>
              </div>
              <div className="space-y-1 flex-1">
                <span className={cn(
                  "font-bold block text-sm transition-colors",
                  tasks[key as keyof TaskState] ? "text-emerald-400" : "text-zinc-200"
                )}>
                  {label.substring(label.indexOf(" ") + 1)}
                </span>
                <span className="text-xs text-zinc-500 leading-tight block pr-4">{desc}</span>
              </div>
              <div className="flex-shrink-0 pt-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border",
                  tasks[key as keyof TaskState]
                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : "border-zinc-700 bg-transparent"
                )}>
                  {tasks[key as keyof TaskState] && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          <DialogFooter className="flex flex-row gap-3 sm:gap-3 w-full sm:justify-between items-center mt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-xl h-12 font-semibold text-red-500/50 hover:bg-red-500/30 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 cursor-pointer rounded-xl h-12 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : "Save Progress"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
