"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import { resetSocket } from "@/lib/socket";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; batch: string }) => Promise<string | null>;
  verify: (token: string) => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>("/auth/me");
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setToken(null);
      setUser(null);
      setLoading(false);
    });
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const data = await api<{ token: string; user: User }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(data.token);
        setUser(data.user);
        router.push("/");
      },
      async signup(payload) {
        const data = await api<{ devVerifyUrl?: string; token?: string; user?: User }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        // Auto-verify environments return a token + user directly — log in and go home.
        if (data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          router.push("/");
          return null;
        }
        return data.devVerifyUrl ?? null;
      },
      async verify(token) {
        const data = await api<{ token: string; user: User }>(`/auth/verify?token=${encodeURIComponent(token)}`);
        setToken(data.token);
        setUser(data.user);
        router.push("/");
      },
      refresh,
      updateUser(nextUser) {
        setUser(nextUser);
      },
      logout() {
        setToken(null);
        resetSocket();
        setUser(null);
        router.push("/login");
      },
    }),
    [loading, refresh, router, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within Providers");
  return context;
}
