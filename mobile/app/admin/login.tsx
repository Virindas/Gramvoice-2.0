import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, theme, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminLoginScreen() {
  const api = useApi();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const idError = identifier.trim().length < 5 ? "Enter your registered email or phone." : "";
  const pwError = password.length < 8 ? "Password must be at least 8 characters." : "";
  const valid = !idError && !pwError;

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.adminLogin(identifier, password);
      toast(t("admin.signin_success"));
      router.replace("/admin/home" as any);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="admin"
      title={t("admin.signin_title")}
      subtitle={t("admin.signin_subtitle")}
      footer={
        <View style={{ gap: 8, alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: theme.colors.mutedForeground }}>{t("admin.need_account")} </Text>
            <TouchableOpacity onPress={() => router.push("/admin/register" as any)}>
              <Text style={{ fontWeight: "700", color: theme.colors.admin, textDecorationLine: "underline" }}>
                {t("admin.register_key")}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push("/admin/forgot-password" as any)}>
            <Text style={{ fontWeight: "700", color: theme.colors.admin, textDecorationLine: "underline" }}>
              {t("admin.forgot_password_link")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={{ gap: 16 }}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input
          label={t("admin.email_or_phone")}
          value={identifier}
          placeholder="admin@panchayat.gov.in"
          onChangeText={setIdentifier}
          error={touched ? idError : ""}
        />
        <Input
          label={t("admin.password_label")}
          type={showPassword ? "text" : "password"}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          error={touched ? pwError : ""}
          rightElement={
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={20} color={theme.colors.mutedForeground} />
              ) : (
                <Eye size={20} color={theme.colors.mutedForeground} />
              )}
            </TouchableOpacity>
          }
        />
        <Button type="submit" variant="admin" full loading={loading} disabled={!valid} onClick={submit}>
          {t("admin.signin_btn")}
        </Button>
      </View>
    </AuthLayout>
  );
}
