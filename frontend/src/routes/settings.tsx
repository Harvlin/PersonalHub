import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, useUI } from "@/components/AppShell";
import { Button, Card, EmptyState, Field, Input, SectionLabel } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Personal Hub" },
      { name: "description", content: "Default ping interval, archived projects, and the locked e-ink paper theme." },
      { property: "og:title", content: "Settings — Personal Hub" },
      { property: "og:description", content: "Default ping interval, archived projects, and the locked e-ink paper theme." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const store = useStore();
  const { toast } = useUI();
  const [value, setValue] = useState(String(store.defaultPingInterval));
  const [error, setError] = useState("");
  const archived = store.projects.filter((p) => p.is_archived);

  return (
    <>
      <PageHeader crumbs={[{ label: "Settings" }]} />

      <div className="max-w-2xl space-y-5 p-5">
        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Default ping interval (days)</SectionLabel>
          </div>
          <div className="flex items-end gap-2 p-4">
            <div className="w-32">
              <Field label="Days" error={error}>
                <Input value={value} onChange={(e) => setValue(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
            <Button
              variant="solid"
              onClick={() => {
                const n = Number(value);
                if (!n || n < 1) return setError("Enter a number of days");
                store.setDefaultPingInterval(n);
                setError("");
                toast(`Default ping interval set to ${n}d`);
              }}
            >
              Save
            </Button>
            <span className="mono pb-1.5 text-[11px] text-ink-muted">
              currently {store.defaultPingInterval}d
            </span>
          </div>
        </Card>

        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Archived Projects</SectionLabel>
          </div>
          <ul className="divide-y divide-border">
            {archived.map((p) => (
              <li key={p.id} className="flex items-center gap-2 px-4 py-2.5">
                <span className="text-[13px]">{p.name}</span>
                <button
                  onClick={() => store.updateProject(p.id, { is_archived: false })}
                  className="focus-ink mono ml-auto text-[11.5px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink"
                >
                  Unarchive
                </button>
              </li>
            ))}
            {archived.length === 0 ? <li><EmptyState message="Nothing archived." /></li> : null}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Theme</SectionLabel>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-ink-muted">E-Ink Paper (locked)</span>
            <span className="mono text-[11px] text-ink-muted">no alternatives</span>
          </div>
        </Card>
      </div>
    </>
  );
}
