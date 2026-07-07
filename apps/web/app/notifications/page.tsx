"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { api } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const data = await api<{ notifications: NotificationItem[]; unread: number }>("/notifications");
    setItems(data.notifications);
    setUnread(data.unread);
  }

  useEffect(() => {
    void load();
  }, []);

  async function readAll() {
    await api("/notifications/read-all", { method: "POST" });
    await load();
  }

  return (
    <RequireAuth>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black">Notifications</h1>
          <p className="mt-1 text-ink/65">{unread} unread updates.</p>
        </div>
        <Button variant="secondary" onClick={readAll}><CheckCheck className="h-4 w-4" />Mark all read</Button>
      </div>
      <div className="grid gap-3">
        {items.length === 0 && <Panel><p className="text-ink/65">No notifications yet.</p></Panel>}
        {items.map((item) => (
          <Panel key={item.id} className={item.read ? "opacity-70" : "border-moss/30"}>
            <div className="flex gap-3">
              <Bell className="mt-1 h-5 w-5 text-coral" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-sky">{item.type}</div>
                <div className="mt-1 font-semibold">{item.body}</div>
                <div className="mt-2 text-xs text-ink/50">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </RequireAuth>
  );
}
