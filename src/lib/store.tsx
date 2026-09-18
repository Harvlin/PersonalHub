import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  signedOut: boolean;
};

type Store = State & {
  addProject: (name: string, description?: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addMilestone: (projectId: string, name: string) => Milestone;
  addTask: (input: {
    title: string;
    description?: string;
    project_id: string;
    milestone_id: string;
    due: string | null;
    contact_id?: string;
  }) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addContact: (input: {
    name: string;
    origin_context: string;
    tags: string[];
    ping_interval_days?: number;
  }) => Contact;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  logInteraction: (contactId: string, note: string, date: string) => void;
  addResource: (projectId: string, label: string, url: string) => void;
  addAttachment: (projectId: string, name: string, size: string) => void;
  setDefaultPingInterval: (n: number) => void;
  setSignedOut: (v: boolean) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    projects: seedProjects,
    milestones: seedMilestones,
    tasks: seedTasks,
    contacts: seedContacts,
    interactions: seedInteractions,
    resources: seedResources,
    attachments: seedAttachments,
    defaultPingInterval: 21,
    signedOut: false,
  });

  const touchProject = (projects: Project[], id: string) =>
    projects.map((p) => (p.id === id ? { ...p, updated: TODAY } : p));

  const addProject: Store["addProject"] = useCallback((name, description = "") => {
    const project: Project = {
      id: uid("proj"),
      name,
      description,
      status: "todo",
      is_archived: false,
      created: TODAY,
      updated: TODAY,
    };
    setState((s) => ({ ...s, projects: [project, ...s.projects] }));
    return project;
  }, []);

  const updateProject: Store["updateProject"] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch, updated: TODAY } : p)),
    }));
  }, []);

  const addMilestone: Store["addMilestone"] = useCallback((projectId, name) => {
    const milestone: Milestone = {
      id: uid("ms"),
      project_id: projectId,
      name,
      status: "todo",
    };
    setState((s) => ({
      ...s,
      milestones: [...s.milestones, milestone],
      projects: touchProject(s.projects, projectId),
    }));
    return milestone;
  }, []);

  const addTask: Store["addTask"] = useCallback((input) => {
    const task: Task = {
      id: uid("task"),
      title: input.title,
      description: input.description ?? "",
      status: "todo",
      project_id: input.project_id,
      milestone_id: input.milestone_id,
      due: input.due,
      created: TODAY,
      contact_id: input.contact_id,
    };
    setState((s) => ({
      ...s,
      tasks: [task, ...s.tasks],
      projects: touchProject(s.projects, input.project_id),
    }));
    return task;
  }, []);

  const updateTask: Store["updateTask"] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask: Store["deleteTask"] = useCallback((id) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addContact: Store["addContact"] = useCallback((input) => {
    let created!: Contact;
    setState((s) => {
      created = {
        id: uid("contact"),
        name: input.name,
        origin_context: input.origin_context,
        tags: input.tags,
        ping_interval_days: input.ping_interval_days ?? s.defaultPingInterval,
        last_contact: TODAY,
      };
      return { ...s, contacts: [created, ...s.contacts] };
    });
    return created;
  }, []);

  const updateContact: Store["updateContact"] = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const logInteraction: Store["logInteraction"] = useCallback((contactId, note, date) => {
    setState((s) => ({
      ...s,
      interactions: [{ id: uid("int"), contact_id: contactId, date, note }, ...s.interactions],
      contacts: s.contacts.map((c) => (c.id === contactId ? { ...c, last_contact: date } : c)),
    }));
  }, []);

  const addResource: Store["addResource"] = useCallback((projectId, label, url) => {
    setState((s) => ({
      ...s,
      resources: [
        ...s.resources,
        { id: uid("res"), project_id: projectId, label, url, added: TODAY },
      ],
      projects: touchProject(s.projects, projectId),
    }));
  }, []);

  const addAttachment: Store["addAttachment"] = useCallback((projectId, name, size) => {
    setState((s) => ({
      ...s,
      attachments: [
        ...s.attachments,
        { id: uid("att"), project_id: projectId, name, size, uploaded: TODAY },
      ],
      projects: touchProject(s.projects, projectId),
    }));
  }, []);

  const setDefaultPingInterval = useCallback((n: number) => {
    setState((s) => ({ ...s, defaultPingInterval: n }));
  }, []);

  const setSignedOut = useCallback((v: boolean) => {
    setState((s) => ({ ...s, signedOut: v }));
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
      setDefaultPingInterval,
      setSignedOut,
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
      setSignedOut,
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
