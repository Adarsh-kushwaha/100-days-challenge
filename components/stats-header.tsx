import React from "react";

export function StatsHeader({
  daysLeft,
  score,
}: {
  daysLeft: number;
  score: number;
}) {
  return (
    <header className="w-full max-w-3xl mx-auto mb-8 text-center space-y-6 pt-12 px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 bg-clip-text text-transparent drop-shadow-sm">
            100 Days Challenge
          </h1>
          {/* <p className="text-muted-foreground text-lg sm:text-xl max-w-lg mx-auto font-medium">
            Build consistency, track your habits, and transform your lifestyle one day at a time.
          </p> */}
        </div>
      </div>
      <div className="flex sm:flex-row justify-center items-center gap-4 text-muted-foreground font-medium">
        <div className="px-4 py-2 bg-card rounded-full border border-gray-700/70 shadow-sm">
          ⏳ Days Left: <span className="text-foreground font-bold">{Math.max(0, daysLeft)}</span>
        </div>
        <div className="px-4 py-2 bg-card rounded-full border border-gray-700/70 shadow-sm">
          🏆 Score: <span className="text-primary font-bold">{score}</span> / 300
        </div>
      </div>
    </header>
  );
}
