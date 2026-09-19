import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, Pencil, UserRound } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, Modal, TextArea, theme, useToast } from "@/components/ui";
import { useApi, useStore, cleanAddress } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ProfileScreen() {
  const api = useApi();
  const { citizen } = useStore();
  const router = useRouter();
  const toast = useToast();
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    name: citizen?.name ?? "",
    phone: citizen?.phone ?? "",
    address: cleanAddress(citizen?.address),
  });

  const translatedLang = language === "hi" ? "हिन्दी" : language === "ta" ? "தமிழ்" : "English";

  const errors = {
    name: f.name.trim().length < 3 ? t("profile.err_name") : "",
    phone: !/^\d{10}$/.test(f.phone) ? t("profile.err_phone") : "",
    address: f.address.trim().length > 0 && (f.address.trim().length < 5 || ["add", "n/a", "none"].includes(f.address.trim().toLowerCase())) ? t("profile.err_address") : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.updateCitizen({
        name: f.name.trim(),
        phone: f.phone,
        address: f.address.trim(),
      });
      toast(t("profile.toast_updated"));
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="citizen" title={t("profile.screen_title")} subtitle={t("profile.screen_subtitle")}>
      <Card elevated style={{ alignItems: "center", paddingVertical: 24 }}>
        <View style={{ position: "relative" }}>
          {citizen?.avatar ? (
            <Image source={{ uri: citizen.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarBox}>
              <UserRound size={48} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <Text style={styles.nameText}>{citizen?.name}</Text>
        <Text style={styles.subText}>{translatedLang} · {citizen?.phone}</Text>
      </Card>

      <Card elevated style={{ marginTop: 20, gap: 12 }}>
        <Row label={t("profile.full_name")} value={citizen?.name ?? ""} />
        <Row label={t("profile.phone_num")} value={citizen?.phone ?? ""} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t("profile.addr_field")}</Text>
          {cleanAddress(citizen?.address) ? (
            <Text style={styles.rowValue}>{cleanAddress(citizen?.address)}</Text>
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 14, color: theme.colors.mutedForeground, fontStyle: "italic" }}>
                {t("profile.no_address")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setF({
                    name: citizen?.name ?? "",
                    phone: citizen?.phone ?? "",
                    address: "",
                  });
                  setEditing(true);
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>
                  + {t("profile.add_address")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Button
          variant="outline"
          full
          icon={<Pencil size={18} color={theme.colors.foreground} />}
          onClick={() => {
            setF({
              name: citizen?.name ?? "",
              phone: citizen?.phone ?? "",
              address: cleanAddress(citizen?.address),
            });
            setEditing(true);
          }}
        >
          {t("profile.btn_edit")}
        </Button>
      </Card>

      <View style={{ marginTop: 20 }}>
        <Button
          variant="danger"
          full
          icon={<LogOut size={18} color={theme.colors.destructiveForeground} />}
          onClick={() => {
            api.citizenLogout();
            router.replace("/citizen/login" as any);
          }}
        >
          {t("profile.btn_logout")}
        </Button>
      </View>

      <Modal open={editing} onClose={() => setEditing(false)} title={t("profile.edit_title")}>
        <View style={{ gap: 16 }}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input
            label={t("profile.full_name")}
            value={f.name}
            onChangeText={(v: string) => setF({ ...f, name: v })}
            error={errors.name}
          />
          <Input
            label={t("profile.phone_num")}
            inputMode="numeric"
            value={f.phone}
            onChangeText={(v: string) => setF({ ...f, phone: v.replace(/\D/g, "").slice(0, 10) })}
            error={errors.phone}
          />
          <TextArea
            label={t("profile.addr_field")}
            rows={3}
            value={f.address}
            onChangeText={(v: string) => setF({ ...f, address: v })}
            error={errors.address}
          />
          <Button full loading={loading} disabled={!valid} onClick={save}>
            {t("profile.btn_save")}
          </Button>
        </View>
      </Modal>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    objectFit: "cover" as any,
  },
  cameraBtn: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 12,
  },
  subText: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 2,
  },
});
