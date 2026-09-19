import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Inbox, ChevronRight } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState, StatusBadge } from "@/components/ui";
import { STATUSES, type Status } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/complaints/")({
  head: () => ({
    meta: [
      { title: "Complaints Review — GramVoice Admin" },
      { name: "description", content: "Filter and review every complaint raised by citizens." },
      { property: "og:title", content: "Complaints Review — GramVoice Admin" },
      {
        property: "og:description",
        content: "Filter and review every complaint raised by citizens.",
      },
    ],
  }),
  component: ComplaintsReview,
});

function ComplaintsReview() {
  const { db } = useStore();
  const [filter, setFilter] = useState<Status | "All">("All");

  const list = db.complaints
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Shell portal="admin" title="Complaints review" subtitle="Filter by status and open any case.">
      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "min-h-12 rounded-xl border-2 px-4 text-base font-bold transition-colors",
              filter === s
                ? "border-admin bg-admin text-admin-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {s}
            <span className="ml-2 opacity-75">
              {s === "All" ? db.complaints.length : db.complaints.filter((c) => c.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-8" />}
          title="Nothing in this filter"
          description="There are no complaints with this status right now."
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Link key={c.id} to="/admin/complaints/$id" params={{ id: c.id }} className="block">
              <Card elevated className="flex items-center gap-4 transition-colors hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {c.id} · {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-bold">{c.citizenName}</p>
                  <p className="truncate text-base text-muted-foreground">{c.body}</p>
                </div>
                <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
