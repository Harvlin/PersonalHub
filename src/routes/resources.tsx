import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Button, Card, Chip, EmptyState, Modal } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Personal Hub" },
      { name: "description", content: "Every repo, design file, and API doc linked across all projects in one table." },
      { property: "og:title", content: "Resources — Personal Hub" },
      { property: "og:description", content: "Every repo, design file, and API doc linked across all projects in one table." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [projectId, setProjectId] = useState("all");

  const rows = store.resources.filter((r) => projectId === "all" || r.project_id === projectId);

  return (
    <>
      <PageHeader crumbs={[{ label: "Resources" }]}>
        <Button onClick={() => setFilterOpen(true)}>
          Filter by project{projectId !== "all" ? " · 1" : ""}
        </Button>
      </PageHeader>

      <div className="p-5">
        <Card>
          {rows.length === 0 ? (
            <EmptyState
              message="No resources yet — add them from inside a project."
              actionLabel="Go to projects"
              onAction={() => navigate({ to: "/projects" })}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="micro-label px-4 py-2 text-left">Label</th>
                  <th className="micro-label px-4 py-2 text-left">URL</th>
                  <th className="micro-label px-4 py-2 text-left">Project</th>
                  <th className="micro-label px-4 py-2 text-left">Added</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const project = store.projects.find((p) => p.id === r.project_id);
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-2.5 text-[13px]">{r.label}</td>
                      <td className="px-4 py-2.5">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mono text-[11.5px] underline decoration-border underline-offset-2 hover:decoration-ink"
                        >
                          {r.url}
                        </a>
                      </td>
                      <td className="px-4 py-2.5">
                        {project ? (
                          <Link to="/projects/$id" params={{ id: project.id }}>
                            <Chip>{project.name}</Chip>
                          </Link>
                        ) : null}
                      </td>
                      <td className="mono px-4 py-2.5 text-[11.5px] text-ink-muted">{r.added}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter by project" width="max-w-sm">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={projectId === "all"} onClick={() => setProjectId("all")}>
            all
          </Chip>
          {store.projects.map((p) => (
            <Chip key={p.id} active={projectId === p.id} onClick={() => setProjectId(p.id)}>
              {p.name}
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="solid" onClick={() => setFilterOpen(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
