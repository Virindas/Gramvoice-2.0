import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Inbox, ChevronRight, Mic, Keyboard } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Card, EmptyState, StatusBadge, theme } from "@/components/ui";
import { STATUSES, type Status, type Complaint } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

function MobileAdminComplaintCard({ complaint, onPress }: { complaint: Complaint; onPress: () => void }) {
  const { t } = useLanguage();
  const { title, body } = useTranslatedComplaint(complaint);
  const isVoice = complaint.mode === "voice" || Boolean(complaint.voice_recording_url);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Card elevated style={styles.cardRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={complaint.status} />
            <Text style={styles.idText}>
              #{complaint.id} · {new Date(complaint.createdAt).toLocaleDateString()}
            </Text>
            {isVoice ? (
              <View style={styles.modeBadgeVoice}>
                <Mic size={11} color={theme.colors.primary} />
                <Text style={styles.modeTextVoice}>{t("admin.mode_voice")}</Text>
              </View>
            ) : (
              <View style={styles.modeBadgeText}>
                <Keyboard size={11} color={theme.colors.mutedForeground} />
                <Text style={styles.modeText}>{t("admin.mode_text")}</Text>
              </View>
            )}
          </View>
          <Text style={styles.citizenName}>{complaint.citizenName}</Text>
          <Text style={styles.bodyPreview} numberOfLines={1}>
            {body || title}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.colors.mutedForeground} />
      </Card>
    </TouchableOpacity>
  );
}

export default function ComplaintsReviewScreen() {
  const { db } = useStore();
  const { t } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<Status | "All">("All");

  const getStatusLabel = (s: string) => {
    if (s === "All") return t("admin.filter_all");
    if (s === "Under Review") return t("status.review");
    if (s === "In Progress") return t("status.progress");
    if (s === "Completed") return t("status.resolved");
    if (s === "Rejected") return t("status.rejected");
    return s;
  };

  const list = db.complaints
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Shell portal="admin" title={t("admin.complaints_title")} subtitle={t("admin.complaints_subtitle")}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(["All", ...STATUSES] as const).map((s) => {
          const active = filter === s;
          const count = s === "All" ? db.complaints.length : db.complaints.filter((c) => c.status === s).length;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.filterPill, active && styles.activeFilterPill]}
              onPress={() => setFilter(s)}
            >
              <Text style={[styles.filterText, active && styles.activeFilterText]}>
                {getStatusLabel(s)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox size={32} color={theme.colors.mutedForeground} />}
          title={t("admin.empty_filter_title")}
          description={t("admin.empty_filter_desc")}
        />
      ) : (
        <View style={{ gap: 10, marginTop: 12 }}>
          {list.map((c) => (
            <MobileAdminComplaintCard
              key={c.id}
              complaint={c}
              onPress={() => router.push(`/admin/complaints/${c.id}` as any)}
            />
          ))}
        </View>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.admin,
    borderColor: theme.colors.admin,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  activeFilterText: {
    color: theme.colors.adminForeground,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  citizenName: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 6,
  },
  bodyPreview: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  modeBadgeVoice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeTextVoice: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  modeBadgeText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
});
