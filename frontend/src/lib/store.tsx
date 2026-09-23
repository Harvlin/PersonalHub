import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";

export type Status = "todo" | "in_progress" | "waiting" | "blocked" | "done";

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
  name: string;
  size: string;
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
};

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
  return Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000,
  );
}

export function ageInDays(dateStr: string) {
  return Math.max(0, daysBetween(dateStr, TODAY));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

let counter = 100;
const uid = (p: string) => `${p}_${++counter}`;

const seedProjects: Project[] = [
  {
    id: "kortex",
    name: "Kortex",
    description:
      "Personal knowledge graph with **bi-directional links**.\n\nPhase two focuses on the sync engine and offline-first storage.",
    status: "in_progress",
    is_archived: false,
    created: daysAgo(96),
    updated: daysAgo(1),
  },
  {
    id: "atlas",
    name: "Atlas Field Notes",
    description:
      "Mobile capture app for field research.\n\nCurrently blocked on the *API key rotation* from the partner team.",
    status: "blocked",
    is_archived: false,
    created: daysAgo(58),
    updated: daysAgo(3),
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Plain-text accounting front-end. Nearly shipped.",
    status: "in_progress",
    is_archived: false,
    created: daysAgo(140),
    updated: daysAgo(6),
  },
  {
    id: "quill",
    name: "Quill",
    description: "Static site generator experiment. Shelved for now.",
    status: "waiting",
    is_archived: true,
    created: daysAgo(310),
    updated: daysAgo(120),
  },
];

const seedMilestones: Milestone[] = [
  { id: "m_sync", project_id: "kortex", name: "Sync Engine", status: "in_progress" },
  { id: "m_editor", project_id: "kortex", name: "Editor Polish", status: "todo" },
  { id: "m_launch", project_id: "kortex", name: "Public Beta", status: "todo" },
  { id: "m_capture", project_id: "atlas", name: "Capture Flow", status: "blocked" },
  { id: "m_offline", project_id: "atlas", name: "Offline Cache", status: "in_progress" },
  { id: "m_import", project_id: "ledger", name: "CSV Import", status: "done" },
  { id: "m_report", project_id: "ledger", name: "Reporting", status: "in_progress" },
  { id: "m_seo", project_id: "quill", name: "Theme System", status: "waiting" },
];

const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Resolve merge conflicts in CRDT layer",
    description: "Three-way merge is dropping tombstones on reconnect.",
    status: "in_progress",
    project_id: "kortex",
    milestone_id: "m_sync",
    due: TODAY,
    created: daysAgo(5),
  },
  {
    id: "t2",
    title: "Write sync conflict test matrix",
    description: "Cover offline→online, two-device, and clock skew cases.",
    status: "todo",
    project_id: "kortex",
    milestone_id: "m_sync",
    due: TODAY,
    created: daysAgo(2),
  },
  {
    id: "t3",
    title: "Ship keyboard shortcut sheet",
    description: "Overlay listing all editor bindings.",
    status: "todo",
    project_id: "kortex",
    milestone_id: "m_editor",
    due: daysAhead(4),
    created: daysAgo(9),
  },
  {
    id: "t4",
    title: "Draft beta invite copy",
    description: "Short, plain, no marketing voice.",
    status: "waiting",
    project_id: "kortex",
    milestone_id: "m_launch",
    due: daysAhead(6),
    created: daysAgo(12),
  },
  {
    id: "t5",
    title: "Rotate partner API credentials",
    description: "Waiting on partner security review before we can proceed.",
    status: "blocked",
    blocked_reason: "Partner security review not scheduled yet",
    project_id: "atlas",
    milestone_id: "m_capture",
    due: TODAY,
    created: daysAgo(18),
  },
  {
    id: "t6",
    title: "Cache photo uploads in IndexedDB",
    description: "Queue uploads while offline and flush on reconnect.",
    status: "in_progress",
    project_id: "atlas",
    milestone_id: "m_offline",
    due: daysAhead(2),
    created: daysAgo(7),
  },
  {
    id: "t7",
    title: "Reconcile duplicate ledger entries",
    description: "Dedupe by hash of date+amount+payee.",
    status: "todo",
    project_id: "ledger",
    milestone_id: "m_report",
    due: TODAY,
    created: daysAgo(3),
  },
  {
    id: "t8",
    title: "Monthly summary view",
    description: "Stepped bar chart of spend per category.",
    status: "done",
    project_id: "ledger",
    milestone_id: "m_report",
    due: daysAgo(2),
    created: daysAgo(20),
  },
  {
    id: "t9",
    title: "CSV column mapper",
    description: "Map arbitrary bank exports onto the internal schema.",
    status: "done",
    project_id: "ledger",
    milestone_id: "m_import",
    due: daysAgo(11),
    created: daysAgo(40),
  },
];

