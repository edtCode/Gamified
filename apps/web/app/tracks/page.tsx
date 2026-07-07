"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../providers";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { api } from "@/lib/api";
import type { Badge, Task, Track, User } from "@/lib/types";

export default function TracksPage() {
  const { refresh } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [active, setActive] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState("");
  const [busyTask, setBusyTask] = useState("");

  useEffect(() => {
    api<{ tracks: Track[] }>("/tracks").then((r) => {
      setTracks(r.tracks);
      setActive(r.tracks[0]?.slug ?? "");
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    api<{ tasks: Task[] }>(`/tracks/${active}/tasks`).then((r) => setTasks(r.tasks));
  }, [active]);

  async function complete(taskId: string) {
    setBusyTask(taskId);
    setToast("");
    try {
      const result = await api<{ xpGained: number; leveledUp: boolean; newLevel: number; newBadges: Badge[]; user: User }>(`/me/tasks/${taskId}/complete`, {
        method: "POST",
      });
      setTasks((items) => items.map((item) => (item.id === taskId ? { ...item, completed: true, completedAt: new Date().toISOString() } : item)));
      const badgeText = result.newBadges.length ? ` · ${result.newBadges.map((b) => b.name).join(", ")}` : "";
      setToast(`${result.xpGained} XP earned${result.leveledUp ? ` · Level ${result.newLevel}` : ""}${badgeText}`);
      await refresh();
    } catch (err) {
      setToast((err as Error).message);
    } finally {
      setBusyTask("");
    }
  }

  return (
    <RequireAuth>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Tracks</h1>
        <p className="mt-1 text-ink/65">Complete milestones to gain XP, badges, and streak progress.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Panel className="h-fit">
          <div className="grid gap-2">
            {tracks.map((track) => (
              <button
                key={track.slug}
                className={`rounded-md px-3 py-3 text-left text-sm font-bold transition ${active === track.slug ? "bg-ink text-white" : "bg-paper text-ink hover:bg-amber/15"}`}
                onClick={() => setActive(track.slug)}
              >
                {track.name}
                <span className="mt-1 block text-xs font-medium opacity-70">{track.taskCount} tasks</span>
              </button>
            ))}
          </div>
        </Panel>
        <div className="grid gap-3">
          {toast && (
            <div className="flex items-center gap-2 rounded-md border border-moss/20 bg-moss/10 p-3 text-sm font-semibold text-moss">
              <Sparkles className="h-4 w-4" />
              {toast}
            </div>
          )}
          {tasks.map((task) => (
            <Panel key={task.id} className={task.completed ? "bg-moss/5" : ""}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {task.completed ? <CheckCircle2 className="h-5 w-5 text-moss" /> : task.locked ? <Lock className="h-5 w-5 text-ink/35" /> : null}
                    <h2 className="font-black">{task.title}</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/65">{task.description}</p>
                  <p className="mt-2 text-xs font-bold text-coral">{task.xpReward} XP · unlocks level {task.levelRequired}</p>
                </div>
                <Button disabled={task.completed || task.locked || busyTask === task.id} onClick={() => complete(task.id)}>
                  {task.completed ? "Done" : busyTask === task.id ? "Saving..." : "Complete"}
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
