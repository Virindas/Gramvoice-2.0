import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, ListChecks, BookOpen, HandHelping, Megaphone } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/home")({
  head: () => ({
    meta: [
      { title: "Citizen Home — GramVoice" },
      {
        name: "description",
        content: "Register a complaint, track progress, read village rules and request services.",
      },
      { property: "og:title", content: "Citizen Home — GramVoice" },
      {
        property: "og:description",
        content: "Register a complaint, track progress, read village rules and request services.",
      },
    ],
  }),
  component: CitizenHome,
});

const tiles = [
  {
    to: "/citizen/complaint/new",
    label: "Register Complaint",
    hint: "Speak or type your issue",
    icon: FilePlus2,
    tone: "bg-primary text-primary-foreground",
  },
  {
    to: "/citizen/complaints",
    label: "Track Complaint",
    hint: "See the latest status",
    icon: ListChecks,
    tone: "bg-secondary text-secondary-foreground",
  },
  {
    to: "/citizen/rulebook",
    label: "Rule Book",
    hint: "Village rules in plain words",
    icon: BookOpen,
    tone: "bg-review-soft text-review",
  },
  {
    to: "/citizen/services",
    label: "Request Service",
    hint: "Certificates, tankers & more",
    icon: HandHelping,
    tone: "bg-completed-soft text-completed",
  },
] as const;

function CitizenHome() {
  const { citizen, db } = useStore();
  const mine = db.complaints.filter((c) => c.citizenId === citizen?.id);
  const latest = mine[0];

  return (
    <Shell
      portal="citizen"
      title={`Vanakkam, ${citizen?.name.split(" ")[0] ?? "friend"}`}
      subtitle="What would you like to do today?"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span className={`mb-3 flex size-14 items-center justify-center rounded-xl ${t.tone}`}>
              <t.icon className="size-7" />
            </span>
            <span className="block text-lg font-bold">{t.label}</span>
            <span className="block text-base text-muted-foreground">{t.hint}</span>
          </Link>
        ))}
      </div>

      {latest && (
        <Card elevated className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-muted-foreground">Your latest complaint</h2>
            <StatusBadge status={latest.status} />
          </div>
          <p className="text-lg font-semibold">{latest.title}</p>
          <Link to="/citizen/complaints" className="mt-2 inline-block font-bold text-primary underline">
            View all complaints
          </Link>
        </Card>
      )}

      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Megaphone className="size-5 text-secondary" /> Announcements
        </h2>
        <div className="space-y-3">
          {db.announcements.length === 0 && (
            <Card className="text-base text-muted-foreground">No announcements right now.</Card>
          )}
          {db.announcements.map((a) => (
            <Card key={a.id} className="border-secondary/30 bg-secondary-soft/50">
              <p className="font-bold">{a.title}</p>
              <p className="mt-1 text-base text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(a.date).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}
