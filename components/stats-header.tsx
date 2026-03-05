import React from "react";

export function StatsHeader({
  daysLeft,
  score,
  endDate,
}: {
  daysLeft: number;
  score: number;
  endDate: string | null;
}) {
  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Loading...";
  const formattedStartDate = "6 Mar 2026";

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
      <div className="grid grid-cols-4 md:flex md:flex-row justify-center items-center gap-2 sm:gap-3 text-muted-foreground font-medium w-full max-w-sm md:max-w-none mx-auto">
        <div className="col-span-2 md:col-span-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-card rounded-xl border border-gray-700/50 shadow-sm text-center flex flex-col items-center justify-center transition-all hover:bg-card/80">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 mb-0.5">🗓️ Days Left</span>
          <span className="text-foreground font-black text-base sm:text-lg">{Math.max(0, daysLeft)}</span>
        </div>
        <div className="col-span-2 md:col-span-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-card rounded-xl border border-gray-700/50 shadow-sm text-center flex flex-col items-center justify-center transition-all hover:bg-card/80">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 mb-0.5">🏆 Score</span>
          <span className="text-foreground font-black text-base sm:text-lg text-primary">{score}<span className="text-[10px] text-muted-foreground font-normal ml-0.5">/100</span></span>
        </div>
        <div className="col-span-2 md:col-span-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-card rounded-xl border border-gray-700/50 shadow-sm text-center flex flex-col items-center justify-center transition-all hover:bg-card/80">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 mb-0.5">🏁 Start Date</span>
          <span className="text-foreground font-bold text-sm whitespace-nowrap">{formattedStartDate}</span>
        </div>
        <div className="col-span-2 md:col-span-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-card rounded-xl border border-gray-700/50 shadow-sm text-center flex flex-col items-center justify-center transition-all hover:bg-card/80">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 mb-0.5">🎯 End Date</span>
          <span className="text-foreground font-bold text-sm whitespace-nowrap">{formattedEndDate}</span>
        </div>
      </div>
    </header>
  );
}
