import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ChevronDown, Inbox, Mic, Keyboard } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Button, Card, EmptyState, StatusBadge, theme } from "@/components/ui";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint, getTranslatedTimelineNote } from "@/lib/contentTranslation";
import type { Complaint } from "@/lib/mock-data";

function CitizenComplaintCard({
  complaint,
  expanded,
  onToggle,
}: {
  complaint: Complaint;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t, language } = useLanguage();
  const { title, body, reply, isTranslated } = useTranslatedComplaint(complaint);
  const isVoice = complaint.mode === "voice" || Boolean(complaint.voice_recording_url);
  const IconComp = isVoice ? Mic : Keyboard;

  const displayTitle = title || complaint.title || (isVoice ? t("voiceRecordingSubmitted") : complaint.body);
  const displayBody = body || complaint.complaint_text || complaint.body || (isVoice ? t("voiceRecordingSubmitted") : "");

  return (
    <Card elevated style={{ padding: 0 }}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          <IconComp size={20} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <StatusBadge status={complaint.status} />
            <Text style={styles.idText}>
              #{complaint.id} · {new Date(complaint.createdAt).toLocaleDateString()}
            </Text>
            {isTranslated && language !== "en" && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{t("machineTranslatedTag") || "Translated"}</Text>
              </View>
            )}
          </View>
          <Text style={styles.titleText}>{displayTitle}</Text>
        </View>
        <ChevronDown
          size={20}
          color={theme.colors.mutedForeground}
          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {isVoice ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.voiceTitle}>{t("track.voice_submission.title")}</Text>
              <AudioPlayer
                uri={complaint.voice_recording_url || `/api/complaints/${complaint.id}/audio`}
                title={t("citizen.original_voice_rec")}
              />
            </View>
          ) : null}

          <View style={{ marginBottom: 8 }}>
            <Text style={styles.voiceTitle}>{t("track.text_submission.title")}</Text>
            <Text style={styles.bodyText}>{displayBody}</Text>
          </View>

          {(reply || complaint.reply) ? (
            <View style={styles.replyBox}>
              <Text style={styles.replyTitle}>{t("track.reply_from_panchayat")}</Text>
              <Text style={styles.replyText}>{reply || complaint.reply}</Text>
            </View>
          ) : null}

          {complaint.timeline && complaint.timeline.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.timelineHeader}>{t("track.timeline.title")}</Text>
              <View style={{ gap: 12, marginTop: 8 }}>
                {complaint.timeline.map((item, i) => (
                  <View key={i} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View>
                      <StatusBadge status={item.status} />
                      <Text style={styles.timelineDate}>
                        {new Date(item.at).toLocaleString()}
                        {item.note ? ` · ${getTranslatedTimelineNote(item.note, (language as any) || "en")}` : ""}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

export default function ComplaintsScreen() {
  const { db, citizen } = useStore();
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  const mine = citizen
    ? db.complaints.filter((c) => c.citizenId === citizen.id)
    : db.complaints;

  return (
    <Shell
      portal="citizen"
      title={t("track.title")}
      subtitle={t("track.subtitle")}
    >
      {mine.length === 0 ? (
        <EmptyState
          icon={<Inbox size={40} color={theme.colors.mutedForeground} />}
          title={t("track.empty.title")}
          description={t("track.empty.desc")}
          action={
            <Button onClick={() => router.push("/citizen/complaint/new" as any)}>
              {t("track.empty.btn")}
            </Button>
          }
        />
      ) : (
        <View style={{ gap: 12 }}>
          {mine.map((c) => (
            <CitizenComplaintCard
              key={c.id}
              complaint={c}
              expanded={open === c.id}
              onToggle={() => setOpen(open === c.id ? null : c.id)}
            />
          ))}
        </View>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  idText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  tagBadge: {
    backgroundColor: theme.colors.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontStyle: "italic",
    color: theme.colors.mutedForeground,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 6,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 16,
  },
  voiceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 15,
    color: theme.colors.foreground,
    lineHeight: 22,
  },
  replyBox: {
    backgroundColor: theme.colors.secondarySoft,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  replyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.secondaryForeground,
  },
  replyText: {
    fontSize: 14,
    color: theme.colors.foreground,
    marginTop: 4,
  },
  timelineHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
});
