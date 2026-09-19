import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { Phone, Search, PhoneCall } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Card, EmptyState, Input, theme } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedContactRole } from "@/lib/contentTranslation";

export default function ContactsScreen() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const [q, setQ] = useState("");
  const currentLang = (language as "en" | "hi" | "ta") || "en";

  const list = db.contacts.filter((c) =>
    `${c.name} ${c.role} ${c.phone}`.toLowerCase().includes(q.toLowerCase().trim())
  );

  return (
    <Shell portal="citizen" title={t("contacts.screen_title")} subtitle={t("contacts.screen_subtitle")}>
      <Input
        label={t("contacts.search_label")}
        value={q}
        placeholder={t("contacts.search_placeholder")}
        onChangeText={setQ}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Search size={32} color={theme.colors.mutedForeground} />}
          title={t("contacts.empty_title")}
          description={t("contacts.empty_desc")}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((c) => {
            const transRole = getTranslatedContactRole(c.role, currentLang);
            return (
              <Card key={c.id} elevated style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Phone size={24} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{c.name}</Text>
                  <Text style={styles.roleText}>{transRole || c.role}</Text>
                </View>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${c.phone}`)}
                >
                  <PhoneCall size={18} color={theme.colors.primaryForeground} />
                  <Text style={styles.callBtnText}>{t("contacts.call_btn")}</Text>
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
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
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  roleText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primaryForeground,
  },
});
