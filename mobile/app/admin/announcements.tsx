import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, TextArea, theme, useToast } from "@/components/ui";
import type { Announcement } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedAnnouncement } from "@/lib/contentTranslation";

export default function ManageAnnouncementsScreen() {
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
          icon={<Plus size={18} color={theme.colors.adminForeground} />}
          onClick={() => setDraft({ id: "", title: "", body: "", date: "" })}
        >
          {t("admin.new_notice")}
        </Button>
      }
    >
      {db.announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={32} color={theme.colors.mutedForeground} />}
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
        <View style={{ gap: 12 }}>
          {db.announcements.map((a) => {
            const trans = getTranslatedAnnouncement(a, language as any);
            return (
              <Card key={a.id} elevated>
                <Text style={styles.title}>{trans.title}</Text>
                <Text style={styles.body}>{trans.body}</Text>
                <Text style={styles.date}>{new Date(a.date).toLocaleDateString()}</Text>
                <View style={styles.actionRow}>
                  <Button variant="outline" icon={<Pencil size={16} color={theme.colors.foreground} />} onClick={() => setDraft(a)}>
                    {t("action.edit")}
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 size={16} color={theme.colors.destructiveForeground} />}
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
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? t("admin.edit_notice") : t("admin.new_notice_modal")}
      >
        {draft ? (
          <View style={{ gap: 16 }}>
            {error ? <Alert tone="error">{error}</Alert> : null}
            <Input
              label={t("admin.headline_label")}
              value={draft.title}
              onChangeText={(v: string) => setDraft({ ...draft, title: v })}
              error={errors.title}
            />
            <TextArea
              label={t("admin.details_label")}
              value={draft.body}
              onChangeText={(v: string) => setDraft({ ...draft, body: v })}
              error={errors.body}
            />
            <Button variant="admin" full loading={loading} disabled={!valid} onClick={save}>
              {draft.id ? t("admin.update_notice_btn") : t("admin.publish_notice_btn")}
            </Button>
          </View>
        ) : null}
      </Modal>
    </Shell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  body: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
});
