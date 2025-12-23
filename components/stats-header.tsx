import React from "react";

export function StatsHeader({
  daysLeft,
  score,
}: {
  daysLeft: number;
  score: number;
}) {
  return (
    <header className="w-full max-w-3xl mx-auto mb-8 text-center space-y-4 pt-12 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        100 Days Challenge
      </h1>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-muted-foreground font-medium">
        <div className="px-4 py-2 bg-card rounded-full border shadow-sm">
          ⏳ Days Left: <span className="text-foreground font-bold">{Math.max(0, daysLeft)}</span>
        </div>
        <div className="px-4 py-2 bg-card rounded-full border shadow-sm">
          🏆 Score: <span className="text-primary font-bold">{score}</span> / 300
        </div>
      </div>
    </header>
  );
}
