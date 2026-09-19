import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Scale } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, useToast } from "@/components/ui";
import type { Rule } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/rules")({
  head: () => ({
    meta: [
      { title: "Manage Village Rules — GramVoice Admin" },
      { name: "description", content: "Add, edit or remove the rules citizens see in the Rule Book." },
      { property: "og:title", content: "Manage Village Rules — GramVoice Admin" },
      {
        property: "og:description",
        content: "Add, edit or remove the rules citizens see in the Rule Book.",
      },
    ],
  }),
  component: ManageRules,
});

const blank = { id: "", section: "", title: "", body: "" };

function ManageRules() {
  const { db } = useStore();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        section: draft.section.trim().length < 2 ? "Enter a section, e.g. Water." : "",
        title: draft.title.trim().length < 3 ? "Enter a rule title." : "",
        body: draft.body.trim().length < 10 ? "Describe the rule in at least 10 characters." : "",
      }
    : { section: "", title: "", body: "" };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!draft || !valid) return;
    setLoading(true);
    setError("");
    try {
      await api.saveRule({ ...draft, id: draft.id || api.newId("r") });
      toast("Rule saved.");
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
      title="Manage rules"
      subtitle="These appear in the citizen Rule Book."
      right={
        <Button variant="admin" icon={<Plus className="size-5" />} onClick={() => setDraft(blank)}>
          <span className="hidden sm:inline">New rule</span>
        </Button>
      }
    >
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<Scale className="size-8" />}
          title="No rules published"
          description="Add your first rule so citizens know what applies in the village."
          action={
            <Button variant="admin" onClick={() => setDraft(blank)}>
              Add a rule
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {db.rules.map((r) => (
            <Card key={r.id} elevated>
              <p className="text-xs font-black tracking-widest text-admin uppercase">{r.section}</p>
              <h2 className="mt-1 text-lg font-bold">{r.title}</h2>
              <p className="mt-1 text-base text-muted-foreground">{r.body}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" icon={<Pencil className="size-5" />} onClick={() => setDraft(r)}>
                  Edit
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="size-5" />}
                  onClick={async () => {
                    await api.deleteRule(r.id);
                    toast("Rule deleted.");
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
        title={draft?.id ? "Edit rule" : "New rule"}
      >
        {draft && (
          <div className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Input
              label="Section"
              value={draft.section}
              placeholder="Water, Cleanliness, Community…"
              onChange={(e) => setDraft({ ...draft, section: e.target.value })}
              error={errors.section}
            />
            <Input
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              error={errors.title}
            />
            <TextArea
              label="Rule text"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              Save rule
            </Button>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
