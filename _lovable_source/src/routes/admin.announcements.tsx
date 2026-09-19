import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, useToast } from "@/components/ui";
import type { Announcement } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "Manage Announcements — GramVoice Admin" },
      { name: "description", content: "Publish notices that appear on every citizen's home screen." },
      { property: "og:title", content: "Manage Announcements — GramVoice Admin" },
      {
        property: "og:description",
        content: "Publish notices that appear on every citizen's home screen.",
      },
    ],
  }),
  component: ManageAnnouncements,
});

function ManageAnnouncements() {
  const { db } = useStore();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        title: draft.title.trim().length < 3 ? "Enter a short headline." : "",
        body: draft.body.trim().length < 10 ? "Add at least 10 characters of detail." : "",
      }
    : { title: "", body: "" };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!draft || !valid) return;
    setLoading(true);
    setError("");
    try {
      await api.saveAnnouncement({
        ...draft,
        id: draft.id || api.newId("n"),
        date: draft.date || new Date().toISOString(),
      });
      toast("Announcement published.");
      setDraft(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title="Announcements"
      subtitle="Shown on the citizen home screen."
      right={
        <Button
          variant="admin"
          icon={<Plus className="size-5" />}
          onClick={() => setDraft({ id: "", title: "", body: "", date: "" })}
        >
          <span className="hidden sm:inline">New notice</span>
        </Button>
      }
    >
      {db.announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-8" />}
          title="No announcements yet"
          description="Publish a notice about camps, meetings or maintenance work."
          action={
            <Button
              variant="admin"
              onClick={() => setDraft({ id: "", title: "", body: "", date: "" })}
            >
              Add announcement
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {db.announcements.map((a) => (
            <Card key={a.id} elevated>
              <h2 className="text-lg font-bold">{a.title}</h2>
              <p className="mt-1 text-base text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(a.date).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" icon={<Pencil className="size-5" />} onClick={() => setDraft(a)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="size-5" />}
                  onClick={async () => {
                    await api.deleteAnnouncement(a.id);
                    toast("Announcement removed.");
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit announcement" : "New announcement"}
      >
        {draft && (
          <div className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Input
              label="Headline"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              error={errors.title}
            />
            <TextArea
              label="Details"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              Publish
            </Button>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
