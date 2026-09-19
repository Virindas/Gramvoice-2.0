import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Plus, Pencil, Trash2, Scale } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, theme, useToast } from "@/components/ui";
import type { Rule } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedRule, getTranslatedCategory } from "@/lib/contentTranslation";

const blank = { id: "", section: "", title: "", body: "" };

export default function ManageRulesScreen() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        section: draft.section.trim().length < 2 ? "Enter a section, e.g. Water." : "",
        title: draft.title.trim().length < 3 ? "Enter a rule title." : "",
        body: draft.body.trim().length < 10 ? "Describe the rule in at least 10 characters." : "",
      }
    : { section: "", title: "", body: "" };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!draft || !valid) return;
    setLoading(true);
    setError("");
    try {
      await api.saveRule(draft);
      toast(t("admin.rule_saved"));
      setDraft(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={t("admin.rules_title")}
      subtitle={t("admin.rules_subtitle")}
      right={
        <Button variant="admin" icon={<Plus size={18} color={theme.colors.adminForeground} />} onClick={() => setDraft(blank)}>
          {t("admin.new_rule")}
        </Button>
      }
    >
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<Scale size={32} color={theme.colors.mutedForeground} />}
          title={t("admin.no_rules_title")}
          description={t("admin.no_rules_desc")}
          action={
            <Button variant="admin" onClick={() => setDraft(blank)}>
              {t("admin.add_rule")}
            </Button>
          }
        />
      ) : (
        <View style={{ gap: 12 }}>
          {db.rules.map((r) => {
            const trans = getTranslatedRule(r, language as any);
            const transSec = getTranslatedCategory(r.section, language as any);
            return (
              <Card key={r.id} elevated>
                <Text style={styles.sectionBadge}>{transSec || r.section}</Text>
                <Text style={styles.ruleTitle}>{trans.title}</Text>
                <Text style={styles.ruleBody}>{trans.body}</Text>
                <View style={styles.actionRow}>
                  <Button variant="outline" icon={<Pencil size={16} color={theme.colors.foreground} />} onClick={() => setDraft(r)}>
                    {t("action.edit")}
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 size={16} color={theme.colors.destructiveForeground} />}
                    onClick={async () => {
                      try {
                        await api.deleteRule(r.id);
                        toast(t("admin.rule_deleted"));
                      } catch (err: any) {
                        toast(err.message || t("admin.rule_delete_failed"));
                      }
                    }}
                  >
                    {t("action.delete")}
                  </Button>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("admin.edit_rule") : t("admin.new_rule")}
      >
        {draft ? (
          <View style={{ gap: 16 }}>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Input
              label={t("admin.rule_section")}
              value={draft.section}
              placeholder={t("admin.rule_section_placeholder")}
              onChangeText={(v: string) => setDraft({ ...draft, section: v })}
              error={errors.section}
            />
            <Input
              label={t("admin.rule_title_label")}
              value={draft.title}
              onChangeText={(v: string) => setDraft({ ...draft, title: v })}
              error={errors.title}
            />
            <TextArea
              label={t("admin.rule_text_label")}
              value={draft.body}
              onChangeText={(v: string) => setDraft({ ...draft, body: v })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              {draft.id ? t("admin.update_rule_btn") : t("admin.add_rule_btn")}
            </Button>
          </View>
        ) : null}
      </Modal>
    </Shell>
  );
}

const styles = StyleSheet.create({
  sectionBadge: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.colors.admin,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ruleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 2,
  },
  ruleBody: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});
