import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Markdown,
  Modal,
  SectionLabel,
  Textarea,
} from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import { TaskDrawer, TaskRow } from "@/components/tasks";
import { TODAY, useStore, type Task } from "@/lib/store";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project — Personal Hub" },
      { name: "description", content: "Milestones, tasks, resources, and attachments for a single project." },
      { property: "og:title", content: "Project — Personal Hub" },
      { property: "og:description", content: "Milestones, tasks, resources, and attachments for a single project." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const project = store.projects.find((p) => p.id === id);

  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneName, setMilestoneName] = useState("");
  const [addTaskFor, setAddTaskFor] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(TODAY);
  const [addingResource, setAddingResource] = useState(false);
  const [resLabel, setResLabel] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  if (!project) {
    return (
      <>
        <PageHeader crumbs={[{ label: "Projects", to: "/projects" }, { label: "Unknown" }]} />
        <div className="p-5">
          <Card>
            <EmptyState message="This project no longer exists." actionLabel="Back to projects" onAction={() => navigate({ to: "/projects" })} />
          </Card>
        </div>
      </>
    );
  }

  const milestones = store.milestones.filter((m) => m.project_id === project.id);
  const firstInProgress = milestones.find((m) => m.status === "in_progress");
  const isOpen = (mid: string) => open[mid] ?? mid === firstInProgress?.id;
  const resources = store.resources.filter((r) => r.project_id === project.id);
  const attachments = store.attachments.filter((a) => a.project_id === project.id);

  return (
    <>
      <PageHeader crumbs={[{ label: "Projects", to: "/projects" }, { label: project.name }]}>
        <Button onClick={() => setConfirmArchive(true)}>{project.is_archived ? "Unarchive" : "Archive"}</Button>
        <Button variant="solid" onClick={() => setAddingMilestone(true)}>
          Add Milestone
        </Button>
      </PageHeader>

      <div className="space-y-5 p-5">
        <Card grain className="p-5">
          <div className="flex items-center gap-2">
            <StatusGlyph status={project.status} size={14} />
            <h1 className="text-[18px] font-semibold">{project.name}</h1>
          </div>
          <p className="mono mt-1 text-[11px] text-ink-muted">
            created {project.created} · updated {project.updated}
            {project.is_archived ? " · archived" : ""}
          </p>
          <div className="mt-4">
            <SectionLabel>Description</SectionLabel>
            {editingDesc ? (
              <div className="mt-2 space-y-2">
                <Textarea rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditingDesc(false)}>Cancel</Button>
                  <Button
                    variant="solid"
                    onClick={() => {
                      store.updateProject(project.id, { description: desc });
                      setEditingDesc(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDesc(project.description);
                  setEditingDesc(true);
                }}
                className="focus-ink mt-2 block w-full text-left"
              >
                <Markdown text={project.description} />
              </button>
            )}
          </div>
        </Card>

        {addingMilestone ? (
          <Card className="p-4">
            <Field label="Milestone name" error={error}>
              <Input autoFocus value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} />
            </Field>
            <div className="mt-3 flex justify-end gap-2">
              <Button onClick={() => setAddingMilestone(false)}>Cancel</Button>
              <Button
                variant="solid"
                onClick={() => {
                  if (!milestoneName.trim()) return setError("Name is required");
                  store.addMilestone(project.id, milestoneName.trim());
                  setMilestoneName("");
                  setError("");
                  setAddingMilestone(false);
                }}
              >
                Add
              </Button>
            </div>
          </Card>
        ) : null}

        <div className="space-y-3">
          {milestones.length === 0 ? (
            <Card>
              <EmptyState
                message="No milestones yet."
                actionLabel="Add the first milestone"
                onAction={() => setAddingMilestone(true)}
              />
            </Card>
          ) : null}

          {milestones.map((m) => {
            const tasks = store.tasks.filter((t) => t.milestone_id === m.id);
            const done = tasks.filter((t) => t.status === "done").length;
            const expanded = isOpen(m.id);
            return (
              <Card key={m.id}>
                <button
                  onClick={() => setOpen((o) => ({ ...o, [m.id]: !expanded }))}
                  className="focus-ink flex w-full items-center gap-2.5 px-4 py-3 text-left"
                >
                  <StatusGlyph status={m.status} />
                  <span className="text-[13.5px] font-medium">{m.name}</span>
                  <span className="mono ml-auto text-[11.5px] text-ink-muted">
                    {done}/{tasks.length} done
                  </span>
                  <span className="mono text-[11px] text-ink-muted">{expanded ? "−" : "+"}</span>
                </button>

                {expanded ? (
                  <div className="border-t border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="micro-label px-3 py-2 text-left">St</th>
                          <th className="micro-label px-3 py-2 text-left">Task</th>
                          <th className="micro-label px-3 py-2 text-left">Due</th>
                          <th className="micro-label px-3 py-2 text-left">Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((t) => (
                          <TaskRow key={t.id} task={t} onOpen={setDrawerTask} />
                        ))}
                      </tbody>
                    </table>
                    {tasks.length === 0 ? (
                      <p className="mono px-4 py-3 text-[11.5px] text-ink-muted">No tasks in this milestone yet.</p>
                    ) : null}

                    {addTaskFor === m.id ? (
                      <div className="flex flex-wrap items-end gap-2 border-t border-border p-3">
                        <div className="min-w-[200px] flex-1">
                          <Field label="Task title">
                            <Input autoFocus value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                          </Field>
                        </div>
                        <div className="w-40">
                          <Field label="Due">
                            <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                          </Field>
                        </div>
                        <Button onClick={() => setAddTaskFor(null)}>Cancel</Button>
                        <Button
                          variant="solid"
                          onClick={() => {
                            if (!taskTitle.trim()) return;
                            store.addTask({
                              title: taskTitle.trim(),
                              project_id: project.id,
                              milestone_id: m.id,
                              due: taskDue || null,
                            });
                            setTaskTitle("");
                            setAddTaskFor(null);
                          }}
                        >
                          Add Task
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddTaskFor(m.id)}
                        className="focus-ink mono w-full border-t border-border px-4 py-2 text-left text-[11.5px] text-ink-muted hover:text-ink"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <div className="border-b border-border px-4 py-2.5">
              <SectionLabel>Resources</SectionLabel>
            </div>
            <ul className="divide-y divide-border">
              {resources.map((r) => (
                <li key={r.id} className="flex items-center gap-2 px-4 py-2.5">
                  <span className="mono hairline rounded-full px-2 py-0.5 text-[10.5px] text-ink-secondary">
                    {r.label}
                  </span>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mono truncate text-[11.5px] underline decoration-border underline-offset-2 hover:decoration-ink"
                  >
                    {r.url}
                  </a>
                  <span className="mono ml-auto shrink-0 text-[11px] text-ink-muted">{r.added}</span>
                </li>
              ))}
              {resources.length === 0 ? (
                <li>
                  <EmptyState message="No resources linked yet." actionLabel="Add a resource" onAction={() => setAddingResource(true)} />
                </li>
              ) : null}
            </ul>
            {addingResource ? (
              <div className="flex flex-wrap items-end gap-2 border-t border-border p-3">
                <div className="w-32">
                  <Field label="Label">
                    <Input autoFocus value={resLabel} onChange={(e) => setResLabel(e.target.value)} placeholder="repo" />
                  </Field>
                </div>
                <div className="min-w-[180px] flex-1">
                  <Field label="URL">
                    <Input value={resUrl} onChange={(e) => setResUrl(e.target.value)} placeholder="https://" />
                  </Field>
                </div>
                <Button onClick={() => setAddingResource(false)}>Cancel</Button>
                <Button
                  variant="solid"
                  onClick={() => {
                    if (!resLabel.trim() || !resUrl.trim()) return;
                    store.addResource(project.id, resLabel.trim(), resUrl.trim());
                    setResLabel("");
                    setResUrl("");
                    setAddingResource(false);
                  }}
                >
                  Add
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setAddingResource(true)}
                className="focus-ink mono w-full border-t border-border px-4 py-2 text-left text-[11.5px] text-ink-muted hover:text-ink"
              >
                + Add Resource
              </button>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <SectionLabel>Attachments</SectionLabel>
              <label className="focus-ink mono cursor-pointer text-[11.5px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink">
                + Upload
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const size = f.size > 1024 * 1024
                      ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.max(1, Math.round(f.size / 1024))} KB`;
                    store.addAttachment(project.id, f.name, size);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <ul className="divide-y divide-border">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-2 px-4 py-2.5">
                  <span className="truncate text-[12.5px]">{a.name}</span>
                  <span className="mono ml-auto shrink-0 text-[11px] text-ink-muted">
                    {a.size} · {a.uploaded}
                  </span>
                </li>
              ))}
              {attachments.length === 0 ? (
                <li>
                  <EmptyState message="No attachments uploaded yet." />
                </li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>

      <TaskDrawer task={drawerTask} onClose={() => setDrawerTask(null)} />

      <Modal
        open={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        title={project.is_archived ? "Unarchive project" : "Archive project"}
        width="max-w-sm"
      >
        <p className="text-[13px] text-ink-secondary">
          {project.is_archived
            ? `Move "${project.name}" back to your active projects?`
            : `"${project.name}" will move to the Archived tab and leave your active capacity.`}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setConfirmArchive(false)}>Cancel</Button>
          <Button
            variant={project.is_archived ? "solid" : "danger"}
            onClick={() => {
              store.updateProject(project.id, { is_archived: !project.is_archived });
              setConfirmArchive(false);
              navigate({ to: "/projects" });
            }}
          >
            {project.is_archived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
