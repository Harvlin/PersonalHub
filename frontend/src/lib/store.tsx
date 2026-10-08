import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureCsrfToken, useAuth } from "@/lib/auth";

export type Status = "todo" | "in_progress" | "waiting" | "blocked" | "done" | "passive";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  blocked_reason?: string | undefined;
  project_id: string;
  milestone_id: string;
  due: string | null; // ISO date
  created: string;
  completed: string | null;
  contact_id?: string | undefined;
};

export type Milestone = {
  id: string;
  project_id: string;
  name: string;
  status: Status;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: Status;
  is_archived: boolean;
  created: string;
  updated: string;
};

export type Resource = {
  id: string;
  project_id: string;
  label: string;
  url: string;
  added: string;
};

export type Attachment = {
  id: string;
  project_id: string;
  label: string;
  url: string;
  uploaded: string;
};

export type Interaction = {
  id: string;
  contact_id: string;
  date: string;
  note: string;
};

export type Contact = {
  id: string;
  name: string;
  origin_context: string;
  tags: string[];
  ping_interval_days: number;
  last_contact: string;
  notes?: string | undefined;
};

const STATUSES: Status[] = ["todo", "in_progress", "waiting", "blocked", "done", "passive"];
const asText = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const asStatus = (value: unknown): Status => {
  if (typeof value === "string") {
    const lower = value.toLowerCase() as Status;
    if (STATUSES.includes(lower)) return lower;
  }
  return "todo";
};
const asDate = (value: unknown, fallback = TODAY) => typeof value === "string" && value.length > 0 ? value : fallback;

const today = new Date();
export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};
export const daysAhead = (n: number) => daysAgo(-n);

export const TODAY = iso(today);

export function daysBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000,
  );
}

export function ageInDays(dateStr: string) {
  if (!dateStr) return 0;
  return Math.max(0, daysBetween(dateStr, TODAY));
}

