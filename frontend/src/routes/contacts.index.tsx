import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, useUI } from "@/components/AppShell";
import { Button, Card, Chip, EmptyState, Modal } from "@/components/ui-kit";
import { StatusGlyph } from "@/components/StatusGlyph";
import { pingInfo, useStore } from "@/lib/store";

export const Route = createFileRoute("/contacts/")({
  head: () => ({
    meta: [
      { title: "Contacts — Personal Hub" },
      { name: "description", content: "A personal CRM list with origin context, tags, and overdue ping tracking." },
      { property: "og:title", content: "Contacts — Personal Hub" },
      { property: "og:description", content: "A personal CRM list with origin context, tags, and overdue ping tracking." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const store = useStore();
  const { openQuickAdd } = useUI();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const allTags = [...new Set(store.contacts.flatMap((c) => c.tags))];
  const contacts = store.contacts.filter(
    (c) => selected.length === 0 || c.tags.some((t) => selected.includes(t)),
  );

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <>
      <PageHeader crumbs={[{ label: "Contacts" }]}>
        <Button onClick={() => setFilterOpen(true)}>
          Tags{selected.length ? ` · ${selected.length}` : ""}
        </Button>
        <Button variant="solid" onClick={() => openQuickAdd({ type: "contact" })}>
          New Contact
        </Button>
      </PageHeader>

      <div className="p-5">
        {selected.length ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {selected.map((t) => (
              <Chip key={t} active onClick={() => toggle(t)}>
                #{t} ×
              </Chip>
            ))}
          </div>
        ) : null}

        <Card>
          {contacts.length === 0 ? (
            <EmptyState
              message="No contacts match."
              actionLabel="Add a contact"
              onAction={() => openQuickAdd({ type: "contact" })}
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="micro-label px-4 py-2 text-left">Name</th>
                  <th className="micro-label px-4 py-2 text-left">Origin</th>
                  <th className="micro-label px-4 py-2 text-left">Tags</th>
                  <th className="micro-label px-4 py-2 text-left">Last Contact</th>
                  <th className="micro-label px-4 py-2 text-left">Next Ping</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => {
                  const ping = pingInfo(c);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => navigate({ to: "/contacts/$id", params: { id: c.id } })}
                      className="cursor-pointer border-t border-border hover:bg-accent"
                    >
                      <td className="px-4 py-2.5 text-[13px] font-medium">{c.name}</td>
                      <td className="px-4 py-2.5 text-[12.5px] text-ink-secondary">{c.origin_context}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {c.tags.map((t) => (
                            <Chip key={t}>#{t}</Chip>
                          ))}
                        </span>
                      </td>
                      <td className="mono px-4 py-2.5 text-[11.5px]">
                        {ping.overdue ? (
                          <span className="flex items-center gap-1.5 text-signal">
                            <StatusGlyph status="blocked" size={12} />
                            {ping.overdueBy}d overdue
                          </span>
                        ) : (
                          <span className="text-ink-secondary">{c.last_contact}</span>
                        )}
                      </td>
                      <td className="mono px-4 py-2.5 text-[11.5px] text-ink-muted">{ping.nextPing}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter by tag" width="max-w-sm">
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => (
            <Chip key={t} active={selected.includes(t)} onClick={() => toggle(t)}>
              #{t}
            </Chip>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setSelected([])}>Clear</Button>
          <Button variant="solid" onClick={() => setFilterOpen(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
