import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mic, Keyboard, Save } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Select, StatusBadge, TextArea, useToast } from "@/components/ui";
import { STATUSES, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Detail — GramVoice Admin" },
      { name: "description", content: "Read the full complaint, reply and update its status." },
      { property: "og:title", content: "Complaint Detail — GramVoice Admin" },
      {
        property: "og:description",
        content: "Read the full complaint, reply and update its status.",
      },
    ],
  }),
  component: ComplaintDetail,
});

function ComplaintDetail() {
  const { id } = Route.useParams();
  const { db } = useStore();
  const api = useApi();
  const toast = useToast();
  const complaint = db.complaints.find((c) => c.id === id);

  const [status, setStatus] = useState<Status>(complaint?.status ?? "Under Review");
  const [reply, setReply] = useState(complaint?.reply ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!complaint) {
    return (
      <Shell portal="admin" title="Complaint not found">
        <EmptyState
          icon={<Keyboard className="size-8" />}
          title="This complaint no longer exists"
          description="It may have been removed. Return to the review list to continue."
          action={
            <Link to="/admin/complaints">
              <Button variant="admin">Back to complaints</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  async function save() {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      await api.updateComplaint(id, { status, reply: reply.trim() });
      setSaved(true);
      toast(`Status saved as “${status}”.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={complaint.id}
      subtitle={`Raised ${new Date(complaint.createdAt).toLocaleString()}`}
      right={
        <Link to="/admin/complaints">
          <Button variant="outline" icon={<ArrowLeft className="size-5" />}>
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
      }
    >
      <Card elevated>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={complaint.status} />
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            {complaint.mode === "voice" ? <Mic className="size-4" /> : <Keyboard className="size-4" />}
            {complaint.mode === "voice" ? "Voice transcript" : "Typed"}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold">{complaint.title}</h2>
        <p className="mt-2 text-base leading-relaxed">{complaint.body}</p>
      </Card>

      <Card elevated className="mt-4">
        <h3 className="mb-2 text-sm font-black tracking-widest text-admin uppercase">Citizen</h3>
        <p className="text-lg font-bold">{complaint.citizenName}</p>
        <p className="text-base text-muted-foreground">{complaint.citizenPhone}</p>
      </Card>

      <Card elevated className="mt-4 space-y-5">
        <h3 className="text-sm font-black tracking-widest text-admin uppercase">Action</h3>
        {error && <Alert tone="error">{error}</Alert>}
        {saved && <Alert tone="success">Saved. The citizen now sees this update.</Alert>}
        <TextArea
          label="Reply to the citizen"
          value={reply}
          placeholder="Explain what will happen and by when."
          onChange={(e) => setReply(e.target.value)}
        />
        <Select
          label="Status"
          options={[...STATUSES]}
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          hint="Completed and Rejected are final states."
        />
        <Button variant="admin" full loading={loading} onClick={save} icon={<Save className="size-5" />}>
          Save changes
        </Button>
      </Card>

      <Card elevated className="mt-4">
        <h3 className="mb-3 text-sm font-black tracking-widest text-admin uppercase">History</h3>
        <ol className="space-y-4 border-l-2 border-border pl-5">
          {complaint.timeline.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute top-1.5 -left-[27px] size-3 rounded-full bg-admin ring-4 ring-background" />
              <StatusBadge status={t.status} />
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(t.at).toLocaleString()}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </Shell>
  );
}