export function initials(name: string) {
  return asText(name, "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

type State = {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  contacts: Contact[];
  interactions: Interaction[];
  resources: Resource[];
  attachments: Attachment[];
  settings: {
    default_ping_interval: number;
    active_project_limit: number;
  };
};

type Store = State & {
  addProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  addMilestone: (projectId: string, name: string) => Promise<Milestone>;
  addTask: (input: {
    title: string;
    description?: string;
    project_id: string;
    milestone_id: string;
    due: string | null;
    contact_id?: string;
  }) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addContact: (input: {
    name: string;
    origin_context: string;
    tags: string[];
    ping_interval_days?: number;
  }) => Promise<Contact>;
  updateContact: (id: string, patch: Partial<Contact>) => Promise<void>;
  logInteraction: (contactId: string, note: string, date: string) => Promise<void>;
  addResource: (projectId: string, label: string, url: string) => Promise<void>;
  addAttachment: (projectId: string, label: string, url: string) => Promise<void>;
  updateSettings: (patch: Partial<State["settings"]>) => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

const API_URL = import.meta.env["VITE_API_URL"] ?? "";
const wireStatus = (status: Status | undefined) => status ? status.toUpperCase() : undefined;
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-XSRF-TOKEN", await ensureCsrfToken());
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `API request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

type ApiWorkspace = {
  projects: Array<{ id: string; name: string; description?: string; status: Status; archived: boolean; createdAt: string; updatedAt: string }>;
  milestones: Array<{ id: string; projectId: string; name: string; status: Status }>;
  tasks: Array<{ id: string; title: string; description?: string; status: Status; blockedReason?: string; projectId: string; milestoneId: string; due: string | null; createdAt: string; completedAt: string | null; contactId?: string }>;
  contacts: Array<{ id: string; name: string; originContext?: string; tags: string[]; pingIntervalDays: number; lastContact?: string; notes?: string }>;
  interactions: Array<{ id: string; contactId: string; date: string; note: string }>;
  resources: Array<{ id: string; projectId: string; label: string; url: string; addedAt: string }>;
  attachments: Array<{ id: string; projectId: string; label: string; url: string; uploadedAt: string }>;
  settings: { defaultPingInterval: number; activeProjectLimit: number };
};

const mapWorkspace = (data: ApiWorkspace): State => ({
  projects: (data.projects ?? []).filter(Boolean).map((p) => ({ id: asText(p.id, uid("project")), name: asText(p.name, "Untitled project"), description: asText(p.description), status: asStatus(p.status), is_archived: Boolean(p.archived), created: asDate(p.createdAt), updated: asDate(p.updatedAt) })),
  milestones: (data.milestones ?? []).filter(Boolean).map((m) => ({ id: asText(m.id, uid("milestone")), project_id: asText(m.projectId), name: asText(m.name, "Untitled milestone"), status: asStatus(m.status) })),
  tasks: (data.tasks ?? []).filter(Boolean).map((t) => ({ id: asText(t.id, uid("task")), title: asText(t.title, "Untitled task"), description: asText(t.description), status: asStatus(t.status), blocked_reason: asText(t.blockedReason) || undefined, project_id: asText(t.projectId), milestone_id: asText(t.milestoneId), due: typeof t.due === "string" ? t.due.slice(0, 10) : null, created: asDate(typeof t.createdAt === "string" ? t.createdAt.slice(0, 10) : t.createdAt), completed: typeof t.completedAt === "string" ? t.completedAt.slice(0, 10) : null, contact_id: asText(t.contactId) || undefined })),
  contacts: (data.contacts ?? []).filter(Boolean).map((c) => ({ id: asText(c.id, uid("contact")), name: asText(c.name, "Unnamed contact"), origin_context: asText(c.originContext), tags: Array.isArray(c.tags) ? c.tags.filter((tag): tag is string => typeof tag === "string") : [], ping_interval_days: Number.isFinite(c.pingIntervalDays) ? c.pingIntervalDays : 21, last_contact: asDate(c.lastContact), notes: asText(c.notes) || undefined })),
  interactions: (data.interactions ?? []).filter(Boolean).map((i) => ({ id: asText(i.id, uid("interaction")), contact_id: asText(i.contactId), date: asDate(i.date), note: asText(i.note) })),
  resources: (data.resources ?? []).filter(Boolean).map((r) => ({ id: asText(r.id, uid("resource")), project_id: asText(r.projectId), label: asText(r.label, "Untitled resource"), url: asText(r.url), added: asDate(r.addedAt) })),
  attachments: (data.attachments ?? []).filter(Boolean).map((a) => ({ id: asText(a.id, uid("attachment")), project_id: asText(a.projectId), label: asText(a.label, "Unnamed attachment"), url: asText(a.url), uploaded: asDate(a.uploadedAt) })),
  settings: {
    default_ping_interval: Number.isFinite(data.settings?.defaultPingInterval) ? data.settings.defaultPingInterval : 21,
    active_project_limit: Number.isFinite(data.settings?.activeProjectLimit) ? data.settings.activeProjectLimit : 5,
  }
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const [state, setState] = useState<State>({ projects: [], milestones: [], tasks: [], contacts: [], interactions: [], resources: [], attachments: [], settings: { default_ping_interval: 21, active_project_limit: 5 } });

  const reload = useCallback(async () => setState(mapWorkspace(await apiRequest<ApiWorkspace>("/api/workspace"))), []);
  useEffect(() => { if (authenticated) void reload().catch(() => undefined); }, [authenticated, reload]);

  const addProject: Store["addProject"] = useCallback(async (name, description = "") => {
    const response = await apiRequest<ApiWorkspace["projects"][number]>("/api/projects", { method: "POST", body: JSON.stringify({ name, description }) });
    const project: Project = { id: response.id, name: response.name, description: response.description ?? "", status: response.status, is_archived: response.archived, created: response.createdAt, updated: response.updatedAt };
    setState((s) => ({ ...s, projects: [project, ...s.projects] })); return project;
  }, []);
  const updateProject: Store["updateProject"] = useCallback(async (id, patch) => { await apiRequest(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name: patch.name, description: patch.description, status: patch.status, archived: patch.is_archived }) }); await reload(); }, [reload]);
  const addMilestone: Store["addMilestone"] = useCallback(async (projectId, name) => { const response = await apiRequest<ApiWorkspace["milestones"][number]>(`/api/projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify({ name }) }); const milestone = { id: response.id, project_id: response.projectId, name: response.name, status: response.status }; setState((s) => ({ ...s, milestones: [...s.milestones, milestone] })); return milestone; }, []);
  const addTask: Store["addTask"] = useCallback(async (input) => { const response = await apiRequest<ApiWorkspace["tasks"][number]>("/api/tasks", { method: "POST", body: JSON.stringify({ title: input.title, description: input.description, projectId: input.project_id, milestoneId: input.milestone_id, due: input.due, contactId: input.contact_id }) }); const task = { id: response.id, title: response.title, description: response.description ?? "", status: response.status, blocked_reason: response.blockedReason, project_id: response.projectId, milestone_id: response.milestoneId, due: response.due, created: response.createdAt, completed: response.completedAt ?? null, contact_id: response.contactId }; setState((s) => ({ ...s, tasks: [task, ...s.tasks] })); return task; }, []);
  const updateTask: Store["updateTask"] = useCallback(async (id, patch) => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    try {
      await apiRequest(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ title: patch.title, description: patch.description, status: wireStatus(patch.status), blockedReason: patch.blocked_reason, projectId: patch.project_id, milestoneId: patch.milestone_id, due: patch.due, contactId: patch.contact_id }) });
      // Reconcile server state on success (backend may compute derived fields like completedAt)
      await reload();
    } catch (err) {
      await reload();
      throw err;
    }
  }, [reload]);
  const deleteTask: Store["deleteTask"] = useCallback(async (id) => { await apiRequest(`/api/tasks/${id}`, { method: "DELETE" }); setState((s) => ({ ...s, tasks: s.tasks.filter((task) => task.id !== id) })); }, []);
  const addContact: Store["addContact"] = useCallback(async (input) => { const response = await apiRequest<ApiWorkspace["contacts"][number]>("/api/contacts", { method: "POST", body: JSON.stringify({ name: input.name, originContext: input.origin_context, tags: input.tags, pingIntervalDays: input.ping_interval_days }) }); const contact = { id: response.id, name: response.name, origin_context: response.originContext ?? "", tags: response.tags, ping_interval_days: response.pingIntervalDays, last_contact: response.lastContact ?? TODAY }; setState((s) => ({ ...s, contacts: [contact, ...s.contacts] })); return contact; }, []);
  const updateContact: Store["updateContact"] = useCallback(async (id, patch) => { await apiRequest(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify({ name: patch.name, originContext: patch.origin_context, tags: patch.tags, pingIntervalDays: patch.ping_interval_days, lastContact: patch.last_contact, notes: patch.notes }) }); await reload(); }, [reload]);
  const logInteraction: Store["logInteraction"] = useCallback(async (contactId, note, date) => { await apiRequest(`/api/contacts/${contactId}/interactions`, { method: "POST", body: JSON.stringify({ note, date }) }); await reload(); }, [reload]);
  const addResource: Store["addResource"] = useCallback(async (projectId, label, url) => { await apiRequest(`/api/projects/${projectId}/resources`, { method: "POST", body: JSON.stringify({ label, url }) }); await reload(); }, [reload]);
  const addAttachment: Store["addAttachment"] = useCallback(async (projectId, label, url) => { await apiRequest(`/api/projects/${projectId}/attachments`, { method: "POST", body: JSON.stringify({ label, url }) }); await reload(); }, [reload]);
  const updateSettings: Store["updateSettings"] = useCallback(async (patch) => { 
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })); 
    await apiRequest("/api/settings", { method: "PATCH", body: JSON.stringify({ defaultPingInterval: patch.default_ping_interval, activeProjectLimit: patch.active_project_limit }) }); 
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      addProject,
      updateProject,
      addMilestone,
      addTask,
      updateTask,
      deleteTask,
      addContact,
      updateContact,
      logInteraction,
      addResource,
      addAttachment,
      updateSettings,
    }),
    [
      state,
      addProject,
      updateProject,
      addMilestone,
      addTask,
      updateTask,
      deleteTask,
      addContact,
      updateContact,
      logInteraction,
      addResource,
      addAttachment,
      updateSettings,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------- derived helpers ---------- */

export function nextStatus(s: Status): Status {
  const order: Status[] = ["todo", "in_progress", "waiting", "blocked", "done"];
  return order[(order.indexOf(s) + 1) % order.length] as Status;
}

export function statusLabel(s: Status) {
  return {
    todo: "Todo",
    in_progress: "In Progress",
    waiting: "Waiting",
    blocked: "Blocked",
    done: "Done",
    passive: "Passive",
  }[s] ?? "Unknown";
}

export function pingInfo(contact: Contact) {
  const since = ageInDays(contact.last_contact);
  const interval = Number.isFinite(contact.ping_interval_days) ? Math.max(1, contact.ping_interval_days) : 21;
  const overdueBy = since - interval;
  const daysUntilNext = interval - since; // negative when overdue
  return {
    since,
    overdue: overdueBy > 0,
    overdueBy,
    // When overdue: show TODAY (already past due), otherwise show future date
    nextPing: daysUntilNext >= 0 ? daysAhead(daysUntilNext) : TODAY,
  };
}
