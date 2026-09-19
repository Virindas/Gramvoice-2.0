import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Keyboard, Send } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, TextArea, VoiceRecorderControl, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/citizen/complaint/new")({
  head: () => ({
    meta: [
      { title: "Register a Complaint — GramVoice" },
      { name: "description", content: "Record your complaint by voice or type it out and submit." },
      { property: "og:title", content: "Register a Complaint — GramVoice" },
      {
        property: "og:description",
        content: "Record your complaint by voice or type it out and submit.",
      },
    ],
  }),
  component: NewComplaint,
});

function NewComplaint() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [phase, setPhase] = useState<"idle" | "recording" | "transcribing" | "done">("idle");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = text.trim().length >= 10 && phase !== "recording" && phase !== "transcribing";

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await api.createComplaint({ body: text.trim(), mode });
      toast("Complaint submitted. Status: Under Review.");
      navigate({ to: "/citizen/complaints" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="citizen"
      title="Register a complaint"
      subtitle="Speak it or write it — both reach the same desk."
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
        {(
          [
            { key: "voice", label: "Voice", icon: Mic },
            { key: "text", label: "Text", icon: Keyboard },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2 rounded-xl text-base font-bold transition-colors",
              mode === t.key ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
            )}
          >
            <t.icon className="size-5" /> {t.label}
          </button>
        ))}
      </div>

      <Card elevated className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        {mode === "voice" && (
          <VoiceRecorderControl phase={phase} setPhase={setPhase} onTranscript={setText} />
        )}

        {(mode === "text" || phase === "done") && (
          <TextArea
            label={mode === "voice" ? "Your transcript (you can edit it)" : "Your complaint"}
            rows={7}
            value={text}
            placeholder="Describe the problem, where it is, and how long it has been happening."
            onChange={(e) => setText(e.target.value)}
            hint={`${text.trim().length}/10 characters minimum`}
            error={text.length > 0 && text.trim().length < 10 ? "Please add a little more detail." : ""}
          />
        )}

        <Alert tone="info">Every new complaint starts as “Under Review”.</Alert>

        <Button full loading={loading} disabled={!valid} onClick={submit} icon={<Send className="size-5" />}>
          Submit complaint
        </Button>
      </Card>
    </Shell>
  );
}
