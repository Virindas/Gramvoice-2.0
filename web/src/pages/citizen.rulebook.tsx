import { BookOpen } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedRule, getTranslatedCategory } from "@/lib/contentTranslation";

export default function RuleBook() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const currentLang = (language as "en" | "hi" | "ta") || "en";
  const sections = [...new Set(db.rules.map((r) => r.section))];

  return (
    <Shell portal="citizen" title={t("rules.screen_title")} subtitle={t("rules.screen_subtitle")}>
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-8" />}
          title={t("rules.empty_title")}
          description={t("rules.empty_desc")}
        />
      ) : (
        <div className="space-y-7">
          {sections.map((s) => {
            const transSection = getTranslatedCategory(s, currentLang);
            return (
              <section key={s}>
                <h2 className="mb-3 text-sm font-black tracking-widest text-primary uppercase">
                  {transSection || s}
                </h2>
                <div className="space-y-3">
                  {db.rules
                    .filter((r) => r.section === s)
                    .map((r) => {
                      const transRule = getTranslatedRule(r, currentLang);
                      return (
                        <Card key={r.id} elevated>
                          <h3 className="text-lg font-bold text-foreground">{transRule.title}</h3>
                          <p className="mt-1 text-base text-muted-foreground leading-relaxed">{transRule.body}</p>
                        </Card>
                      );
                    })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
