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
        {error && <p className="mt-4 text-coral">{error}</p>}
        {!tracks && !error && <p className="mt-4 text-ink/65">Loading...</p>}
        {tracks?.map((t) => (
          <section key={t.id} className="mt-6">
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="text-ink/65">{t.description}</p>
            <ul className="mt-2 ml-4 list-disc">
              {t.tasks.map((task) => (
                <li key={task.id} className="mt-1">
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
