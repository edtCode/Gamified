"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Panel } from "@/components/Panel";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";

type Room = { id: string; name: string; creatorId: string | null; members: number; joined?: boolean };

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api<{ rooms: Room[] }>("/rooms");
      setRooms(res.rooms);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    socket?.on("room:created", () => load());
    socket?.on("room:member:joined", () => load());
    socket?.on("room:member:left", () => load());
    return () => {
      socket?.off("room:created");
      socket?.off("room:member:joined");
      socket?.off("room:member:left");
    };
  }, []);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const res = await api<{ id: string; name: string }>("/rooms", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      setName("");
      // The creator is auto-joined server-side, so reflect that locally.
      setRooms((r) => {
        const created: Room = { id: res.id, name: res.name, creatorId: null, members: 1, joined: true };
        return r ? [created, ...r] : [created];
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function joinRoom(id: string) {
    setError(null);
    setBusyId(id);
    try {
      const res = await api<{ members: number; joined: boolean }>(`/rooms/${id}/join`, { method: "POST" });
      // Optimistically update this row; the socket refresh will reconcile.
      setRooms((r) => r?.map((room) => (room.id === id ? { ...room, joined: true, members: res.members } : room)) ?? r);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function leaveRoom(id: string) {
    setError(null);
    setBusyId(id);
    try {
      const res = await api<{ members: number; joined: boolean }>(`/rooms/${id}/leave`, { method: "POST" });
      setRooms((r) => r?.map((room) => (room.id === id ? { ...room, joined: false, members: res.members } : room)) ?? r);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireAuth>
      <Panel>
        <h1 className="text-3xl font-black">Study rooms</h1>
        <p className="mt-2 text-ink/65">Create or join group study rooms for live sessions.</p>
        {error && <p className="mt-4 text-coral">{error}</p>}
        <form onSubmit={createRoom} className="mt-4 flex gap-2">
          <input className="rounded-md border px-3" placeholder="Room name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="rounded-md bg-sky px-3 py-2 text-white">Create</button>
        </form>
        <div className="mt-6">
          {!rooms && <p className="text-ink/65">Loading rooms...</p>}
          {rooms?.length === 0 && <p className="text-ink/65">No active rooms</p>}
          <ul className="mt-4 space-y-3">
            {rooms?.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-semibold">
                    {r.name}
                    {r.joined && (
                      <span className="ml-2 rounded-full bg-moss/15 px-2 py-0.5 text-xs font-semibold text-moss align-middle">Joined</span>
                    )}
                  </div>
                  <div className="text-sm text-ink/65">Members: {r.members}</div>
                </div>
                <div>
                  {r.joined ? (
                    <button
                      onClick={() => leaveRoom(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-md border border-ink/20 px-3 py-2 text-ink/80 disabled:opacity-50"
                    >
                      {busyId === r.id ? "..." : "Leave"}
                    </button>
                  ) : (
                    <button
                      onClick={() => joinRoom(r.id)}
                      disabled={busyId === r.id}
                      className="rounded-md bg-moss px-3 py-2 text-white disabled:opacity-50"
                    >
                      {busyId === r.id ? "Joining..." : "Join"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </RequireAuth>
  );
}
