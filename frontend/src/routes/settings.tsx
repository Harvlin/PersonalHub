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
  const [pingValue, setPingValue] = useState(String(store.settings.default_ping_interval));
  const [limitValue, setLimitValue] = useState(String(store.settings.active_project_limit));
  const [pingError, setPingError] = useState("");
  const [limitError, setLimitError] = useState("");
  const archived = store.projects.filter((p) => p.lifecycle === "ARCHIVED");

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
              <Field label="Days" error={pingError}>
                <Input value={pingValue} onChange={(e) => setPingValue(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
            <Button
              variant="solid"
              onClick={() => {
                const n = Number(pingValue);
                if (!n || n < 1) return setPingError("Enter a number of days");
                void store.updateSettings({ default_ping_interval: n });
                setPingError("");
                toast(`Default ping interval set to ${n}d`);
              }}
            >
              Save
            </Button>
            <span className="mono pb-1.5 text-[11px] text-ink-muted">
              currently {store.settings.default_ping_interval}d
            </span>
          </div>
        </Card>

        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Active project limit</SectionLabel>
          </div>
          <div className="flex items-end gap-2 p-4">
            <div className="w-32">
              <Field label="Limit" error={limitError}>
                <Input value={limitValue} onChange={(e) => setLimitValue(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
            <Button
              variant="solid"
              onClick={() => {
                const n = Number(limitValue);
                if (!n || n < 1) return setLimitError("Enter a number");
                void store.updateSettings({ active_project_limit: n });
                setLimitError("");
                toast(`Active project limit set to ${n}`);
              }}
            >
              Save
            </Button>
            <span className="mono pb-1.5 text-[11px] text-ink-muted">
              currently {store.settings.active_project_limit}
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
                  onClick={() => store.updateProject(p.id, { lifecycle: "ACTIVE" })}
                  className="focus-ink mono ml-auto text-[11.5px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink"
                >
                  Unarchive
                </button>
              </li>
            ))}
            {archived.length === 0 ? <li><EmptyState message="Nothing archived." /></li> : null}
          </ul>
        </Card>

      </div>
    </>
  );
}
