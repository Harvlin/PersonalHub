import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";

type AuthUser = { username: string | null; authenticated: boolean };
type AuthContextValue = AuthUser & { loading: boolean; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

function readCookie(name: string) {
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1] ?? "";
}

async function request(path: string, options: RequestInit = {}) {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = readCookie("XSRF-TOKEN");
    if (token) headers.set("X-XSRF-TOKEN", decodeURIComponent(token));
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }
  return response;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>({ username: null, authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        await request("/api/auth/csrf");
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
      await request("/api/auth/csrf");
      const response = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
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
