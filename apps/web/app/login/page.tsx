"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, GraduationCap, Play } from "lucide-react";
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
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <form data-animate onSubmit={onSubmit} className="soft-surface w-full max-w-md rounded-md border border-ink/10 p-8 shadow-panel backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-ink">
            <GraduationCap className="h-6 w-6 text-steelWhite" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink">LevelUp Campus</h1>
            <p className="text-sm text-ink/60 font-medium">Sign in to continue learning</p>
          </div>
        </div>
        <label className="text-sm font-semibold text-ink/70">College email</label>
        <input className="minimal-input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mt-5 block text-sm font-semibold text-ink/70">Password</label>
        <input className="minimal-input mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mt-4 rounded-md border border-ink/15 bg-paper p-3 text-sm text-ink font-medium">{error}</p>}
        <Button className="mt-6 h-12 w-full justify-between px-5" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="mt-3 h-12 w-full"
          disabled={busy}
          onClick={() => submitLogin("aarav@example.edu", "password123")}
        >
          <Play className="h-4 w-4" />
          Enter demo app
        </Button>
        <p className="mt-4 rounded-md bg-paper/80 p-4 text-xs text-ink/60 border border-ink/10 font-medium">
          Demo: <span className="font-semibold text-ink">aarav@example.edu</span> / <span className="font-semibold text-ink">password123</span>
        </p>
        <p className="mt-5 text-center text-sm text-ink/60">
          New here? <Link className="font-bold text-ink underline-offset-4 hover:underline" href="/signup" prefetch>Create an account</Link>
        </p>
      </form>
    </main>
  );
}
