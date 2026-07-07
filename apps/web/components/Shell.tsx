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
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-indigo-100 bg-gradient-to-b from-white/95 to-indigo-50/50 p-4 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-3 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          <GraduationCap className="h-7 w-7 text-indigo-600" />
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-white/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100">
          <div className="text-sm font-bold text-slate-900">{user?.name}</div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Level {user?.level} • {user?.streakCount}🔥
          </div>
          <div className="mt-3 text-xs text-slate-600">{user?.xp} XP</div>
          <Button variant="ghost" className="mt-3 w-full justify-start px-2 text-slate-700" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/80 backdrop-blur px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
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
                className={`flex min-w-10 items-center justify-center rounded-lg p-2 transition-all ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-white text-slate-700 border border-indigo-100"
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
