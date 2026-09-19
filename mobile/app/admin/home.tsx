import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, ClipboardList, Scale, Megaphone, ShieldCheck, Phone, HandHelping } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Button, Card, StatusBadge, theme } from "@/components/ui";
import { STATUSES, type Complaint } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

const tone: Record<string, { bg: string; text: string }> = {
  "Under Review": { bg: theme.colors.reviewSoft, text: theme.colors.review },
  "In Progress": { bg: theme.colors.progressSoft, text: theme.colors.progress },
  Completed: { bg: theme.colors.completedSoft, text: theme.colors.completed },
  Rejected: { bg: theme.colors.rejectedSoft, text: theme.colors.rejected },
};

function AdminRecentComplaintRow({ complaint, onPress }: { complaint: Complaint; onPress: () => void }) {
  const { title, body } = useTranslatedComplaint(complaint);
  return (
    <TouchableOpacity
      style={styles.recentRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {title || body}
        </Text>
        <Text style={styles.recentSub}>
          {complaint.citizenName} · {new Date(complaint.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <StatusBadge status={complaint.status} />
    </TouchableOpacity>
  );
}

export default function AdminHomeScreen() {
  const { db, admin } = useStore();
  const { t } = useLanguage();
  const router = useRouter();

  const getStatusLabel = (s: string) => {
    if (s === "Under Review") return t("status.review");
    if (s === "In Progress") return t("status.progress");
    if (s === "Completed") return t("status.resolved");
    if (s === "Rejected") return t("status.rejected");
    return s;
  };

  const counts = STATUSES.map((s) => ({
    status: s,
    n: db.complaints.filter((c) => c.status === s).length,
  }));
  const recent = [...db.complaints].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);
  const pendingCount = db.complaints.filter((c) => c.status !== "Completed" && c.status !== "Rejected").length;

  const officeText = admin?.office || admin?.officeOrDepartment || t("admin.office_fallback");
  const subtitleText = `${officeText} · ${db.complaints.length} ${t("admin.total_complaints", { count: db.complaints.length })}`;

  const navTiles = [
    {
      to: "/admin/complaints",
      label: t("admin.nav.complaints"),
      hint: `${pendingCount} ${t("admin.nav.complaints_hint", { count: pendingCount })}`,
      icon: ClipboardList,
    },
    {
      to: "/admin/services",
      label: t("admin.services_title") || "Service Requests",
      hint: `${db.services.length} Requests`,
      icon: HandHelping,
    },
    {
      to: "/admin/rules",
      label: t("admin.nav.rules"),
      hint: `${db.rules.length} ${t("admin.nav.rules_hint", { count: db.rules.length })}`,
      icon: Scale,
    },
    {
      to: "/admin/announcements",
      label: t("admin.nav.notices"),
      hint: `${db.announcements.length} ${t("admin.nav.notices_hint", { count: db.announcements.length })}`,
      icon: Megaphone,
    },
    {
      to: "/admin/contacts",
      label: t("dash.hub.contacts"),
      hint: `${db.contacts.length} Contacts`,
      icon: Phone,
    },
    {
      to: "/admin/profile",
      label: t("admin.nav.profile"),
      hint: t("admin.nav.profile_hint"),
      icon: ShieldCheck,
    },
  ];

  return (
    <Shell
      portal="admin"
      title={t("admin.dash_title")}
      subtitle={subtitleText}
    >
      {/* Metric Counters */}
      <View style={styles.grid}>
        {counts.map((c) => {
          const tColor = tone[c.status] ?? { bg: theme.colors.muted, text: theme.colors.foreground };
          return (
            <Card key={c.status} elevated style={[styles.statCard, { backgroundColor: tColor.bg }]}>
              <Text style={[styles.statNum, { color: tColor.text }]}>{c.n}</Text>
              <Text style={[styles.statStatus, { color: tColor.text }]}>{getStatusLabel(c.status)}</Text>
            </Card>
          );
        })}
      </View>

      {/* Quick Action Navigation Grid (Matches Citizen Navigation Style) */}
      <View style={[styles.grid, { marginTop: 16 }]}>
        {navTiles.map((tile) => {
          const IconComp = tile.icon;
          return (
            <TouchableOpacity
              key={tile.to}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() => router.push(tile.to as any)}
            >
              <View style={styles.tileIconBox}>
                <IconComp size={24} color={theme.colors.admin} />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileHint}>{tile.hint}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Latest Grievances Card */}
      <Card elevated style={{ marginTop: 16 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>{t("admin.latest_complaints")}</Text>
          <Button
            variant="admin"
            icon={<ArrowRight size={16} color={theme.colors.adminForeground} />}
            onClick={() => router.push("/admin/complaints" as any)}
          >
            {t("admin.review_all")}
          </Button>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          {recent.length === 0 ? (
            <Text style={{ fontSize: 14, color: theme.colors.mutedForeground, paddingVertical: 8 }}>
              {t("admin.no_complaints_yet")}
            </Text>
          ) : (
            recent.map((c) => (
              <AdminRecentComplaintRow
                key={c.id}
                complaint={c}
                onPress={() => router.push(`/admin/complaints/${c.id}` as any)}
              />
            ))
          )}
        </View>
      </Card>
    </Shell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  statCard: {
    width: "48%",
    padding: 16,
  },
  statNum: {
    fontSize: 32,
    fontWeight: "900",
  },
  statStatus: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  tile: {
    width: "48%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: theme.colors.adminSoft,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginBottom: 2,
  },
  tileHint: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  recentSub: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
});
