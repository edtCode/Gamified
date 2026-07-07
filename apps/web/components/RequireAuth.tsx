"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Shell } from "./Shell";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm font-semibold text-ink/65">Loading...</div>;
  }

  if (!user) {
    return <div className="grid min-h-screen place-items-center text-sm font-semibold text-ink/65">Redirecting to login...</div>;
  }

  return <Shell>{children}</Shell>;
}
