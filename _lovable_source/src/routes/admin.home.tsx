import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, Card, StatusBadge } from "@/components/ui";
import { STATUSES } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/home")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — GramVoice" },
      { name: "description", content: "Overview of citizen complaints by status." },
      { property: "og:title", content: "Admin Dashboard — GramVoice" },
      { property: "og:description", content: "Overview of citizen complaints by status." },
    ],
  }),
  component: AdminHome,
});

const tone: Record<string, string> = {
  "Under Review": "bg-review-soft text-review",
  "In Progress": "bg-progress-soft text-progress",
  Completed: "bg-completed-soft text-completed",
  Rejected: "bg-rejected-soft text-rejected",
};

function AdminHome() {
  const { db, admin } = useStore();
  const counts = STATUSES.map((s) => ({
    status: s,
    n: db.complaints.filter((c) => c.status === s).length,
  }));
  const recent = [...db.complaints]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 3);

  return (
    <Shell
      portal="admin"
      title="Dashboard"
      subtitle={`${admin?.office ?? "Panchayat office"} · ${db.complaints.length} complaints total`}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {counts.map((c) => (
          <Card key={c.status} elevated className={tone[c.status]}>
            <p className="text-4xl font-black">{c.n}</p>
            <p className="mt-1 text-base font-bold">{c.status}</p>
          </Card>
        ))}
      </div>

      <Card elevated className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Latest complaints</h2>
          <Link to="/admin/complaints">
            <Button variant="admin" icon={<ArrowRight className="size-5" />}>
              Review all
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((c) => (
            <Link
              key={c.id}
              to="/admin/complaints/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">
                  {c.citizenName} · {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          ))}
        </div>
      </Card>
    </Shell>
  );
}
