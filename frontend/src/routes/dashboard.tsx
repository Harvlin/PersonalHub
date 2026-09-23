import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, useUI } from "@/components/AppShell";
import { Button, Card, EmptyState, Field, Input, Modal, SectionLabel, Segmented, Textarea } from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import { TaskDrawer, TaskRow } from "@/components/tasks";
import {
  TODAY,
  ageInDays,
  daysBetween,
  initials,
  pingInfo,
  useStore,
  type Task,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Personal Hub" },
      {
        name: "description",
        content: "Today's tasks, contact pings due, and 14-day project velocity in one e-ink control center.",
      },
      { property: "og:title", content: "Dashboard — Personal Hub" },
      {
        property: "og:description",
        content: "Today's tasks, contact pings due, and 14-day project velocity in one e-ink control center.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const store = useStore();
  const { openQuickAdd, toast } = useUI();
  const navigate = useNavigate();
  const [range, setRange] = useState<"today" | "week">("today");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [logFor, setLogFor] = useState<string | null>(null);

  const inRange = (due: string | null) => {
    if (!due) return false;
    const diff = daysBetween(TODAY, due);
    return range === "today" ? diff <= 0 : diff <= 7;
  };

  const visibleTasks = store.tasks
    .filter((t) => inRange(t.due))
    .filter((t) => (hideDone ? t.status !== "done" : true));

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of visibleTasks) {
      const key = `${t.project_id}::${t.milestone_id}`;
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return [...map.entries()];
  }, [visibleTasks]);

  const pings = store.contacts
    .map((c) => ({ contact: c, ping: pingInfo(c) }))
    .filter((x) => (range === "today" ? x.ping.overdue || x.ping.overdueBy > -3 : x.ping.overdueBy > -7))
    .sort((a, b) => b.ping.overdueBy - a.ping.overdueBy);

  const recent = store.interactions.slice(0, 4);

  const velocity = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const day = 13 - i;
      const done = store.tasks.filter(
        (t) => t.status === "done" && t.due && daysBetween(t.due, TODAY) === day,
      ).length;
      return done;
    });
  }, [store.tasks]);
  const velocityTotal = velocity.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader crumbs={[{ label: "Dashboard" }]}>
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
          ]}
        />
        <Button onClick={() => setFilterOpen(true)}>Filter</Button>
        <Button variant="solid" onClick={() => openQuickAdd()}>
          Quick Add
        </Button>
      </PageHeader>

      <div className="space-y-5 p-5">
        {/* HERO */}
        <Card grain className="grid gap-px md:grid-cols-2">
          <div className="p-5">
            <SectionLabel>Due {range === "today" ? "Today" : "This Week"}</SectionLabel>
            <ul className="mt-3 space-y-2.5">
              {visibleTasks.filter((t) => t.status !== "done").slice(0, 5).map((t) => {
                const ms = store.milestones.find((m) => m.id === t.milestone_id);
                return (
                  <li key={t.id} className="flex items-center gap-2.5">
                    <StatusGlyph status={t.status} />
                    <button
                      onClick={() => setDrawerTask(t)}
                      className="focus-ink truncate text-left text-[13px] underline decoration-border underline-offset-2 hover:decoration-ink"
                    >
                      {t.title}
                    </button>
                    {ms ? (
                      <Link
                        to="/projects/$id"
                        params={{ id: t.project_id }}
                        className="mono hairline shrink-0 rounded-full px-2 py-0.5 text-[10.5px] text-ink-secondary hover:text-ink"
                      >
                        {ms.name}
                      </Link>
                    ) : null}
                    <span className="mono ml-auto shrink-0 text-[11px] text-ink-muted">{t.due}</span>
                  </li>
                );
              })}
              {visibleTasks.filter((t) => t.status !== "done").length === 0 ? (
                <EmptyState
                  message="Nothing due — the page is clear."
                  actionLabel="Add a task"
                  onAction={() => openQuickAdd({ type: "task" })}
                />
              ) : null}
            </ul>
          </div>

          <div className="border-t border-border p-5 md:border-l md:border-t-0">
            <SectionLabel>Pings Due</SectionLabel>
            <ul className="mt-3 space-y-2.5">
              {pings.map(({ contact, ping }) => (
                <li key={contact.id} className="flex items-center gap-2.5">
                  <span className="hairline mono flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] text-[10px]">
                    {initials(contact.name)}
                  </span>
                  <Link
                    to="/contacts/$id"
                    params={{ id: contact.id }}
                    className="truncate text-[13px] underline decoration-border underline-offset-2"
                  >
                    {contact.name}
                  </Link>
                  <span
                    className={`mono shrink-0 text-[11px] ${ping.overdue ? "text-signal" : "text-ink-muted"}`}
                  >
                    last contact {ping.since}d ago
                  </span>
                  <Button className="ml-auto shrink-0" onClick={() => setLogFor(contact.id)}>
                    Log Interaction
                  </Button>
                </li>
              ))}
              {pings.length === 0 ? (
                <EmptyState message="No pings due — everyone is warm." />
              ) : null}
            </ul>
          </div>
        </Card>

        {/* TASK TABLE */}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <SectionLabel>Tasks</SectionLabel>
            <span className="mono text-[11px] text-ink-muted">{visibleTasks.length} shown</span>
          </div>
          {grouped.length === 0 ? (
            <EmptyState
              message="No tasks in this range yet."
              actionLabel="Create the first task"
              onAction={() => openQuickAdd({ type: "task" })}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="micro-label px-3 py-2 text-left">St</th>
                  <th className="micro-label px-3 py-2 text-left">Task</th>
                  <th className="micro-label px-3 py-2 text-left">Project</th>
                  <th className="micro-label px-3 py-2 text-left">Due</th>
                  <th className="micro-label px-3 py-2 text-left">Age</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map(([key, rows]) => {
                  const [pid, mid] = key.split("::");
                  const project = store.projects.find((p) => p.id === pid);
                  const milestone = store.milestones.find((m) => m.id === mid);
                  return (
                    <>
                      <tr key={key} className="border-t border-border bg-accent/40">
                        <td colSpan={5} className="px-3 py-1.5">
                          <button
                            onClick={() => navigate({ to: "/projects/$id", params: { id: pid as string } })}
                            className="micro-label focus-ink hover:text-ink"
                          >
                            {project?.name} / {milestone?.name}
                          </button>
                        </td>
                      </tr>
                      {rows.map((t) => (
                        <TaskRow key={t.id} task={t} showProject onOpen={setDrawerTask} />
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* BOTTOM SPLIT */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="border-b border-border px-4 py-2.5">
              <SectionLabel>Recent Contact Interactions</SectionLabel>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((i) => {
                const contact = store.contacts.find((c) => c.id === i.contact_id);
                return (
                  <li key={i.id} className="flex flex-wrap items-baseline gap-2 px-4 py-2.5">
                    <span className="mono text-[11px] text-ink-muted">{i.date}</span>
                    <span className="text-[13px] font-medium">{contact?.name}</span>
                    <p className="w-full text-[12.5px] text-ink-secondary">{i.note}</p>
                    <button
                      onClick={() =>
                        openQuickAdd({
                          type: "task",
                          title: i.note,
                          ...(contact ? { contact_id: contact.id } : {}),
                        })
                      }
                      className="focus-ink mono text-[11px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink"
                    >
                      → Convert to Task
                    </button>
                  </li>
                );
              })}
              {recent.length === 0 ? <EmptyState message="No interactions logged yet." /> : null}
            </ul>
          </Card>

          <Card>
            <div className="border-b border-border px-4 py-2.5">
              <SectionLabel>Project Velocity — Last 14 Days</SectionLabel>
            </div>
            <div className="p-4">
              <div className="flex h-28 items-end gap-1.5">
                {velocity.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full bg-ink"
                      style={{ height: `${Math.max(2, v * 26)}px` }}
                      title={`${v} done`}
                    />
                  </div>
                ))}
              </div>
              <p className="mono mt-3 text-[11.5px] text-ink-secondary">
                {velocityTotal} tasks completed · {store.tasks.filter((t) => t.status === "blocked").length} blocked ·{" "}
                {store.projects.filter((p) => !p.is_archived).length} active projects
              </p>
            </div>
          </Card>
        </div>
      </div>

      <TaskDrawer task={drawerTask} onClose={() => setDrawerTask(null)} />

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter tasks" width="max-w-sm">
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Hide completed tasks
        </label>
        <div className="mt-4 flex justify-end">
          <Button variant="solid" onClick={() => setFilterOpen(false)}>
            Apply
          </Button>
        </div>
      </Modal>

      {logFor ? (
        <LogInteractionModal
          contactId={logFor}
          onClose={() => setLogFor(null)}
          onSaved={() => toast("Interaction logged")}
        />
      ) : null}
    </>
  );
}

export function LogInteractionModal({
  contactId,
  onClose,
  onSaved,
}: {
  contactId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { logInteraction, contacts } = useStore();
  const [note, setNote] = useState("");
  const [date, setDate] = useState(TODAY);
  const [error, setError] = useState("");
  const contact = contacts.find((c) => c.id === contactId);

  return (
    <Modal open onClose={onClose} title={`Log interaction — ${contact?.name ?? ""}`} width="max-w-md">
      <div className="space-y-3">
        <Field label="Notes" error={error}>
          <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you talk about?" />
        </Field>
        <Field label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="solid"
            onClick={() => {
              if (!note.trim()) return setError("Notes are required");
              logInteraction(contactId, note.trim(), date);
              onSaved?.();
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { ageInDays };
