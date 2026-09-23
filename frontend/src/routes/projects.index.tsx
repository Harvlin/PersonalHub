import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, useUI } from "@/components/AppShell";
import { Button, Card, EmptyState, Modal, Segmented } from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import { ageInDays, statusLabel, useStore } from "@/lib/store";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Personal Hub" },
      { name: "description", content: "All active and archived projects with milestone progress at a glance." },
      { property: "og:title", content: "Projects — Personal Hub" },
      { property: "og:description", content: "All active and archived projects with milestone progress at a glance." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const store = useStore();
  const { openQuickAdd } = useUI();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const projects = store.projects
    .filter((p) => (tab === "active" ? !p.is_archived : p.is_archived))
    .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter));

  return (
    <>
      <PageHeader crumbs={[{ label: "Projects" }]}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
        />
        <Button onClick={() => setFilterOpen(true)}>Filter</Button>
        <Button variant="solid" onClick={() => openQuickAdd({ type: "project" })}>
          New Project
        </Button>
      </PageHeader>

      <div className="p-5">
        {projects.length === 0 ? (
          <Card>
            <EmptyState
              message={tab === "active" ? "No active projects yet." : "Nothing archived."}
              {...(tab === "active"
                ? { actionLabel: "Create the first project", onAction: () => openQuickAdd({ type: "project" }) }
                : {})}
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const ms = store.milestones.filter((m) => m.project_id === p.id);
              const tasks = store.tasks.filter((t) => t.project_id === p.id);
              const doneMs = ms.filter(
                (m) =>
                  tasks.filter((t) => t.milestone_id === m.id).length > 0 &&
                  tasks.filter((t) => t.milestone_id === m.id).every((t) => t.status === "done"),
              ).length;
              return (
                <Card key={p.id} className="relative">
                  <button
                    onClick={() => navigate({ to: "/projects/$id", params: { id: p.id } })}
                    className="focus-ink block w-full p-4 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <StatusGlyph status={p.status} />
                      <h2 className="text-[14px] font-semibold">{p.name}</h2>
                    </div>
                    <p className="mono mt-2 text-[11.5px] text-ink-secondary">
                      {doneMs}/{ms.length} milestones done
                    </p>
                    <p className="mono mt-1 text-[11px] text-ink-muted">
                      updated {ageInDays(p.updated)}d ago · {statusLabel(p.status).toLowerCase()}
                    </p>
                  </button>
                  <button
                    aria-label="Project actions"
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                    className="focus-ink absolute right-2 top-2 rounded-[3px] px-1.5 text-[14px] leading-none text-ink-muted hover:text-ink"
                  >
                    ···
                  </button>
                  {menuFor === p.id ? (
                    <div className="hairline absolute right-2 top-8 z-20 rounded-md bg-paper p-1">
                      <button
                        onClick={() => {
                          store.updateProject(p.id, { is_archived: !p.is_archived });
                          setMenuFor(null);
                        }}
                        className="block w-full rounded-[3px] px-3 py-1.5 text-left text-[12.5px] hover:bg-accent"
                      >
                        {p.is_archived ? "Unarchive" : "Archive"}
                      </button>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter by status" width="max-w-sm">
        <div className="flex flex-wrap gap-2">
          {["all", "todo", "in_progress", "waiting", "blocked", "done"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`mono hairline rounded-full px-2.5 py-1 text-[11px] ${
                statusFilter === s ? "bg-ink text-primary-foreground" : "text-ink-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="solid" onClick={() => setFilterOpen(false)}>
            Apply
          </Button>
        </div>
      </Modal>
    </>
  );
}
