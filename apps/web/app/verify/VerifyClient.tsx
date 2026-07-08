"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { useAuth } from "../providers";

export function VerifyClient() {
  const params = useSearchParams();
  const { verify } = useAuth();
  const [token, setTokenValue] = useState(params.get("token") ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(value: string) {
    setBusy(true);
    setError("");
    try {
      await verify(value);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  useEffect(() => {
    const value = params.get("token");
    if (value) void run(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void run(token);
  }

  return (
    <form data-animate onSubmit={onSubmit} className="soft-surface w-full max-w-md rounded-md border border-ink/10 p-6 shadow-panel">
      <h1 className="text-2xl font-black">Verify college email</h1>
      <p className="mt-1 text-sm text-ink/65">Paste the token from the API console if it was not included in the URL.</p>
      <input className="minimal-input mt-6" value={token} onChange={(e) => setTokenValue(e.target.value)} />
      {error && <p className="mt-4 rounded-md border border-ink/10 bg-paper p-3 text-sm text-ink">{error}</p>}
      <Button className="mt-5 w-full" disabled={busy || !token}>{busy ? "Verifying..." : "Verify and enter"}</Button>
    </form>
  );
}
