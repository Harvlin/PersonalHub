import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, Menu, Search, X } from "lucide-react";
import { Button, Chip, Field, Input, Modal, Segmented } from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import { TODAY, initials, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

/* ---------------- UI context (quick add + palette) ---------------- */

export type QuickAddType = "task" | "project" | "contact";
export type QuickAddPrefill = {
  type?: QuickAddType;
  title?: string;
  contact_id?: string;
  project_id?: string;
  milestone_id?: string;
};

type UICtx = {
  openQuickAdd: (prefill?: QuickAddPrefill) => void;
  openPalette: () => void;
  toast: (msg: string) => void;
};

const UIContext = createContext<UICtx | null>(null);
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside AppShell");
  return ctx;
}

/* ---------------- Page header ---------------- */

export function PageHeader({
  crumbs,
  children,
}: {
  crumbs: { label: string; to?: string; params?: Record<string, string> }[];
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex min-h-[52px] shrink-0 flex-wrap items-center gap-3 border-b border-border bg-background pl-14 pr-3 md:px-5">
      <nav className="mono min-w-0 flex-1 items-center gap-1.5 truncate text-[12px] text-ink-muted md:flex">
        <span>Personal Hub</span>
        {crumbs.map((c, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1.5">
            <span>/</span>
            {c.to ? (
              <Link
                to={c.to}
                params={c.params as never}
                className="truncate underline decoration-border underline-offset-2 hover:text-ink"
              >
                {c.label}
              </Link>
            ) : (
              <span className="truncate text-ink">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">{children}</div>
    </header>
  );
}

/* ---------------- Sidebar ---------------- */

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/contacts", label: "Contacts" },
  { to: "/resources", label: "Resources" },
  { to: "/settings", label: "Settings" },
];

function Sidebar({ onSearch }: { onSearch: () => void }) {
  const { projects } = useStore();
  const { username, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [popover, setPopover] = useState(false);
  const active = projects.filter((p) => !p.is_archived);

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-paper md:flex">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="hairline flex h-6 w-6 items-center justify-center rounded-[3px] text-[10px] font-semibold">
          PH
        </span>
        <span className="text-[13px] font-semibold">Personal Hub</span>
        <ChevronsUpDown size={13} className="ml-auto text-ink-muted" />
      </div>

      <button
        onClick={onSearch}
        className="focus-ink mx-3 mt-3 flex items-center gap-2 rounded-[3px] border border-border px-2.5 py-1.5 text-left"
      >
        <Search size={13} className="text-ink-muted" />
        <span className="text-[12.5px] text-ink-muted">Search...</span>
        <span className="mono hairline ml-auto rounded-[3px] px-1 py-px text-[10px] text-ink-muted">⌘K</span>
      </button>

      <nav className="mt-4 flex flex-col">
        {NAV.map((item) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "border-l-[3px] px-4 py-1.5 text-[13px]",
                isActive
                  ? "border-ink font-semibold text-ink"
                  : "border-transparent text-ink-secondary hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-4">
        <div className="micro-label">Projects</div>
        <div className="mt-2 flex flex-col gap-1.5">
          {active.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to="/projects/$id"
              params={{ id: p.id }}
              className="flex items-center gap-2 text-[12.5px] text-ink-secondary hover:text-ink"
            >
              <StatusGlyph status={p.status} size={12} />
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
          {active.length === 0 ? (
            <span className="mono text-[11px] text-ink-muted">No active projects</span>
          ) : null}
        </div>
      </div>

      <div className="mt-auto p-3">
        <div className="hairline rounded-md p-3">
          <div className="micro-label">Active Projects</div>
          <div className="mono mt-1 text-[13px] font-medium">{active.length}/3</div>
          <div className="mt-2 h-1 w-full bg-accent">
            <div
              className="h-1 bg-ink"
              style={{ width: `${Math.min(100, (active.length / 3) * 100)}%` }}
            />
          </div>
        </div>

        <div className="relative mt-3">
          {popover ? (
            <div className="hairline absolute bottom-11 left-0 w-full rounded-md bg-paper p-1">
              <Link
                to="/settings"
                onClick={() => setPopover(false)}
                className="block rounded-[3px] px-2 py-1.5 text-[12.5px] text-ink-secondary hover:bg-accent hover:text-ink"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  void logout();
                  setPopover(false);
                }}
                className="block w-full rounded-[3px] px-2 py-1.5 text-left text-[12.5px] text-ink-secondary hover:bg-accent hover:text-ink"
              >
                Sign out
              </button>
            </div>
          ) : null}
          <button
            onClick={() => setPopover((v) => !v)}
            className="focus-ink flex w-full items-center gap-2 rounded-[3px] border border-border px-2 py-1.5"
          >
            <span className="hairline mono flex h-6 w-6 items-center justify-center rounded-[3px] text-[10px]">
              HM
            </span>
            <span className="text-[12.5px] font-medium">{username ?? "Personal"}</span>
            <span className="mono ml-auto text-[11px] text-ink-muted">private</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ onSearch, onClose }: { onSearch: () => void; onClose: () => void }) {
  const { username, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed inset-x-0 top-0 z-40 max-h-[100dvh] overflow-y-auto border-b border-border bg-paper md:hidden">
      <div className="flex h-12 items-center px-4">
        <span className="hairline flex h-6 w-6 items-center justify-center rounded-[3px] text-[10px] font-semibold">PH</span>
        <span className="ml-2 text-[13px] font-semibold">Personal Hub</span>
        <button onClick={onClose} aria-label="Close navigation" className="focus-ink ml-auto p-2 text-ink-muted hover:text-ink"><X size={18} /></button>
      </div>
      <nav className="border-b border-border bg-paper px-3 py-2">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={cn("block border-l-[3px] px-3 py-2.5 text-[13px]", pathname.startsWith(item.to) ? "border-ink font-semibold text-ink" : "border-transparent text-ink-secondary")}
          >
            {item.label}
          </Link>
        ))}
        <button onClick={() => { onClose(); onSearch(); }} className="focus-ink flex w-full items-center gap-2 border-t border-border px-3 py-3 text-left text-[13px] text-ink-secondary">
          <Search size={13} /> Search
        </button>
        <button onClick={() => void logout()} className="focus-ink w-full border-t border-border px-3 py-3 text-left text-[13px] text-ink-secondary">
          Sign out <span className="mono ml-1 text-[10px] text-ink-muted">({username ?? "Personal"})</span>
        </button>
      </nav>
    </div>
  );
}

/* ---------------- Quick Add modal ---------------- */

function QuickAdd({
  prefill,
  onClose,
  toast,
}: {
  prefill: QuickAddPrefill;
  onClose: () => void;
  toast: (m: string) => void;
}) {
  const store = useStore();
  const navigate = useNavigate();
  const [type, setType] = useState<QuickAddType>(prefill.type ?? "task");
  const [error, setError] = useState("");

  // task fields
  const [title, setTitle] = useState(prefill.title ?? "");
  const [projectId, setProjectId] = useState(
    prefill.project_id ?? store.projects.find((p) => !p.is_archived)?.id ?? "",
  );
  const milestones = store.milestones.filter((m) => m.project_id === projectId);
  const [milestoneId, setMilestoneId] = useState(prefill.milestone_id ?? milestones[0]?.id ?? "");
  const [due, setDue] = useState(TODAY);

  // project fields
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // contact fields
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [tags, setTags] = useState("");
  const [interval, setInterval] = useState(String(store.defaultPingInterval));

  const submit = async () => {
    if (type === "task") {
      if (!title.trim()) return setError("Task title is required");
      if (!projectId || !milestoneId) return setError("Pick a project and milestone");
      await store.addTask({
        title: title.trim(),
        project_id: projectId,
        milestone_id: milestoneId,
        due: due || null,
        ...(prefill.contact_id ? { contact_id: prefill.contact_id } : {}),
      });
      toast("Task created");
      onClose();
      return;
    }
    if (type === "project") {
      if (!projectName.trim()) return setError("Project name is required");
      const p = await store.addProject(projectName.trim(), projectDesc);
      onClose();
      navigate({ to: "/projects/$id", params: { id: p.id } });
      return;
    }
    if (!name.trim()) return setError("Contact name is required");
    const c = await store.addContact({
      name: name.trim(),
      origin_context: origin.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
      ping_interval_days: Number(interval) || store.defaultPingInterval,
    });
    onClose();
    navigate({ to: "/contacts/$id", params: { id: c.id } });
  };

  return (
    <Modal open onClose={onClose} title="Quick Add" grain>
      <Segmented
        value={type}
        onChange={(v) => {
          setType(v);
          setError("");
        }}
        options={[
          { value: "task", label: "Task" },
          { value: "project", label: "Project" },
          { value: "contact", label: "Contact" },
        ]}
      />

      <div className="mt-4 space-y-3">
        {type === "task" ? (
          <>
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project">
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    const first = store.milestones.find((m) => m.project_id === e.target.value);
                    setMilestoneId(first?.id ?? "");
                  }}
                  className="focus-ink hairline mono w-full rounded-[3px] bg-paper px-2.5 py-1.5 text-[12.5px]"
                >
                  {store.projects
                    .filter((p) => !p.is_archived)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Milestone">
                <select
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="focus-ink hairline mono w-full rounded-[3px] bg-paper px-2.5 py-1.5 text-[12.5px]"
                >
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Due date">
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
            {prefill.contact_id ? (
              <div className="mono text-[11px] text-ink-muted">
                linked to {store.contacts.find((c) => c.id === prefill.contact_id)?.name}
              </div>
            ) : null}
          </>
        ) : null}

        {type === "project" ? (
          <>
            <Field label="Name">
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" />
            </Field>
            <Field label="Description">
              <Input value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="One line" />
            </Field>
          </>
        ) : null}

        {type === "contact" ? (
          <>
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </Field>
            <Field label="Origin context">
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Met at..." />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tags (comma separated)">
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="client, oss" />
              </Field>
              <Field label="Ping interval (days)">
                <Input value={interval} onChange={(e) => setInterval(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
          </>
        ) : null}

        {error ? <p className="mono text-[11px] text-signal">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="solid" onClick={submit}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Command palette ---------------- */

function Palette({ onClose }: { onClose: () => void }) {
  const { projects, tasks, contacts } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const norm = q.trim().toLowerCase();
  const results = [
    ...projects
      .filter((p) => p.name.toLowerCase().includes(norm))
      .map((p) => ({ id: p.id, kind: "project", label: p.name, go: () => navigate({ to: "/projects/$id", params: { id: p.id } }) })),
    ...contacts
      .filter((c) => c.name.toLowerCase().includes(norm))
      .map((c) => ({ id: c.id, kind: "contact", label: c.name, go: () => navigate({ to: "/contacts/$id", params: { id: c.id } }) })),
    ...tasks
      .filter((t) => t.title.toLowerCase().includes(norm))
      .map((t) => ({ id: t.id, kind: "task", label: t.title, go: () => navigate({ to: "/projects/$id", params: { id: t.project_id } }) })),
  ].slice(0, 10);

  return (
    <Modal open onClose={onClose} title="Search" width="max-w-xl">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to project, task, or contact" autoFocus />
      <ul className="mt-3 divide-y divide-border border-t border-border">
        {results.map((r) => (
          <li key={r.kind + r.id}>
            <button
              onClick={() => {
                r.go();
                onClose();
              }}
              className="focus-ink flex w-full items-center gap-3 px-1 py-2 text-left hover:bg-accent"
            >
              <span className="micro-label w-16 shrink-0">{r.kind}</span>
              <span className="truncate text-[13px]">{r.label}</span>
            </button>
          </li>
        ))}
        {results.length === 0 ? (
          <li className="mono px-1 py-4 text-[12px] text-ink-muted">No matches</li>
        ) : null}
      </ul>
    </Modal>
  );
}

function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        className="hairline w-full max-w-sm rounded-md bg-paper p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          const action = mode === "login" ? login(username, password) : register(username, password);
          void action.catch((reason: unknown) => setError(reason instanceof Error ? reason.message : mode === "login" ? "Unable to sign in" : "Unable to create account")).finally(() => setPending(false));
        }}
      >
        <div className="micro-label">Personal Hub / Private Workspace</div>
        <h1 className="mt-3 text-xl font-semibold">{mode === "login" ? "Sign in" : "Create your account"}</h1>
        <p className="mono mt-2 text-[11px] text-ink-muted">Your session is protected by an encrypted server-side cookie.</p>
        <div className="mt-5 space-y-3">
          <Field label="Username"><Input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} /></Field>
        </div>
        {error ? <p className="mono mt-3 text-[11px] text-signal">{error}</p> : null}
        <Button className="mt-5 w-full" variant="solid" type="submit" disabled={pending}>{pending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}</Button>
        <button type="button" className="mono mt-4 w-full text-[11px] text-ink-muted underline underline-offset-4 hover:text-ink" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Shell ---------------- */

export function AppShell() {
  const [quickAdd, setQuickAdd] = useState<QuickAddPrefill | null>(null);
  const [palette, setPalette] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const openQuickAdd = useCallback((prefill?: QuickAddPrefill) => setQuickAdd(prefill ?? {}), []);
  const openPalette = useCallback(() => setPalette(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setQuickAdd({});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ openQuickAdd, openPalette, toast }), [openQuickAdd, openPalette, toast]);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLanding = pathname === "/";
  const auth = useAuth();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (!isLanding && auth.loading) return <div className="flex min-h-screen items-center justify-center bg-background"><span className="mono text-[11px] text-ink-muted">Checking session...</span></div>;
  if (!isLanding && !auth.authenticated) return <LoginScreen />;

  return (
    <UIContext.Provider value={value}>
      <div className={cn("flex min-h-screen w-full min-w-0 overflow-x-hidden", isLanding ? "bg-[#f4f4f2]" : "bg-background")}>
        {!isLanding ? <Sidebar onSearch={openPalette} /> : null}
        <main className="flex min-w-0 flex-1 flex-col">
          {!isLanding ? (
            <button onClick={() => setMobileNavOpen((open) => !open)} aria-label="Open navigation" className="focus-ink fixed left-3 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-[3px] border border-border bg-paper text-ink md:hidden">
              {mobileNavOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          ) : null}
          {!isLanding && mobileNavOpen ? <MobileNav onSearch={openPalette} onClose={() => setMobileNavOpen(false)} /> : null}
          <Outlet />
        </main>
      </div>
      {quickAdd ? <QuickAdd prefill={quickAdd} onClose={() => setQuickAdd(null)} toast={toast} /> : null}
      {palette ? <Palette onClose={() => setPalette(false)} /> : null}
      {toastMsg ? (
        <div className="hairline mono fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-paper px-3 py-2 text-[12px]">
          ✓ {toastMsg}
        </div>
      ) : null}
    </UIContext.Provider>
  );
}

export { initials, Chip };