const seedContacts: Contact[] = [
  {
    id: "c_ren",
    name: "Ren Alvarez",
    origin_context: "informatics class",
    tags: ["informatics-class", "collab"],
    ping_interval_days: 14,
    last_contact: daysAgo(21),
  },
  {
    id: "c_mira",
    name: "Mira Sund",
    origin_context: "freelance client, Ledger rollout",
    tags: ["client"],
    ping_interval_days: 7,
    last_contact: daysAgo(9),
  },
  {
    id: "c_tobi",
    name: "Tobi Nkemdi",
    origin_context: "open-source contributor on Kortex",
    tags: ["oss", "collab"],
    ping_interval_days: 30,
    last_contact: daysAgo(12),
  },
  {
    id: "c_hana",
    name: "Hana Iwase",
    origin_context: "conference hallway track",
    tags: ["network"],
    ping_interval_days: 60,
    last_contact: daysAgo(58),
  },
];

const seedInteractions: Interaction[] = [
  {
    id: "i1",
    contact_id: "c_mira",
    date: daysAgo(9),
    note: "Walked through the CSV import flow; she wants a category rules editor.",
  },
  {
    id: "i2",
    contact_id: "c_tobi",
    date: daysAgo(12),
    note: "He offered to take the IndexedDB caching PR if we scope it.",
  },
  {
    id: "i3",
    contact_id: "c_ren",
    date: daysAgo(21),
    note: "Discussed co-writing the sync engine paper for the seminar.",
  },
  {
    id: "i4",
    contact_id: "c_hana",
    date: daysAgo(58),
    note: "Swapped notes on offline-first architectures after her talk.",
  },
];

const seedResources: Resource[] = [
  {
    id: "r1",
    project_id: "kortex",
    label: "repo",
    url: "https://github.com/harvlin/kortex",
    added: daysAgo(90),
  },
  {
    id: "r2",
    project_id: "kortex",
    label: "design",
    url: "https://figma.com/file/kortex-editor",
    added: daysAgo(44),
  },
  {
    id: "r3",
    project_id: "atlas",
    label: "api docs",
    url: "https://docs.partner.dev/field-api",
    added: daysAgo(30),
  },
  {
    id: "r4",
    project_id: "ledger",
    label: "repo",
    url: "https://github.com/harvlin/ledger",
    added: daysAgo(130),
  },
];

const seedAttachments: Attachment[] = [
  {
    id: "a1",
    project_id: "kortex",
    name: "sync-protocol-v3.pdf",
    size: "412 KB",
    uploaded: daysAgo(14),
  },
  {
    id: "a2",
    project_id: "atlas",
    name: "field-notes-schema.json",
    size: "18 KB",
    uploaded: daysAgo(21),
  },
];

