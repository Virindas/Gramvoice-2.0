import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ShieldCheck, Users, Mic, ListChecks } from "lucide-react-native";
import { Brand } from "@/components/layout";
import { Button, LanguageSwitcher, theme } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStore } from "@/lib/store";

export default function LandingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { citizen, admin, hydrated } = useStore();
  const insets = useSafeAreaInsets();
  const rawTop = insets.top > 0 ? insets.top : (Platform.OS === "android" ? (StatusBar.currentHeight || 32) : 36);
  const topInset = Math.max(rawTop + 12, 44);

  React.useEffect(() => {
    if (hydrated) {
      if (citizen) {
        router.replace("/citizen/home" as any);
      } else if (admin) {
        router.replace("/admin/home" as any);
      }
    }
  }, [hydrated, citizen, admin, router]);

  const points = [
    { icon: Mic, title: t("landing.point1.title"), text: t("landing.point1.text") },
    { icon: ListChecks, title: t("landing.point2.title"), text: t("landing.point2.text") },
    { icon: ShieldCheck, title: t("landing.point3.title"), text: t("landing.point3.text") },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: topInset }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 + insets.bottom }}>
        <View style={styles.header}>
          <Brand />
          <LanguageSwitcher />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Users size={16} color={theme.colors.secondaryForeground} />
            <Text style={styles.badgeText}>{t("landing.badge")}</Text>
          </View>

          <Text style={styles.heroTitle}>
            {t("landing.title_part1")} <Text style={{ color: theme.colors.primary }}>{t("landing.title_part2")}</Text>
          </Text>

          <Text style={styles.heroDesc}>
            {t("landing.subtitle")}
          </Text>

          <View style={styles.btnContainer}>
            <Button
              full
              size="lg"
              icon={<Users size={20} color={theme.colors.primaryForeground} />}
              onClick={() => router.push("/citizen/login" as any)}
            >
              {t("landing.role.villager")}
            </Button>
            <View style={{ height: 12 }} />
            <Button
              full
              size="lg"
              variant="outline"
              icon={<ShieldCheck size={20} color={theme.colors.foreground} />}
              onClick={() => router.push("/admin/login" as any)}
            >
              {t("landing.role.admin")}
            </Button>
          </View>
        </View>

        <View style={styles.pointsSection}>
          {points.map((p) => {
            const IconComp = p.icon;
            return (
              <View key={p.title} style={styles.pointCard}>
                <View style={styles.pointIconBox}>
                  <IconComp size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.pointTitle}>{p.title}</Text>
                <Text style={styles.pointText}>{p.text}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.secondaryForeground,
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: theme.colors.foreground,
  },
  heroDesc: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  btnContainer: {
    width: "100%",
    marginTop: 24,
  },
  pointsSection: {
    marginTop: 20,
  },
  pointCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pointIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  pointText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
});
