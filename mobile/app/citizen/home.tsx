import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Mic, ClipboardList, Scale, Megaphone, HandHelping, Phone, User } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Card, StatusBadge, theme } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint, getTranslatedAnnouncement, getTranslatedCategory } from "@/lib/contentTranslation";
import type { Complaint } from "@/lib/mock-data";

function CitizenRecentComplaintRow({
  complaint,
  index,
}: {
  complaint: Complaint;
  index: number;
}) {
  const { t, language } = useLanguage();
  const { title, body, category } = useTranslatedComplaint(complaint);
  const refId = `#CMP-${(complaint.id || String(index + 1)).slice(-4).toUpperCase()}`;
  const dateStr = complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const isVoice = complaint.mode === "voice" || Boolean(complaint.voice_recording_url);
  const textSummary = title || body || (isVoice ? t("voiceRecordingSubmitted") : "Complaint registered");
  const catLabel = category || getTranslatedCategory((complaint as any).category || "General", language as any);

  return (
    <View style={[styles.complaintRow, index > 0 && styles.complaintRowBorder]}>
      <View style={styles.complaintMetaRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={styles.complaintRef}>{refId}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{catLabel}</Text>
          </View>
        </View>
        <StatusBadge status={complaint.status} />
      </View>
      <Text style={styles.complaintSummary} numberOfLines={1}>
        {textSummary}
      </Text>
      <Text style={styles.complaintDate}>{dateStr}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { db, citizen } = useStore();
  const { t, language } = useLanguage();
  const router = useRouter();

  const tiles = [
    {
      to: "/citizen/complaint/new",
      label: t("dash.btn.record"),
      hint: t("dash.btn.record_desc"),
      icon: Mic,
      color: theme.colors.primary,
      bg: theme.colors.primarySoft,
    },
    {
      to: "/citizen/complaints",
      label: t("dash.btn.track"),
      hint: t("dash.btn.track_desc"),
      icon: ClipboardList,
      color: theme.colors.review,
      bg: theme.colors.reviewSoft,
    },
    {
      to: "/citizen/rulebook",
      label: t("dash.info.rules"),
      hint: t("dash.info.rules_desc"),
      icon: Scale,
      color: theme.colors.progress,
      bg: theme.colors.progressSoft,
    },
    {
      to: "/citizen/services",
      label: t("dash.btn.services"),
      hint: t("dash.btn.services_desc"),
      icon: HandHelping,
      color: theme.colors.secondary,
      bg: theme.colors.secondarySoft,
    },
    {
      to: "/citizen/contacts",
      label: t("dash.hub.contacts"),
      hint: t("dash.hub.contacts_desc"),
      icon: Phone,
      color: theme.colors.completed,
      bg: theme.colors.completedSoft,
    },
    {
      to: "/citizen/profile",
      label: t("nav.profile"),
      hint: t("profile.screen_subtitle"),
      icon: User,
      color: theme.colors.primary,
      bg: theme.colors.primarySoft,
    },
  ];

  const greeting = citizen ? citizen.name : t("dash.welcome");
  const rawWard = citizen?.ward || "1";
  const cleanWard = String(rawWard).replace(/^(Ward|वार्ड|வார்டு)\s*/i, "").trim() || "1";
  const wardSubtitle = t("dash.tagline", { ward: cleanWard });

  const recentComplaints = (db.complaints || [])
    .filter((c) => !citizen || c.citizenId === citizen.id || c.citizenPhone === citizen.phone)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <Shell
      portal="citizen"
      title={greeting}
      subtitle={wardSubtitle}
    >
      <View style={styles.grid}>
        {tiles.map((tItem) => {
          const IconComp = tItem.icon;
          return (
            <TouchableOpacity
              key={tItem.to}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() => router.push(tItem.to as any)}
            >
              <View style={[styles.tileIconBox, { backgroundColor: tItem.bg }]}>
                <IconComp size={26} color={tItem.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tileLabel}>{tItem.label}</Text>
                <Text style={styles.tileHint}>{tItem.hint}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Recent Submissions Card */}
      {recentComplaints.length > 0 && (
        <Card elevated style={{ marginTop: 20 }}>
          <View style={styles.recentSubHeader}>
            <Text style={styles.recentSubTitle}>{t("dash.recent_submissions")}</Text>
            <TouchableOpacity onPress={() => router.push("/citizen/complaints" as any)}>
              <Text style={styles.trackLink}>{t("dash.btn.track")} →</Text>
            </TouchableOpacity>
          </View>
          <View>
            {recentComplaints.map((c, idx) => (
              <CitizenRecentComplaintRow key={c.id || idx} complaint={c} index={idx} />
            ))}
          </View>
        </Card>
      )}

      {/* Announcements Section */}
      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Megaphone size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>{t("dash.announcements")}</Text>
        </View>

        {db.announcements.length === 0 ? (
          <Card style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24 }}>
            <Megaphone size={28} color={theme.colors.mutedForeground} style={{ opacity: 0.4, marginBottom: 8 }} />
            <Text style={{ fontWeight: "700", color: theme.colors.mutedForeground, fontSize: 14 }}>
              {t("home.noAnnouncements")}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.mutedForeground, marginTop: 4, textAlign: "center" }}>
              {t("citizen.no_announcements_hint")}
            </Text>
          </Card>
        ) : (
          db.announcements.map((a) => {
            const transAnn = getTranslatedAnnouncement(a, language as any);
            return (
              <Card key={a.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{transAnn.title}</Text>
                <Text style={styles.announcementBody}>{transAnn.body}</Text>
                <Text style={styles.announcementDate}>
                  {new Date(a.date).toLocaleDateString()}
                </Text>
              </Card>
            );
          })
        )}
      </View>
    </Shell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  tile: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  tileIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  tileHint: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  announcementCard: {
    marginBottom: 10,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    lineHeight: 18,
    marginBottom: 6,
  },
  announcementDate: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
  },
  recentSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 8,
  },
  recentSubTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trackLink: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  complaintRow: {
    paddingVertical: 10,
  },
  complaintRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  complaintMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  complaintRef: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  categoryBadge: {
    backgroundColor: theme.colors.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  complaintSummary: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 4,
  },
  complaintDate: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
});