type State = {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  contacts: Contact[];
  interactions: Interaction[];
  resources: Resource[];
  attachments: Attachment[];
  defaultPingInterval: number;
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
  addAttachment: (projectId: string, name: string, size: string) => Promise<void>;
  setDefaultPingInterval: (n: number) => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";
const readCookie = (name: string) => document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1] ?? "";

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = readCookie("XSRF-TOKEN");
    if (csrf) headers.set("X-XSRF-TOKEN", decodeURIComponent(csrf));
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

type ApiWorkspace = {
  projects: Array<{ id: string; name: string; description?: string; status: Status; archived: boolean; createdAt: string; updatedAt: string }>;
  milestones: Array<{ id: string; projectId: string; name: string; status: Status }>;
  tasks: Array<{ id: string; title: string; description?: string; status: Status; blockedReason?: string; projectId: string; milestoneId: string; due: string | null; createdAt: string; contactId?: string }>;
  contacts: Array<{ id: string; name: string; originContext?: string; tags: string[]; pingIntervalDays: number; lastContact?: string }>;
  interactions: Array<{ id: string; contactId: string; date: string; note: string }>;
  resources: Array<{ id: string; projectId: string; label: string; url: string; addedAt: string }>;
  attachments: Array<{ id: string; projectId: string; name: string; size: string; uploadedAt: string }>;
  settings: { defaultPingInterval: number };
};

