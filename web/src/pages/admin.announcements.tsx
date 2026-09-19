import { useState } from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, useToast } from "@/components/ui";
import type { Announcement } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedAnnouncement } from "@/lib/contentTranslation";

export default function ManageAnnouncements() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        title: draft.title.trim().length < 3 ? "Enter a short headline." : "",
        body: draft.body.trim().length < 10 ? "Add at least 10 characters of detail." : "",
      }
    : { title: "", body: "" };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!draft || !valid) return;
    setLoading(true);
    setError("");
    try {
      await api.saveAnnouncement(draft);
      toast(t("admin.notice_published"));
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
      title={t("admin.announcements_title")}
      subtitle={t("admin.announcements_subtitle")}
      right={
        <Button
          variant="admin"
          icon={<Plus className="size-5" />}
          onClick={() => setDraft({ id: "", title: "", body: "", date: "" })}
        >
          <span className="hidden sm:inline">{t("admin.new_notice")}</span>
        </Button>
      }
    >
      {db.announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-8" />}
          title={t("admin.no_announcements_title")}
          description={t("admin.no_announcements_desc")}
          action={
            <Button
              variant="admin"
              onClick={() => setDraft({ id: "", title: "", body: "", date: "" })}
            >
              {t("admin.add_announcement")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {db.announcements.map((a) => {
            const trans = getTranslatedAnnouncement(a, language as any);
            return (
              <Card key={a.id} elevated>
                <h2 className="text-lg font-bold text-foreground">{trans.title}</h2>
                <p className="mt-1 text-base text-muted-foreground">{trans.body}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(a.date).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" icon={<Pencil className="size-5" />} onClick={() => setDraft(a)}>
                    {t("action.edit")}
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 className="size-5" />}
                    onClick={async () => {
                      try {
                        await api.deleteAnnouncement(a.id);
                        toast(t("admin.notice_removed"));
                      } catch (err: any) {
                        toast(err.message || t("admin.notice_delete_failed"));
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
        title={draft?.id ? t("admin.edit_notice") : t("admin.new_notice_modal")}
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
              label={t("admin.headline_label")}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              error={errors.title}
            />
            <TextArea
              label={t("admin.details_label")}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              {draft.id ? t("admin.update_notice_btn") : t("admin.publish_notice_btn")}
            </Button>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
