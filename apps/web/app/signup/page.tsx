"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/Button";
import { useAuth } from "../providers";

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "you@example.edu", password: "", batch: "2027" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const url = await signup(form);
      setMessage(url ? `Account created. Dev verify link: ${url}` : "Account created. Check your email to verify.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form data-animate onSubmit={onSubmit} className="soft-surface w-full max-w-md rounded-md border border-ink/10 p-8 shadow-panel backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ink">
            <UserPlus className="h-6 w-6 text-steelWhite" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink">Create your profile</h1>
            <p className="mt-1 text-sm text-ink/60 font-medium">Join the learning workspace.</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-ink/70">Full name</label>
            <input className="minimal-input mt-2" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink/70">College email</label>
            <input className="minimal-input mt-2" placeholder="you@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink/70">Batch year</label>
            <input className="minimal-input mt-2" placeholder="2027" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink/70">Password</label>
            <input className="minimal-input mt-2" type="password" placeholder="8+ characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        {message && <p className="mt-4 rounded-md bg-paper p-3 text-sm text-ink border border-ink/10 font-medium break-words">{message}</p>}
        {error && <p className="mt-4 rounded-md bg-paper p-3 text-sm text-ink border border-ink/15 font-medium">{error}</p>}
        <Button className="mt-6 h-12 w-full justify-between px-5" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-5 text-center text-sm text-ink/60">
          Already verified? <Link className="font-bold text-ink underline-offset-4 hover:underline" href="/login" prefetch>Sign in</Link>
        </p>
      </form>
    </main>
  );
}
