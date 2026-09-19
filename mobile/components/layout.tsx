import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import {
  Home,
  FilePlus2,
  ListChecks,
  BookOpen,
  Phone,
  HandHelping,
  MessageCircle,
  User,
  LayoutDashboard,
  ClipboardList,
  Scale,
  Megaphone,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react-native";
import { theme, LoadingSpinner, LanguageSwitcher } from "./ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export function Brand({ tone = "primary" }: { tone?: "primary" | "admin" }) {
  const isAdmin = tone === "admin";
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={[
          styles.brandBox,
          { backgroundColor: isAdmin ? theme.colors.admin : theme.colors.primary },
        ]}
      >
        <Text style={styles.brandLetter}>G</Text>
      </View>
      <Text style={styles.brandTitle}>
        Gram
        <Text style={{ color: isAdmin ? theme.colors.admin : theme.colors.primary }}>Voice</Text>
      </Text>
    </View>
  );
}

const citizenNav = [
  { to: "/citizen/home", label: "Home", icon: Home },
  { to: "/citizen/complaint/new", label: "Register", icon: FilePlus2 },
  { to: "/citizen/complaints", label: "Track", icon: ListChecks },
  { to: "/citizen/services", label: "Services", icon: HandHelping },
];

const adminNav = [
  { to: "/admin/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/complaints", label: "Review", icon: ClipboardList },
  { to: "/admin/services", label: "Services", icon: HandHelping },
  { to: "/admin/rules", label: "Rules", icon: Scale },
  { to: "/admin/announcements", label: "Notices", icon: Megaphone },
  { to: "/admin/contacts", label: "Contacts", icon: Phone },
  { to: "/admin/profile", label: "Profile", icon: ShieldCheck },
];

export function BottomNav({ portal }: { portal: "citizen" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const rawItems = portal === "citizen" ? citizenNav : adminNav;
  const items = rawItems.map((item) => ({
    ...item,
    translatedLabel:
      item.to.includes("home") ? t("nav.dashboard") :
      item.to.includes("complaint/new") ? t("tileRaiseComplaint") :
      item.to.includes("complaints") ? t("tileMyComplaints") :
      item.to.includes("services") ? t("dash.btn.services") :
      item.to.includes("rules") ? t("dash.info.rules") :
      item.to.includes("announcements") ? t("dash.announcements") :
      item.to.includes("profile") ? t("nav.profile") : item.label,
  }));
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={[styles.bottomNavContainer, { height: 60 + bottomInset, paddingBottom: bottomInset }]}>
      {items.map((i) => {
        const active = pathname === i.to;
        const IconComp = i.icon;
        const activeColor = portal === "admin" ? theme.colors.admin : theme.colors.primary;
        const color = active ? activeColor : theme.colors.mutedForeground;

        return (
          <TouchableOpacity
            key={i.to}
            style={styles.bottomNavItem}
            onPress={() => router.push(i.to as any)}
          >
            <IconComp size={22} color={color} />
            <Text style={[styles.bottomNavLabel, { color }]}>{i.translatedLabel}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function Shell({
  portal,
  title,
  subtitle,
  right,
  children,
}: {
  portal: "citizen" | "admin";
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { citizen, admin, hydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const authed = portal === "citizen" ? !!citizen : !!admin;
  const isRoot = pathname === "/citizen/home" || pathname === "/admin/home" || pathname === "/admin/dashboard" || pathname === "/";

  useEffect(() => {
    if (hydrated && !authed) {
      router.replace(portal === "citizen" ? "/citizen/login" : "/admin/login");
    }
  }, [hydrated, authed, portal]);

  if (!hydrated || !authed) return <LoadingSpinner label="Checking your session..." />;

  const rawTop = insets.top > 0 ? insets.top : (Platform.OS === "android" ? (StatusBar.currentHeight || 32) : 36);
  const topInset = Math.max(rawTop + 12, 44);
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: topInset }}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {!isRoot && (
          <TouchableOpacity
            style={styles.topBarBackBtn}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace(portal === "citizen" ? "/citizen/home" : "/admin/home");
              }
            }}
          >
            <ArrowLeft size={18} color={theme.colors.foreground} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.topBarTitle}>{title}</Text>
          {subtitle && <Text style={styles.topBarSubtitle}>{subtitle}</Text>}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {right}
          {(pathname.endsWith("/home") || pathname.endsWith("/profile") || pathname === "/") && !right ? (
            <LanguageSwitcher />
          ) : null}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 + bottomInset }}>
        {children}
      </ScrollView>
    </View>
  );
}

export function AuthLayout({
  portal,
  title,
  subtitle,
  children,
  footer,
}: {
  portal: "citizen" | "admin";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rawTop = insets.top > 0 ? insets.top : (Platform.OS === "android" ? (StatusBar.currentHeight || 32) : 36);
  const topInset = Math.max(rawTop + 12, 44);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: topInset }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20 + insets.bottom, alignItems: "center" }}>
        <View style={styles.authHeader}>
          <TouchableOpacity onPress={() => router.push(portal === "admin" ? "/admin/home" as any : "/citizen/home" as any)}>
            <Brand tone={portal === "admin" ? "admin" : "primary"} />
          </TouchableOpacity>
          <LanguageSwitcher />
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{title}</Text>
          <Text style={styles.authSubtitle}>{subtitle}</Text>
          {children}
        </View>

        {footer && <View style={{ marginTop: 20, width: "100%", alignItems: "center" }}>{footer}</View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandLetter: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  topBarBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: theme.colors.foreground,
    lineHeight: 26,
  },
  topBarSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  profileHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: 64,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  authHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  authCard: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  authSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
    marginBottom: 20,
  },
});
