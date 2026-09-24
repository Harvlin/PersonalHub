import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const API_URL = import.meta.env["VITE_API_URL"] ?? "";

type AuthUser = { username: string | null; authenticated: boolean };
type AuthContextValue = AuthUser & { loading: boolean; login: (username: string, password: string) => Promise<void>; register: (username: string, password: string) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
let csrfToken = "";

async function request(path: string, options: RequestInit = {}) {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (csrfToken) headers.set("X-XSRF-TOKEN", csrfToken);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }
  return response;
}

export async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await request("/api/auth/csrf");
  const body = await response.json() as { token: string };
  csrfToken = body.token;
  return csrfToken;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>({ username: null, authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        await ensureCsrfToken();
        const response = await request("/api/auth/me");
        setUser(await response.json() as AuthUser);
      } catch {
        setUser({ username: null, authenticated: false });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...user,
    loading,
    login: async (username, password) => {
      await ensureCsrfToken();
      const response = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      setUser(await response.json() as AuthUser);
    },
    register: async (username, password) => {
      await ensureCsrfToken();
      const response = await request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) });
      setUser(await response.json() as AuthUser);
    },
    logout: async () => {
      await request("/api/auth/logout", { method: "POST" });
      setUser({ username: null, authenticated: false });
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
