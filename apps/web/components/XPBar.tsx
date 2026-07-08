export function XPBar({ xpIntoLevel, xpForThisLevel }: { xpIntoLevel: number; xpForThisLevel: number }) {
  const pct = xpForThisLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForThisLevel) * 100)) : 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-steelWhite/90">Level Progress</span>
        <span className="text-sm font-bold text-steelWhite">{pct}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-steelWhite/20 backdrop-blur">
        <div className="h-full rounded-full bg-steelWhite transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-steelWhite/70 font-medium">
        <span>{xpIntoLevel} / {xpForThisLevel} XP</span>
        <span>{xpForThisLevel - xpIntoLevel} to level up</span>
      </div>
    </div>
  );
}
