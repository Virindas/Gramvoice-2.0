import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Inbox, Mic, Keyboard } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/complaints")({
  head: () => ({
    meta: [
      { title: "Track Your Complaints — GramVoice" },
      { name: "description", content: "Follow every complaint you raised, from review to closure." },
      { property: "og:title", content: "Track Your Complaints — GramVoice" },
      {
        property: "og:description",
        content: "Follow every complaint you raised, from review to closure.",
      },
    ],
  }),
  component: TrackComplaints,
});

function TrackComplaints() {
  const { citizen, db } = useStore();
  const [open, setOpen] = useState<string | null>(null);

  const mine = db.complaints
    .filter((c) => c.citizenId === citizen?.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Shell
      portal="citizen"
      title="Track your complaints"
      subtitle="Newest first. Tap a complaint to see the full story."
    >
      {mine.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-8" />}
          title="No complaints yet"
          description="When you raise a complaint it will appear here with its live status."
          action={
            <Link to="/citizen/complaint/new">
              <Button>Register a complaint</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {mine.map((c) => {
            const expanded = open === c.id;
            return (
              <Card key={c.id} elevated className="p-0">
                <button
                  onClick={() => setOpen(expanded ? null : c.id)}
                  className="flex w-full items-start gap-3 p-5 text-left"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    {c.mode === "voice" ? <Mic className="size-5" /> : <Keyboard className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="text-sm font-semibold text-muted-foreground">
                        {c.id} · {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="mt-2 block text-lg font-bold">{c.title}</span>
                  </span>
                  <ChevronDown
                    className={cn("size-6 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
                  />
                </button>

                {expanded && (
                  <div className="space-y-5 border-t border-border px-5 py-5">
                    <p className="text-base text-foreground">{c.body}</p>

                    {c.reply && (
                      <div className="rounded-xl bg-secondary-soft/60 p-4">
                        <p className="text-sm font-bold text-secondary-foreground">
                          Reply from the Panchayat
                        </p>
                        <p className="mt-1 text-base">{c.reply}</p>
                      </div>
                    )}

                    <div>
                      <p className="mb-3 text-sm font-bold text-muted-foreground uppercase">
                        Status timeline
                      </p>
                      <ol className="space-y-4 border-l-2 border-border pl-5">
                        {c.timeline.map((t, i) => (
                          <li key={i} className="relative">
                            <span className="absolute top-1.5 -left-[27px] size-3 rounded-full bg-primary ring-4 ring-background" />
                            <StatusBadge status={t.status} />
                            <p className="mt-1 text-sm text-muted-foreground">
                              {new Date(t.at).toLocaleString()}
                              {t.note ? ` · ${t.note}` : ""}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
