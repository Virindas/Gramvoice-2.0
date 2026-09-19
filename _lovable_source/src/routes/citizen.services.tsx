import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HandHelping } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Select, StatusBadge, TextArea, useToast } from "@/components/ui";
import { SERVICE_TYPES } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/services")({
  head: () => ({
    meta: [
      { title: "Request a Service — GramVoice" },
      {
        name: "description",
        content: "Apply for certificates, water tankers and other Panchayat services.",
      },
      { property: "og:title", content: "Request a Service — GramVoice" },
      {
        property: "og:description",
        content: "Apply for certificates, water tankers and other Panchayat services.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const api = useApi();
  const toast = useToast();
  const { citizen, db } = useStore();
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeError = !type ? "Choose the service you need." : "";
  const detailsError = details.trim().length < 10 ? "Add at least 10 characters of detail." : "";
  const valid = !typeError && !detailsError;

  const mine = db.services
    .filter((s) => s.citizenId === citizen?.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.createService({ type, details: details.trim() });
      toast("Service request sent to the Panchayat.");
      setType("");
      setDetails("");
      setTouched(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="citizen" title="Request a service" subtitle="Tell us what you need and why.">
      <Card elevated>
        <form className="space-y-5" noValidate onSubmit={submit}>
          {error && <Alert tone="error">{error}</Alert>}
          <Select
            label="Service needed"
            placeholder="Select a service"
            options={SERVICE_TYPES}
            value={type}
            onChange={(e) => setType(e.target.value)}
            error={touched ? typeError : ""}
          />
          <TextArea
            label="Details"
            value={details}
            placeholder="Why do you need it, and by when?"
            onChange={(e) => setDetails(e.target.value)}
            error={touched ? detailsError : ""}
          />
          <Button type="submit" full loading={loading} disabled={!valid}>
            Send request
          </Button>
        </form>
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-bold">Your past requests</h2>
      {mine.length === 0 ? (
        <EmptyState
          icon={<HandHelping className="size-8" />}
          title="No requests yet"
          description="Requests you send will be listed here with their current status."
        />
      ) : (
        <div className="space-y-3">
          {mine.map((s) => (
            <Card key={s.id} elevated>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-bold">{s.type}</p>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-base text-muted-foreground">{s.details}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.id} · {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
