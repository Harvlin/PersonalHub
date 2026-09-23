import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button, Drawer, Field, Input, Textarea } from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import {
  ageInDays,
  nextStatus,
  statusLabel,
  useStore,
  type Task,
} from "@/lib/store";

export function TaskStatusControl({ task }: { task: Task }) {
  const { updateTask } = useStore();
  const [pendingBlocked, setPendingBlocked] = useState(false);
  const [reason, setReason] = useState(task.blocked_reason ?? "");
  const [error, setError] = useState("");

  const cycle = () => {
    const next = nextStatus(task.status);
    if (next === "blocked") {
      setPendingBlocked(true);
      return;
    }
    updateTask(task.id, { status: next, blocked_reason: undefined });
  };

  return (
    <div className="relative">
      <button
        onClick={cycle}
        title={statusLabel(task.status)}
        aria-label={`Status: ${statusLabel(task.status)}. Click to cycle.`}
        className="focus-ink flex h-5 w-5 items-center justify-center text-ink"
      >
        <StatusGlyph status={task.status} />
      </button>

      {pendingBlocked ? (
        <div className="hairline absolute left-0 top-6 z-30 w-64 rounded-md bg-paper p-2">
          <Field label="Blocked reason" error={error}>
            <Input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this blocked?"
            />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              onClick={() => {
                setPendingBlocked(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!reason.trim()) return setError("A reason is required to block");
                updateTask(task.id, { status: "blocked", blocked_reason: reason.trim() });
                setPendingBlocked(false);
                setError("");
              }}
            >
              Block
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TaskRow({
  task,
  showProject,
  onOpen,
}: {
  task: Task;
  showProject?: boolean;
  onOpen: (t: Task) => void;
}) {
  const { projects, milestones } = useStore();
  const project = projects.find((p) => p.id === task.project_id);
  const milestone = milestones.find((m) => m.id === task.milestone_id);

  return (
    <tr className="border-t border-border align-middle">
      <td className="w-8 px-3 py-2">
        <TaskStatusControl task={task} />
      </td>
      <td className="px-3 py-2">
        <button
          onClick={() => onOpen(task)}
          className="focus-ink text-left text-[13px] underline decoration-border underline-offset-2 hover:decoration-ink"
        >
          {task.title}
        </button>
        {task.status === "blocked" && task.blocked_reason ? (
          <div className="mono mt-0.5 text-[11px] text-signal">blocked — {task.blocked_reason}</div>
        ) : null}
      </td>
      {showProject ? (
        <td className="px-3 py-2">
          {project ? (
            <Link
              to="/projects/$id"
              params={{ id: project.id }}
              className="mono text-[11.5px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink"
            >
              {project.name}
              {milestone ? ` / ${milestone.name}` : ""}
            </Link>
          ) : null}
        </td>
      ) : null}
      <td className="mono px-3 py-2 text-[11.5px] text-ink-secondary">{task.due ?? "—"}</td>
      <td className="mono px-3 py-2 text-[11.5px] text-ink-muted">{ageInDays(task.created)}d</td>
    </tr>
  );
}

export function TaskDrawer({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { projects, milestones, updateTask, deleteTask } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");

  if (!task) return null;
  const project = projects.find((p) => p.id === task.project_id);
  const milestone = milestones.find((m) => m.id === task.milestone_id);

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description);
    setDue(task.due ?? "");
    setEditing(true);
  };

  return (
    <Drawer open onClose={onClose} title="Task">
      {editing ? (
        <div className="space-y-3">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditing(false)}>Cancel</Button>
            <Button
              variant="solid"
              onClick={() => {
                updateTask(task.id, { title, description, due: due || null });
                setEditing(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <TaskStatusControl task={task} />
            <h3 className="text-[15px] font-semibold leading-snug">{task.title}</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            {task.description || "No description."}
          </p>
          <dl className="hairline mono divide-y divide-border rounded-md text-[12px]">
            <div className="flex justify-between px-3 py-2">
              <dt className="text-ink-muted">status</dt>
              <dd>{statusLabel(task.status)}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-ink-muted">project</dt>
              <dd>
                {project ? (
                  <Link
                    to="/projects/$id"
                    params={{ id: project.id }}
                    onClick={onClose}
                    className="underline decoration-border underline-offset-2"
                  >
                    {project.name}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-ink-muted">milestone</dt>
              <dd>{milestone?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-ink-muted">due</dt>
              <dd>{task.due ?? "—"}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-ink-muted">age</dt>
              <dd>{ageInDays(task.created)}d</dd>
            </div>
            {task.blocked_reason ? (
              <div className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-ink-muted">blocked</dt>
                <dd className="text-right text-signal">{task.blocked_reason}</dd>
              </div>
            ) : null}
          </dl>
          <div className="flex justify-end gap-2">
            <Button onClick={startEdit}>Edit</Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteTask(task.id);
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
