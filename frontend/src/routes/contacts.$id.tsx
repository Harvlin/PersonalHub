import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, useUI } from "@/components/AppShell";
import { Button, Card, Chip, EmptyState, Field, Input, Markdown, SectionLabel, Textarea } from "@/components/ui-kit";
import { LogInteractionModal } from "@/routes/dashboard";
import { initials, pingInfo, useStore } from "@/lib/store";

export const Route = createFileRoute("/contacts/$id")({
  head: () => ({
    meta: [
      { title: "Contact — Personal Hub" },
      { name: "description", content: "Preference notes, interaction log, tags, and ping status for one contact." },
      { property: "og:title", content: "Contact — Personal Hub" },
      { property: "og:description", content: "Preference notes, interaction log, tags, and ping status for one contact." },
    ],
  }),
  component: ContactDetail,
});

const NOTES_KEY = "__notes__";

function ContactDetail() {
  const { id } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const { openQuickAdd, toast } = useUI();
  const contact = store.contacts.find((c) => c.id === id);

  const [editing, setEditing] = useState(false);
  const [origin, setOrigin] = useState("");
  const [tags, setTags] = useState("");
  const [interval, setIntervalDays] = useState("");
  const [logging, setLogging] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  if (!contact) {
    return (
      <>
        <PageHeader crumbs={[{ label: "Contacts", to: "/contacts" }, { label: "Unknown" }]} />
        <div className="p-5">
          <Card>
            <EmptyState message="This contact no longer exists." actionLabel="Back to contacts" onAction={() => navigate({ to: "/contacts" })} />
          </Card>
        </div>
      </>
    );
  }

  const ping = pingInfo(contact);
  const interactions = store.interactions
    .filter((i) => i.contact_id === contact.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const noteText = contact.notes ?? "";

  return (
    <>
      <PageHeader crumbs={[{ label: "Contacts", to: "/contacts" }, { label: contact.name }]}>
        <Button
          onClick={() => {
            setOrigin(contact.origin_context);
            setTags(contact.tags.join(", "));
            setIntervalDays(String(contact.ping_interval_days));
            setEditing(true);
          }}
        >
          Edit
        </Button>
        <Button variant="solid" onClick={() => setLogging(true)}>
          Log Interaction
        </Button>
      </PageHeader>

      <div className="space-y-5 p-5">
        <Card grain className="p-5">
          {editing ? (
            <div className="max-w-lg space-y-3">
              <Field label="Origin context">
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </Field>
              <Field label="Tags (comma separated)">
                <Input value={tags} onChange={(e) => setTags(e.target.value)} />
              </Field>
              <Field label="Ping interval (days)">
                <Input value={interval} onChange={(e) => setIntervalDays(e.target.value)} inputMode="numeric" />
              </Field>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setEditing(false)}>Cancel</Button>
                <Button
                  variant="solid"
                  onClick={() => {
                    store.updateContact(contact.id, {
                      origin_context: origin,
                      tags: tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean),
                      ping_interval_days: Number(interval) || contact.ping_interval_days,
                    });
                    setEditing(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="hairline mono flex h-10 w-10 items-center justify-center rounded-[3px] text-[13px]">
                {initials(contact.name)}
              </span>
              <div>
                <h1 className="text-[18px] font-semibold">{contact.name}</h1>
                <p className="text-[12.5px] text-ink-muted">Met at: {contact.origin_context}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {contact.tags.map((t) => (
                    <Chip key={t}>#{t}</Chip>
                  ))}
                </div>
                <p className={`mono mt-2 text-[11.5px] ${ping.overdue ? "text-signal" : "text-ink-secondary"}`}>
                  last contact {ping.since}d ago · every {contact.ping_interval_days}d ·{" "}
                  {ping.overdue ? `${ping.overdueBy}d overdue` : `next ping ${ping.nextPing}`}
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Preference Notes</SectionLabel>
          </div>
          <div className="p-4">
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea rows={5} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditingNotes(false)}>Cancel</Button>
                  <Button
                    variant="solid"
                    onClick={() => {
                      store.updateContact(contact.id, { notes: notesDraft });
                      setEditingNotes(false);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNotesDraft(noteText);
                  setEditingNotes(true);
                }}
                className="focus-ink block w-full text-left"
              >
                {noteText ? (
                  <Markdown text={noteText} />
                ) : (
                  <p className="mono text-[12px] text-ink-muted">No preference notes yet — click to write some.</p>
                )}
              </button>
            )}
          </div>
        </Card>

        <Card>
          <div className="border-b border-border px-4 py-2.5">
            <SectionLabel>Interactions</SectionLabel>
          </div>
          <ul className="divide-y divide-border">
            {interactions.map((i) => (
              <li key={i.id} className="px-4 py-3">
                <div className="mono text-[11px] text-ink-muted">{i.date}</div>
                <p className="mt-1 text-[13px] text-ink-secondary">{i.note}</p>
                <button
                  onClick={() => {
                    openQuickAdd({ type: "task", title: i.note, contact_id: contact.id });
                    toast("Opened Quick Add with this note");
                  }}
                  className="focus-ink mono mt-1 text-[11px] text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink"
                >
                  → Convert to Task
                </button>
              </li>
            ))}
            {interactions.length === 0 ? (
              <li>
                <EmptyState message="No interactions logged yet." actionLabel="Log the first one" onAction={() => setLogging(true)} />
              </li>
            ) : null}
          </ul>
        </Card>
      </div>

      {logging ? (
        <LogInteractionModal
          contactId={contact.id}
          onClose={() => setLogging(false)}
          onSaved={() => toast("Interaction logged")}
        />
      ) : null}
    </>
  );
}
