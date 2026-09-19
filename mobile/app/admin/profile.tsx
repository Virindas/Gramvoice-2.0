import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, theme, useToast } from "@/components/ui";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminProfileScreen() {
  const { admin } = useStore();
  const { t } = useLanguage();
  const api = useApi();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const errors = {
    old: f.old.length < 1 ? "Enter your current password." : "",
    next:
      f.next.length < 8 || !/[A-Za-z]/.test(f.next) || !/\d/.test(f.next)
        ? "At least 8 characters, with one letter and one number."
        : "",
    confirm: f.confirm !== f.next ? "Passwords do not match." : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    setOk(false);
    try {
      await api.changeAdminPassword(f.old, f.next);
      setOk(true);
      setF({ old: "", next: "", confirm: "" });
      setTouched(false);
      toast(t("admin.password_changed"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const officeName = admin?.officeOrDepartment || admin?.office || t("admin.office_fallback");
  const adminName = admin?.fullName || admin?.name || "Administrator";
  const adminEmail = admin?.email || "—";
  const adminPhone = admin?.phoneNumber || admin?.phone || "—";
  const govKey = admin?.governmentKeyUsed || "GRAM-ADMIN-2026";
  const createdDate = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : t("admin.registered_account");

  return (
    <Shell portal="admin" title={t("admin.profile_title")} subtitle={officeName}>
      <Card elevated style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={styles.iconBox}>
            <ShieldCheck size={28} color={theme.colors.adminForeground} />
          </View>
          <View>
            <Text style={styles.adminName}>{adminName}</Text>
            <Text style={styles.adminOffice}>{officeName}</Text>
          </View>
        </View>
        <View style={{ gap: 8, marginTop: 8 }}>
          <Row label={t("admin.full_name")} value={adminName} />
          <Row label={t("admin.official_email")} value={adminEmail} />
          <Row label={t("admin.phone_number")} value={adminPhone} />
          <Row label={t("admin.office_department")} value={officeName} />
          <Row label={t("admin.gov_key_used")} value={govKey} />
          <Row label={t("admin.registration_date")} value={createdDate} />
          {admin?.questions && admin.questions.length > 0 ? (
            admin.questions.map((q, i) => (
              <Row key={i} label={t("admin.security_question_num", { num: i + 1 })} value={q.question} />
            ))
          ) : (
            <Row label={t("admin.security_questions_configured")} value={t("admin.security_questions_configured")} />
          )}
        </View>
      </Card>

      <Card elevated style={{ marginTop: 20, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <KeyRound size={20} color={theme.colors.admin} />
          <Text style={styles.cardHeader}>{t("admin.change_password")}</Text>
        </View>

        {error ? <Alert tone="error">{error}</Alert> : null}
        {ok ? <Alert tone="success">{t("admin.password_updated_success")}</Alert> : null}

        <Input
          label={t("admin.current_password")}
          type={showOld ? "text" : "password"}
          secureTextEntry={!showOld}
          value={f.old}
          onChangeText={(v: string) => setF({ ...f, old: v })}
          error={touched ? errors.old : ""}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowOld(!showOld)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showOld ? (
                <EyeOff size={20} color={theme.colors.mutedForeground} />
              ) : (
                <Eye size={20} color={theme.colors.mutedForeground} />
              )}
            </TouchableOpacity>
          }
        />
        <Input
          label={t("admin.new_password")}
          type={showNext ? "text" : "password"}
          secureTextEntry={!showNext}
          value={f.next}
          onChangeText={(v: string) => setF({ ...f, next: v })}
          error={touched ? errors.next : ""}
          hint="Minimum 8 characters, with one letter and one number."
          rightElement={
            <TouchableOpacity
              onPress={() => setShowNext(!showNext)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showNext ? (
                <EyeOff size={20} color={theme.colors.mutedForeground} />
              ) : (
                <Eye size={20} color={theme.colors.mutedForeground} />
              )}
            </TouchableOpacity>
          }
        />
        <Input
          label={t("admin.confirm_new_password")}
          type={showConfirm ? "text" : "password"}
          secureTextEntry={!showConfirm}
          value={f.confirm}
          onChangeText={(v: string) => setF({ ...f, confirm: v })}
          error={touched ? errors.confirm : ""}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showConfirm ? (
                <EyeOff size={20} color={theme.colors.mutedForeground} />
              ) : (
                <Eye size={20} color={theme.colors.mutedForeground} />
              )}
            </TouchableOpacity>
          }
        />
        <Button type="submit" variant="admin" full loading={loading} disabled={!valid} onClick={submit}>
          {t("admin.update_password_btn")}
        </Button>
      </Card>

      <View style={{ marginTop: 20 }}>
        <Button
          variant="danger"
          full
          icon={<LogOut size={18} color={theme.colors.destructiveForeground} />}
          onClick={() => {
            api.adminLogout();
            router.replace("/admin/login" as any);
          }}
        >
          {t("admin.logout_btn")}
        </Button>
      </View>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.colors.admin,
    alignItems: "center",
    justifyContent: "center",
  },
  adminName: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.foreground,
  },
  adminOffice: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  row: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rowVal: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginTop: 2,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
});
