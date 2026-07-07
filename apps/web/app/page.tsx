"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, BookOpenCheck, Flame, Trophy } from "lucide-react";
import { useAuth } from "./providers";
import { RequireAuth } from "@/components/RequireAuth";
import { Panel } from "@/components/Panel";
import { XPBar } from "@/components/XPBar";
import { api } from "@/lib/api";
import type { Badge, Track } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (!user) return;

    void Promise.all([
      api<{ badges: Badge[] }>("/me/badges").then((r) => setBadges(r.badges)),
      api<{ tracks: Track[] }>("/tracks").then((r) => setTracks(r.tracks)),
    ]).catch(() => {
      // ignore fetch failures until auth state stabilizes
    });
  }, [user]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm font-semibold text-ink/65">Loading...</div>;
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-full max-w-3xl space-y-8 rounded-3xl border border-indigo-100 bg-white/95 p-10 shadow-2xl shadow-indigo-100/50 backdrop-blur-lg">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">LevelUp Campus</p>
            <h1 className="text-4xl font-black text-slate-900 sm:text-5xl">Learn together, level up faster.</h1>
            <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
              Join your batch, unlock badges, compete on leaderboards, and collaborate in live study rooms.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition hover:shadow-xl">
              Sign in to your dashboard
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-6 py-4 text-sm font-bold text-slate-900 transition hover:bg-indigo-50">
              Create your account
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "XP", value: "220", description: "Grow your score" },
              { label: "Badges", value: "12", description: "Earn achievements" },
              { label: "Rooms", value: "5", description: "Join study groups" },
              { label: "Tracks", value: "8", description: "Follow learning paths" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-indigo-50 p-5 text-center">
                <div className="text-3xl font-black text-slate-900">{item.value}</div>
                <div className="mt-2 text-sm text-slate-600">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <RequireAuth>
      <div className="grid gap-5">
        <section className="rounded-md bg-ink p-6 text-white shadow-panel">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-white/65">{user.college.name} · Batch {user.batch}</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Level {user.level}: {user.levelTitle}</h1>
              <p className="mt-2 max-w-2xl text-white/70">{user.name}, you have {user.xp} XP, {user.tasksCompleted} tasks completed, and {user.badgeCount} badges earned.</p>
            </div>
            <Link href="/tracks" className="inline-flex h-11 items-center justify-center rounded-md bg-coral px-4 text-sm font-bold">Complete a task</Link>
          </div>
          <div className="mt-6 rounded-md bg-white/10 p-4">
            <XPBar xpIntoLevel={user.xpIntoLevel} xpForThisLevel={user.xpForThisLevel} />
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "XP", value: user.xp, icon: Trophy },
            { label: "Streak", value: `${user.streakCount} days`, icon: Flame },
            { label: "Tasks", value: user.tasksCompleted, icon: BookOpenCheck },
            { label: "Badges", value: user.badgeCount, icon: Award },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Panel key={stat.label}>
                <Icon className="h-5 w-5 text-coral" />
                <div className="mt-4 text-2xl font-black">{stat.value}</div>
                <div className="text-sm text-ink/60">{stat.label}</div>
              </Panel>
            );
          })}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Learning tracks</h2>
              <Link className="text-sm font-bold text-sky" href="/tracks">View all</Link>
            </div>
            <div className="grid gap-3">
              {tracks.map((track) => (
                <div key={track.slug} className="rounded-md border border-ink/10 p-4">
                  <div className="font-bold">{track.name}</div>
                  <div className="mt-1 text-sm text-ink/60">{track.description}</div>
                  <div className="mt-3 text-xs font-semibold text-moss">{track.taskCount} milestones</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl font-black">Badge shelf</h2>
            <div className="mt-4 grid gap-3">
              {badges.length === 0 && <p className="text-sm text-ink/60">Complete your first task to earn a badge.</p>}
              {badges.map((badge) => (
                <div key={badge.slug} className="flex gap-3 rounded-md bg-paper p-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="font-bold">{badge.name}</div>
                    <div className="text-sm text-ink/60">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </RequireAuth>
  );
}
