import { useState } from "react";
import { Plus, Pencil, Trash2, Scale } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, useToast } from "@/components/ui";
import type { Rule } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedRule, getTranslatedCategory } from "@/lib/contentTranslation";

const blank = { id: "", section: "", title: "", body: "" };

export default function ManageRules() {
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
        <Button variant="admin" icon={<Plus className="size-5" />} onClick={() => setDraft(blank)}>
          <span className="hidden sm:inline">{t("admin.new_rule")}</span>
        </Button>
      }
    >
      {db.rules.length === 0 ? (
        <EmptyState
          icon={<Scale className="size-8" />}
          title={t("admin.no_rules_title")}
          description={t("admin.no_rules_desc")}
          action={
            <Button variant="admin" onClick={() => setDraft(blank)}>
              {t("admin.add_rule")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {db.rules.map((r) => {
            const trans = getTranslatedRule(r, language as any);
            const transSec = getTranslatedCategory(r.section, language as any);
            return (
            <Card key={r.id} elevated>
              <p className="text-xs font-black tracking-widest text-admin uppercase">{transSec || r.section}</p>
              <h2 className="mt-1 text-lg font-bold">{trans.title}</h2>
              <p className="mt-1 text-base text-muted-foreground">{trans.body}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" icon={<Pencil className="size-5" />} onClick={() => setDraft(r)}>
                  {t("action.edit")}
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="size-5" />}
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
              </div>
            </Card>
          );
        })}
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("admin.edit_rule") : t("admin.new_rule")}
      >
        {draft && (
          <div className="space-y-5">
            {error && (
              <div className="space-y-2">
                <Alert tone="error">{error}</Alert>
                {error.includes("Administrators only") && (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => window.location.href = "/admin/login"}>
                      Sign in as Administrator →
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Input
              label={t("admin.rule_section")}
              value={draft.section}
              placeholder={t("admin.rule_section_placeholder")}
              onChange={(e) => setDraft({ ...draft, section: e.target.value })}
              error={errors.section}
            />
            <Input
              label={t("admin.rule_title_label")}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              error={errors.title}
            />
            <TextArea
              label={t("admin.rule_text_label")}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              {draft.id ? t("admin.update_rule_btn") : t("admin.add_rule_btn")}
            </Button>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
