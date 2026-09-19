import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BookOpen } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Card, EmptyState, theme } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedRule, getTranslatedCategory } from "@/lib/contentTranslation";

export default function RuleBookScreen() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const currentLang = (language as "en" | "hi" | "ta") || "en";
  const sections = Array.from(new Set(db.rules.map((r) => r.section)));

  return (
    <Shell portal="citizen" title={t("rules.screen_title")} subtitle={t("rules.screen_subtitle")}>
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} color={theme.colors.mutedForeground} />}
          title={t("rules.empty_title")}
          description={t("rules.empty_desc")}
        />
      ) : (
        <View style={{ gap: 20 }}>
          {sections.map((s) => {
            const transSection = getTranslatedCategory(s, currentLang);
            return (
              <View key={s}>
                <Text style={styles.sectionHeader}>{transSection || s}</Text>
                <View style={{ gap: 10, marginTop: 8 }}>
                  {db.rules
                    .filter((r) => r.section === s)
                    .map((r) => {
                      const transRule = getTranslatedRule(r, currentLang);
                      return (
                        <Card key={r.id} elevated>
                          <Text style={styles.ruleTitle}>{transRule.title}</Text>
                          <Text style={styles.ruleBody}>{transRule.body}</Text>
                        </Card>
                      );
                    })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ruleTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  ruleBody: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
    marginTop: 4,
    lineHeight: 22,
  },
});
