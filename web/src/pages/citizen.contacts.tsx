import { useState } from "react";
import { Phone, Search, PhoneCall } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState, Input } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedContactRole } from "@/lib/contentTranslation";

export default function Contacts() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const [q, setQ] = useState("");
  const currentLang = (language as "en" | "hi" | "ta") || "en";

  const list = db.contacts.filter((c) =>
    `${c.name} ${c.role} ${c.phone}`.toLowerCase().includes(q.toLowerCase().trim()),
  );

  return (
    <Shell portal="citizen" title={t("contacts.screen_title")} subtitle={t("contacts.screen_subtitle")}>
      <div className="mb-5">
        <Input
          label={t("contacts.search_label")}
          value={q}
          placeholder={t("contacts.search_placeholder")}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Search className="size-8" />}
          title={t("contacts.empty_title")}
          description={t("contacts.empty_desc")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const transRole = getTranslatedContactRole(c.role, currentLang);
            return (
              <Card key={c.id} elevated className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Phone className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{c.name}</p>
                  <p className="text-base text-muted-foreground">{transRole || c.role}</p>
                </div>
                <a
                  href={`tel:${c.phone}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground"
                >
                  <PhoneCall className="size-5" />
                  <span className="hidden sm:inline">{c.phone}</span>
                  <span className="sm:hidden">{t("contacts.call_btn")}</span>
                </a>
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
