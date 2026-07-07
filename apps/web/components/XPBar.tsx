export function XPBar({ xpIntoLevel, xpForThisLevel }: { xpIntoLevel: number; xpForThisLevel: number }) {
  const pct = xpForThisLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForThisLevel) * 100)) : 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/90">Level Progress</span>
        <span className="text-sm font-bold text-white">{pct}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-white/20 backdrop-blur">
        <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 transition-all duration-500 shadow-lg" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-white/70 font-medium">
        <span>{xpIntoLevel} / {xpForThisLevel} XP</span>
        <span>{xpForThisLevel - xpIntoLevel} to level up</span>
      </div>
    </div>
  );
}
