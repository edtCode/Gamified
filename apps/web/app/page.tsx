"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, BookOpenCheck, Flame, Sparkles, Trophy, UserPlus } from "lucide-react";
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
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border border-ink/10 border-t-ink/55" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen px-4 py-8 sm:py-12">
        <section data-animate className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-steelWhite/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/55 shadow-panel backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              LevelUp Campus
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                Learn sharper. Level up together.
              </h1>
              <p className="max-w-xl text-base leading-7 text-ink/62 sm:text-lg">
                A focused learning dashboard for college batches, with tracks, mentors, study rooms, XP, and progress that feels calm instead of noisy.
              </p>
            </div>
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <Link href="/login" prefetch className="steel-button motion-button group inline-flex min-h-14 items-center justify-between rounded-md border border-silver/55 bg-ink px-5 py-4 text-sm font-bold text-steelWhite shadow-button transition">
                <span>Sign in</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-steelWhite/12 transition group-hover:bg-steelWhite/20">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/signup" prefetch className="steel-button motion-button group inline-flex min-h-14 items-center justify-between rounded-md border border-silver/70 bg-steelWhite/85 px-5 py-4 text-sm font-bold text-ink shadow-panel backdrop-blur transition hover:border-ink/35">
                <span>Create account</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-ink/7 transition group-hover:bg-ink/10">
                  <UserPlus className="h-4 w-4" />
                </span>
              </Link>
            </div>
            <div className="grid max-w-2xl grid-cols-3 gap-3">
              {[
                { label: "Active tracks", value: "8" },
                { label: "Study rooms", value: "5" },
                { label: "Batch badges", value: "12" },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-ink/10 bg-steelWhite/70 p-4 shadow-panel backdrop-blur">
                  <div className="text-2xl font-black text-ink">{item.value}</div>
                  <div className="mt-1 text-xs font-semibold text-ink/50">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border border-ink/5 bg-steelWhite/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-md border border-ink/10 bg-steelWhite/88 p-5 shadow-panel backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between border-b border-ink/10 pb-4">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2 className="mt-1 text-2xl font-black text-ink">Campus momentum</h2>
                </div>
                <div className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-steelWhite">Live</div>
              </div>
              <div className="space-y-3">
                {[
                  ["Roadmap", "Complete 3 milestones", "72%"],
                  ["Mentors", "2 new replies", "Fast"],
                  ["Leaderboard", "Rank #4 in batch", "+180 XP"],
                ].map(([title, detail, meta]) => (
                  <div key={title} className="rounded-md border border-ink/10 bg-paper/75 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-black text-ink">{title}</div>
                        <div className="mt-1 text-sm text-ink/55">{detail}</div>
                      </div>
                      <div className="rounded-full border border-ink/10 bg-steelWhite px-3 py-1 text-xs font-bold text-ink/65">{meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-md bg-ink p-5 text-steelWhite">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Weekly focus</span>
                  <span>84%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-steelWhite/18">
                  <div className="h-full w-[84%] rounded-full bg-steelWhite" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <RequireAuth>
      <div className="grid gap-5">
        <section data-animate className="rounded-md bg-ink p-6 text-steelWhite shadow-panel">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-steelWhite/65">{user.college.name} · Batch {user.batch}</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Level {user.level}: {user.levelTitle}</h1>
              <p className="mt-2 max-w-2xl text-steelWhite/70">{user.name}, you have {user.xp} XP, {user.tasksCompleted} tasks completed, and {user.badgeCount} badges earned.</p>
            </div>
            <Link href="/tracks" prefetch className="steel-button motion-button inline-flex h-11 items-center justify-center rounded-md border border-silver/60 bg-steelWhite px-4 text-sm font-bold text-ink shadow-button transition">Complete a task</Link>
          </div>
          <div className="mt-6 rounded-md bg-steelWhite/10 p-4">
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
                <Icon className="h-5 w-5 text-ink" />
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
              <Link className="text-sm font-bold text-ink underline-offset-4 hover:underline" href="/tracks" prefetch>View all</Link>
            </div>
            <div className="grid gap-3">
              {tracks.map((track) => (
                <div key={track.slug} className="rounded-md border border-ink/10 p-4">
                  <div className="font-bold">{track.name}</div>
                  <div className="mt-1 text-sm text-ink/60">{track.description}</div>
                  <div className="mt-3 text-xs font-semibold text-ink/45">{track.taskCount} milestones</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl font-black">Badge shelf</h2>
            <div className="mt-4 grid gap-3">
              {badges.length === 0 && <p className="text-sm text-ink/60">Complete your first task to earn a badge.</p>}
              {badges.map((badge) => (
                <div key={badge.slug} className="flex gap-3 rounded-md border border-ink/10 bg-paper p-3">
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
