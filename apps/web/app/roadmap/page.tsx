"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Panel } from "@/components/Panel";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Task = { id: string; title: string; description: string; xpReward: number; levelRequired: number };
type Track = { id: string; slug: string; name: string; description: string; tasks: Task[] };

export default function RoadmapPage() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ tracks: Track[] }>("/roadmap")
      .then((res) => setTracks(res.tracks))
      .catch((err) => setError(err.message ?? String(err)));
  }, []);

  return (
    <RequireAuth>
      <Panel>
        <h1 className="text-3xl font-black">Roadmap</h1>
        <p className="mt-2 text-ink/65">Predefined tracks and their tasks.</p>
        {error && <p className="mt-4 rounded-md border border-ink/10 bg-paper p-3 text-ink">{error}</p>}
        {!tracks && !error && (
          <div className="mt-6 grid gap-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-md border border-ink/10 bg-paper/70" />
            ))}
          </div>
        )}
        {tracks?.map((t) => (
          <section key={t.id} className="mt-6">
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="text-ink/65">{t.description}</p>
            <ul className="mt-3 grid gap-2">
              {t.tasks.map((task) => (
                <li key={task.id} className="rounded-md border border-ink/10 bg-paper p-3">
                  <div className="font-semibold">{task.title} <span className="text-ink/65">(XP {task.xpReward})</span></div>
                  <div className="text-sm text-ink/60">{task.description}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Panel>
    </RequireAuth>
  );
}
