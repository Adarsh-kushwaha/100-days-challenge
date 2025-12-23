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
import { Label } from "@/components/ui/label"; // Checkbox often needs Label or wrapper
import { cn } from "@/lib/utils";
import { TaskState } from "@/lib/hooks/useChallengeData";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tasks: TaskState) => void;
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

  // Reset state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setTasks(initialTasks);
    }
  }, [isOpen, initialTasks]);

  const toggleTask = (key: keyof TaskState) => {
    setTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Day {dayNumber}</DialogTitle>
          <DialogDescription>
            Review your goals for today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {[
            { key: "exercise", label: "🏋️ Exercise", desc: "Did you move your body?" },
            { key: "programming", label: "💻 Programming", desc: "Did you code today?" },
            { key: "healthyFood", label: "🥗 Healthy Food", desc: "Did you eat clean?" },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              onClick={() => toggleTask(key as keyof TaskState)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 select-none",
                tasks[key as keyof TaskState]
                  ? "border-green-500/30 dark:border-green-500/30 dark:bg-primary-100/20"
                  : "border-transparent dark:border-transparent bg-secondary hover:bg-secondary/80 dark:bg-secondary/80"
              )}
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground block">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
              <Checkbox
                checked={tasks[key as keyof TaskState]}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground pointer-events-none"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer border-2">
            Cancel
          </Button>
          <Button onClick={() => onSave(tasks)} className="flex-1 cursor-pointer">
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
