"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { GraduationCap, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("aarav@example.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await submitLogin(email, password);
  }

  async function submitLogin(loginEmail: string, loginPassword: string) {
    setBusy(true);
    setError("");
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-indigo-100 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">LevelUp Campus</h1>
            <p className="text-sm text-slate-600 font-medium">Sign in to continue learning</p>
          </div>
        </div>
        <label className="text-sm font-semibold text-slate-700">College email</label>
        <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-5 block text-sm font-semibold text-slate-700">Password</label>
        <input className="mt-2 h-11 w-full rounded-lg border border-indigo-200 px-4 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 font-medium">{error}</p>}
        <Button className="mt-6 w-full" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</Button>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full"
          disabled={busy}
          onClick={() => submitLogin("aarav@example.edu", "password123")}
        >
          <Play className="h-4 w-4" />
          Enter demo app
        </Button>
        <p className="mt-4 rounded-lg bg-indigo-50 p-4 text-xs text-slate-600 border border-indigo-100 font-medium">
          🎯 Demo: <span className="font-semibold text-slate-900">aarav@example.edu</span> / <span className="font-semibold text-slate-900">password123</span>
        </p>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here? <Link className="font-bold text-indigo-600 hover:text-indigo-700" href="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
