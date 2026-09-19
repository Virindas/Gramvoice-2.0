import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Mic, Keyboard, Save, Inbox } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, LoadingSpinner, Select, StatusBadge, TextArea, theme, useToast } from "@/components/ui";
import { STATUSES, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, hydrated } = useStore();
  const { t } = useLanguage();
  const api = useApi();
  const router = useRouter();
  const toast = useToast();

  const complaint = db.complaints.find((c) => c.id === id);

  const [status, setStatus] = useState<Status>(complaint?.status ?? "Under Review");
  const [reply, setReply] = useState(complaint?.reply ?? "");
  const [loading, setLoading] = useState(false);
  const { title: transTitle, body: transBody } = useTranslatedComplaint(complaint);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setReply(complaint.reply ?? "");
    }
  }, [complaint?.id, complaint?.status, complaint?.reply]);

  if (!complaint) {
    if (!hydrated) {
      return (
        <Shell portal="admin" title="Loading complaint...">
          <LoadingSpinner label="Loading complaint..." />
        </Shell>
      );
    }
    return (
      <Shell portal="admin" title={t("admin.not_found_title")}>
        <EmptyState
          icon={<Inbox size={32} color={theme.colors.mutedForeground} />}
          title={t("admin.not_found_title")}
          description={t("admin.not_found_desc")}
          action={
            <Button variant="admin" onClick={() => router.push("/admin/complaints" as any)}>
              {t("admin.back_to_complaints")}
            </Button>
          }
        />
      </Shell>
    );
  }

  async function save() {
    setLoading(true);
    try {
      await api.updateComplaint(complaint!.id, { status, reply });
      toast(t("admin.complaint_updated"));
    } catch (err: any) {
      toast(err.message || t("admin.complaint_update_failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={t("admin.detail_title", { id: complaint.id })}
      subtitle={`${t("admin.submitted_by", { name: complaint.citizenName })} · ${new Date(complaint.createdAt).toLocaleDateString()}`}
      right={
        <TouchableOpacity onPress={() => router.push("/admin/complaints" as any)}>
          <ArrowLeft size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
      }
    >
      <View style={{ gap: 16 }}>
        <Card elevated style={{ gap: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.titleText}>{transTitle || complaint.title}</Text>
            <StatusBadge status={complaint.status} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {complaint.mode === "voice" ? (
              <Mic size={16} color={theme.colors.primary} />
            ) : (
              <Keyboard size={16} color={theme.colors.mutedForeground} />
            )}
            <Text style={styles.subInfo}>
              {complaint.mode === "voice" ? t("admin.recorded_via_voice") : t("admin.typed_manually")} · {t("admin.phone_prefix")}: {complaint.citizenPhone} · {t("admin.ward_prefix")}: {db.citizens.find((c) => c.id === complaint.citizenId)?.ward || (complaint as any).citizenId?.ward || "Ward 1"}
            </Text>
          </View>

          <Text style={styles.bodyText}>{transBody || complaint.body}</Text>

          {(complaint.voice_recording_url || complaint.mode === "voice") && (
            <View style={{ marginTop: 12 }}>
              <AudioPlayer
                uri={complaint.voice_recording_url || `/api/complaints/${complaint.id}/audio`}
                title={t("admin.original_voice_rec")}
              />
            </View>
          )}
        </Card>

        <Card elevated style={{ gap: 16 }}>
          <Text style={styles.sectionTitle}>{t("admin.response_action_title")}</Text>

          <Select
            label={t("admin.update_status_label")}
            value={status}
            onChange={(e: any) => setStatus(e.target.value as Status)}
            options={[...STATUSES]}
          />

          <TextArea
            label={t("admin.official_response_label")}
            value={reply}
            onChangeText={setReply}
            placeholder={t("admin.response_placeholder")}
            rows={4}
          />

          <Button
            variant="admin"
            loading={loading}
            icon={<Save size={20} color={theme.colors.adminForeground} />}
            onClick={save}
          >
            {t("admin.save_changes")}
          </Button>
        </Card>
      </View>
    </Shell>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
    flex: 1,
    marginRight: 8,
  },
  subInfo: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  bodyText: {
    fontSize: 15,
    color: theme.colors.foreground,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
});
