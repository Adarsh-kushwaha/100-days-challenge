import React, { useState, useEffect } from "react";
import { type TaskState } from "@/app/page";
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
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-secondary hover:bg-secondary/80"
              )}
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground block">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </div>
              <Checkbox 
                checked={tasks[key as keyof TaskState]} 
                // We're handling click on parent div, so pointer-events-none on checkbox prevents double toggle if user clicks box directly? 
                // Shadcn checkbox handles its own events. Better to let parent handle logic or just make checkbox controlled.
                // Actually let's make the checkbox purely visual or controlled by the parent div click to maintain the 'big hit area' UX.
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground pointer-events-none"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
           <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={() => onSave(tasks)} className="flex-1">
            Save Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
