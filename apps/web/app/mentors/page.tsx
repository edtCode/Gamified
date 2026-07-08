"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Send, UserRoundCheck } from "lucide-react";
import { useAuth } from "../providers";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Mentor, Message } from "@/lib/types";

export default function MentorsPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const active = useMemo(() => mentors.find((m) => m.id === activeId), [activeId, mentors]);

  useEffect(() => {
    api<{ mentors: Mentor[] }>("/mentors").then((r) => {
      setMentors(r.mentors);
      setActiveId(r.mentors[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api<{ messages: Message[] }>(`/messages/${activeId}`).then((r) => setMessages(r.messages));
  }, [activeId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (message: Message) => {
      setMessages((items) => {
        const belongsHere =
          message.fromUserId === activeId ||
          message.toUserId === activeId ||
          message.fromUserId === user?.id ||
          message.toUserId === user?.id;
        if (!belongsHere || items.some((item) => item.id === message.id)) return items;
        return [...items, message];
      });
    };
    socket.on("message:new", handler);
    return () => {
      socket.off("message:new", handler);
    };
  }, [activeId, user?.id]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!activeId || !body.trim()) return;
    setError("");
    try {
      const result = await api<{ message: Message }>("/messages", {
        method: "POST",
        body: JSON.stringify({ toUserId: activeId, body: body.trim() }),
      });
      setMessages((items) => [...items, result.message]);
      setBody("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <RequireAuth>
      <div className="mb-6">
        <h1 className="text-3xl font-black">Mentors</h1>
        <p className="mt-1 text-ink/65">Message seniors at least two levels above you.</p>
      </div>
      <div className="grid min-h-[640px] gap-5 lg:grid-cols-[320px_1fr]">
        <Panel className="h-fit">
          <div className="grid gap-2">
            {mentors.length === 0 && <p className="text-sm text-ink/65">No eligible mentors yet. Level up and check again.</p>}
            {mentors.map((mentor) => (
              <button
                key={mentor.id}
                className={`rounded-md border p-3 text-left transition ${activeId === mentor.id ? "border-ink bg-ink text-[#fbfaf7]" : "border-ink/10 bg-paper hover:border-ink/30 hover:bg-[#fbfaf7]"}`}
                onClick={() => setActiveId(mentor.id)}
              >
                <div className="flex items-center gap-2 font-black">
                  <UserRoundCheck className="h-4 w-4" />
                  {mentor.name}
                </div>
                <div className="mt-1 text-xs opacity-70">Level {mentor.level} · {mentor.xp} XP · batch {mentor.batch}</div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="flex min-h-[560px] flex-col p-0">
          <div className="border-b border-ink/10 p-4">
            <h2 className="text-xl font-black">{active ? active.name : "Select a mentor"}</h2>
            <p className="text-sm text-ink/60">{active ? `Level ${active.level} mentor` : "Start with a senior from the list."}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <p className="text-sm text-ink/60">No messages in this thread yet.</p>}
            {messages.map((message) => {
              const mine = message.fromUserId === user?.id;
              return (
                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-md px-3 py-2 text-sm ${mine ? "bg-ink text-[#fbfaf7]" : "bg-paper text-ink"}`}>
                    <p>{message.body}</p>
                    <p className={`mt-1 text-[11px] ${mine ? "text-[#fbfaf7]/55" : "text-ink/45"}`}>{new Date(message.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="border-t border-ink/10 p-4">
            {error && <p className="mb-3 rounded-md border border-ink/10 bg-paper p-2 text-sm text-ink">{error}</p>}
            <div className="flex gap-2">
              <input
                className="minimal-input min-w-0 flex-1"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ask for help, feedback, or a mock interview..."
                disabled={!activeId}
              />
              <Button disabled={!activeId || !body.trim()}><Send className="h-4 w-4" />Send</Button>
            </div>
          </form>
        </Panel>
      </div>
    </RequireAuth>
  );
}
