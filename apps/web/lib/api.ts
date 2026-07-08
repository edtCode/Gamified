const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000");
const GET_CACHE_TTL_MS = 30_000;
const getCache = new Map<string, { expires: number; promise: Promise<unknown> }>();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("gamified_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  getCache.clear();
  if (token) window.localStorage.setItem("gamified_token", token);
  else window.localStorage.removeItem("gamified_token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const cacheKey = method === "GET" ? `${getToken() ?? "guest"}:${path}` : "";
  if (cacheKey) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return cached.promise as Promise<T>;
  }

  const request = requestApi<T>(path, options, method);
  if (cacheKey) {
    getCache.set(cacheKey, { expires: Date.now() + GET_CACHE_TTL_MS, promise: request });
    request.catch(() => getCache.delete(cacheKey));
  }

  if (!cacheKey) {
    getCache.clear();
  }

  return request;
}

async function requestApi<T>(path: string, options: RequestInit, method: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (err) {
      const snippet = text.length > 200 ? text.slice(0, 200) + "..." : text;
      // If the response isn't JSON, surface a clearer error for debugging.
      throw new ApiError(response.status, `Non-JSON response: ${snippet}`);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.error ?? data.message ?? "Request failed");
  }

  return data as T;
}
