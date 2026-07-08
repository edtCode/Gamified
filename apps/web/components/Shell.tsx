"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpenCheck, Flame, GraduationCap, LayoutDashboard, LogOut, Medal, MessageSquare, Zap } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "@/app/providers";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracks", label: "Tracks", icon: BookOpenCheck },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/mentors", label: "Mentors", icon: MessageSquare },
  { href: "/rooms", label: "Study Rooms", icon: MessageSquare },
  { href: "/roadmap", label: "Roadmap", icon: BookOpenCheck },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-[#fbfaf7]/85 p-4 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-black text-ink">
          <GraduationCap className="h-7 w-7 text-ink" />
          LevelUp
        </Link>
        <nav className="mt-8 grid gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-ink text-[#fbfaf7] shadow-panel"
                    : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-md border border-ink/10 bg-paper p-4">
          <div className="text-sm font-bold text-ink">{user?.name}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-ink/60 font-medium">
            <Flame className="h-3.5 w-3.5 text-ink" />
            Level {user?.level} / {user?.streakCount} day streak
          </div>
          <div className="mt-3 text-xs text-ink/55">{user?.xp} XP</div>
          <Button variant="ghost" className="mt-3 w-full justify-start px-2 text-ink/70" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-[#fbfaf7]/85 backdrop-blur-xl px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-ink">
            <GraduationCap className="h-6 w-6 text-ink" />
            LevelUp
          </Link>
          <Button variant="ghost" className="px-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex min-w-10 items-center justify-center rounded-md border p-2 transition-all ${
                  active
                    ? "border-ink bg-ink text-[#fbfaf7] shadow-panel"
                    : "border-ink/10 bg-[#fbfaf7] text-ink/70"
                }`}
                title={item.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
