import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Search, PhoneCall } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState, Input } from "@/components/ui";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/contacts")({
  head: () => ({
    meta: [
      { title: "Village Contacts — GramVoice" },
      { name: "description", content: "Phone numbers for Panchayat officials, health and emergency." },
      { property: "og:title", content: "Village Contacts — GramVoice" },
      {
        property: "og:description",
        content: "Phone numbers for Panchayat officials, health and emergency.",
      },
    ],
  }),
  component: Contacts,
});

function Contacts() {
  const { db } = useStore();
  const [q, setQ] = useState("");
  const list = db.contacts.filter((c) =>
    `${c.name} ${c.role} ${c.phone}`.toLowerCase().includes(q.toLowerCase().trim()),
  );

  return (
    <Shell portal="citizen" title="Important contacts" subtitle="Call the right person directly.">
      <div className="mb-5">
        <Input
          label="Search contacts"
          value={q}
          placeholder="Name, role or number"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Search className="size-8" />}
          title="No contacts found"
          description="Try a different name or role, for example “health” or “secretary”."
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Card key={c.id} elevated className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Phone className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold">{c.name}</p>
                <p className="text-base text-muted-foreground">{c.role}</p>
              </div>
              <a
                href={`tel:${c.phone}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground"
              >
                <PhoneCall className="size-5" />
                <span className="hidden sm:inline">{c.phone}</span>
                <span className="sm:hidden">Call</span>
              </a>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
