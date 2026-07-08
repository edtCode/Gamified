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

  if (loading && !user) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border border-ink/10 border-t-ink/55" />
      </div>
    );
  }

  if (!user) {
    return <div className="grid min-h-screen place-items-center text-sm font-semibold text-ink/65">Redirecting to login...</div>;
  }

  return <Shell>{children}</Shell>;
}
