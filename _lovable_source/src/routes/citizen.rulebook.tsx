import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/rulebook")({
  head: () => ({
    meta: [
      { title: "Village Rule Book — GramVoice" },
      { name: "description", content: "Panchayat rules on water, waste, meetings and common land." },
      { property: "og:title", content: "Village Rule Book — GramVoice" },
      {
        property: "og:description",
        content: "Panchayat rules on water, waste, meetings and common land.",
      },
    ],
  }),
  component: RuleBook,
});

function RuleBook() {
  const { db } = useStore();
  const sections = [...new Set(db.rules.map((r) => r.section))];

  return (
    <Shell portal="citizen" title="Rule book" subtitle="The village rules, in plain language.">
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-8" />}
          title="No rules published yet"
          description="Once your Panchayat publishes rules, you will be able to read them here."
        />
      ) : (
        <div className="space-y-7">
          {sections.map((s) => (
            <section key={s}>
              <h2 className="mb-3 text-sm font-black tracking-widest text-primary uppercase">{s}</h2>
              <div className="space-y-3">
                {db.rules
                  .filter((r) => r.section === s)
                  .map((r) => (
                    <Card key={r.id} elevated>
                      <h3 className="text-lg font-bold">{r.title}</h3>
                      <p className="mt-1 text-base text-muted-foreground">{r.body}</p>
                    </Card>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Shell>
  );
}
