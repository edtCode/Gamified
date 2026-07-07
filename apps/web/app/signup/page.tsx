"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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
    <main className="grid min-h-screen place-items-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-black text-slate-900">Create your profile</h1>
        <p className="mt-2 text-sm text-slate-600 font-medium">Join the learning revolution 🚀</p>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Full name</label>
            <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">College email</label>
            <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" placeholder="you@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Batch year</label>
            <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" placeholder="2027" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" type="password" placeholder="8+ characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 font-medium break-words">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 font-medium">{error}</p>}
        <Button className="mt-6 w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</Button>
        <p className="mt-5 text-center text-sm text-slate-600">
          Already verified? <Link className="font-bold text-indigo-600 hover:text-indigo-700" href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