const mapWorkspace = (data: ApiWorkspace): State => ({
  projects: data.projects.map((p) => ({ id: p.id, name: p.name, description: p.description ?? "", status: p.status, is_archived: p.archived, created: p.createdAt, updated: p.updatedAt })),
  milestones: data.milestones.map((m) => ({ id: m.id, project_id: m.projectId, name: m.name, status: m.status })),
  tasks: data.tasks.map((t) => ({ id: t.id, title: t.title, description: t.description ?? "", status: t.status, blocked_reason: t.blockedReason, project_id: t.projectId, milestone_id: t.milestoneId, due: t.due, created: t.createdAt, contact_id: t.contactId })),
  contacts: data.contacts.map((c) => ({ id: c.id, name: c.name, origin_context: c.originContext ?? "", tags: c.tags, ping_interval_days: c.pingIntervalDays, last_contact: c.lastContact ?? TODAY })),
  interactions: data.interactions.map((i) => ({ id: i.id, contact_id: i.contactId, date: i.date, note: i.note })),
  resources: data.resources.map((r) => ({ id: r.id, project_id: r.projectId, label: r.label, url: r.url, added: r.addedAt })),
  attachments: data.attachments.map((a) => ({ id: a.id, project_id: a.projectId, name: a.name, size: a.size, uploaded: a.uploadedAt })),
  defaultPingInterval: data.settings.defaultPingInterval,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const { authenticated } = useAuth();
  const [state, setState] = useState<State>({ projects: [], milestones: [], tasks: [], contacts: [], interactions: [], resources: [], attachments: [], defaultPingInterval: 21 });

  const reload = useCallback(async () => setState(mapWorkspace(await apiRequest<ApiWorkspace>("/api/workspace"))), []);
  useEffect(() => { if (authenticated) void reload().catch(() => undefined); }, [authenticated, reload]);

  const addProject: Store["addProject"] = useCallback(async (name, description = "") => {
    const response = await apiRequest<ApiWorkspace["projects"][number]>("/api/projects", { method: "POST", body: JSON.stringify({ name, description }) });
    const project: Project = { id: response.id, name: response.name, description: response.description ?? "", status: response.status, is_archived: response.archived, created: response.createdAt, updated: response.updatedAt };
    setState((s) => ({ ...s, projects: [project, ...s.projects] })); return project;
  }, []);
  const updateProject: Store["updateProject"] = useCallback(async (id, patch) => { await apiRequest(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name: patch.name, description: patch.description, status: patch.status, archived: patch.is_archived }) }); await reload(); }, [reload]);
  const addMilestone: Store["addMilestone"] = useCallback(async (projectId, name) => { const response = await apiRequest<ApiWorkspace["milestones"][number]>(`/api/projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify({ name }) }); const milestone = { id: response.id, project_id: response.projectId, name: response.name, status: response.status }; setState((s) => ({ ...s, milestones: [...s.milestones, milestone] })); return milestone; }, []);
  const addTask: Store["addTask"] = useCallback(async (input) => { const response = await apiRequest<ApiWorkspace["tasks"][number]>("/api/tasks", { method: "POST", body: JSON.stringify({ title: input.title, description: input.description, projectId: input.project_id, milestoneId: input.milestone_id, due: input.due, contactId: input.contact_id }) }); const task = { id: response.id, title: response.title, description: response.description ?? "", status: response.status, blocked_reason: response.blockedReason, project_id: response.projectId, milestone_id: response.milestoneId, due: response.due, created: response.createdAt, contact_id: response.contactId }; setState((s) => ({ ...s, tasks: [task, ...s.tasks] })); return task; }, []);
  const updateTask: Store["updateTask"] = useCallback(async (id, patch) => { await apiRequest(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ title: patch.title, description: patch.description, status: patch.status, blockedReason: patch.blocked_reason, projectId: patch.project_id, milestoneId: patch.milestone_id, due: patch.due, contactId: patch.contact_id }) }); await reload(); }, [reload]);
  const deleteTask: Store["deleteTask"] = useCallback(async (id) => { await apiRequest(`/api/tasks/${id}`, { method: "DELETE" }); setState((s) => ({ ...s, tasks: s.tasks.filter((task) => task.id !== id) })); }, []);
  const addContact: Store["addContact"] = useCallback(async (input) => { const response = await apiRequest<ApiWorkspace["contacts"][number]>("/api/contacts", { method: "POST", body: JSON.stringify({ name: input.name, originContext: input.origin_context, tags: input.tags, pingIntervalDays: input.ping_interval_days }) }); const contact = { id: response.id, name: response.name, origin_context: response.originContext ?? "", tags: response.tags, ping_interval_days: response.pingIntervalDays, last_contact: response.lastContact ?? TODAY }; setState((s) => ({ ...s, contacts: [contact, ...s.contacts] })); return contact; }, []);
  const updateContact: Store["updateContact"] = useCallback(async (id, patch) => { await apiRequest(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify({ name: patch.name, originContext: patch.origin_context, tags: patch.tags, pingIntervalDays: patch.ping_interval_days, lastContact: patch.last_contact }) }); await reload(); }, [reload]);
  const logInteraction: Store["logInteraction"] = useCallback(async (contactId, note, date) => { await apiRequest(`/api/contacts/${contactId}/interactions`, { method: "POST", body: JSON.stringify({ note, date }) }); await reload(); }, [reload]);
  const addResource: Store["addResource"] = useCallback(async (projectId, label, url) => { await apiRequest(`/api/projects/${projectId}/resources`, { method: "POST", body: JSON.stringify({ label, url }) }); await reload(); }, [reload]);
  const addAttachment: Store["addAttachment"] = useCallback(async (projectId, name, size) => { await apiRequest(`/api/projects/${projectId}/attachments`, { method: "POST", body: JSON.stringify({ name, size }) }); await reload(); }, [reload]);
  const setDefaultPingInterval = useCallback(async (n: number) => { await apiRequest("/api/settings", { method: "PATCH", body: JSON.stringify({ defaultPingInterval: n }) }); setState((s) => ({ ...s, defaultPingInterval: n })); }, []);

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
      setDefaultPingInterval,
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
      setDefaultPingInterval,
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
  }[s];
}

export function pingInfo(contact: Contact) {
  const since = ageInDays(contact.last_contact);
  const overdueBy = since - contact.ping_interval_days;
  return {
    since,
    overdue: overdueBy > 0,
    overdueBy,
    nextPing: daysAhead(-since + contact.ping_interval_days),
  };
}
