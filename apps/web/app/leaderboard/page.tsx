"use client";

import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Panel } from "@/components/Panel";
import { api } from "@/lib/api";
import type { LeaderboardRow } from "@/lib/types";

export default function LeaderboardPage() {
  const [batch, setBatch] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    api<{ batch: string; leaderboard: LeaderboardRow[] }>("/leaderboard").then((r) => {
      setBatch(r.batch);
      setRows(r.leaderboard);
    });
  }, []);

  return (
    <RequireAuth>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Batch leaderboard</h1>
        <p className="mt-1 text-ink/65">Ranking for batch {batch || "..."}.</p>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/10 text-sm text-ink/55">
                <th className="py-3">Rank</th>
                <th>Student</th>
                <th>Level</th>
                <th>XP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId} className={`border-b border-ink/5 ${row.isCurrentUser ? "bg-amber/15" : ""}`}>
                  <td className="py-4 font-black">
                    <span className="inline-flex items-center gap-2">
                      {row.rank <= 3 && <Medal className="h-4 w-4 text-coral" />}
                      #{row.rank}
                    </span>
                  </td>
                  <td className="font-bold">{row.name}{row.isCurrentUser ? " · you" : ""}</td>
                  <td>Level {row.level}</td>
                  <td>{row.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </RequireAuth>
  );
}
