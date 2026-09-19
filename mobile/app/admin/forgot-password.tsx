import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, theme, useToast } from "@/components/ui";
import type { Admin } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ForgotPasswordScreen() {
  const api = useApi();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [account, setAccount] = useState<Admin | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const idError = identifier.trim().length < 5 ? "Enter your registered email or phone." : "";
  const answersValid =
    Boolean(account) &&
    (account?.questions.length ?? 0) > 0 &&
    account!.questions.every((_, i) => (answers[i] ?? "").trim().length > 1);
  const pwError =
    pw.password.length < 8 || !/[A-Za-z]/.test(pw.password) || !/\d/.test(pw.password)
      ? "At least 8 characters, with one letter and one number."
      : "";
  const confirmError = pw.confirm !== pw.password ? "Passwords do not match." : "";

  return (
    <AuthLayout
      portal="admin"
      title={t("admin.recover_title")}
      subtitle={t("admin.recover_subtitle", { step })}
      footer={
        <TouchableOpacity onPress={() => router.push("/admin/login" as any)}>
          <Text style={{ fontWeight: "700", color: theme.colors.admin, textDecorationLine: "underline" }}>
            {t("admin.back_to_signin")}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={{ gap: 16 }}>
        {error ? <Alert tone="error">{error}</Alert> : null}

        {step === 1 && (
          <>
            <Input
              label={t("admin.email_or_phone")}
              value={identifier}
              onChangeText={setIdentifier}
              error={touched ? idError : ""}
            />
            <Button
              variant="admin"
              full
              loading={loading}
              disabled={!!idError}
              onClick={() => {
                setTouched(true);
                if (idError) return;
                void run(async () => {
                  const found = await api.adminLookup(identifier);
                  setAccount(found);
                  setAnswers(new Array(found.questions.length).fill(""));
                  setTouched(false);
                  setStep(2);
                });
              }}
            >
              {t("admin.find_account_btn")}
            </Button>
          </>
        )}

        {step === 2 && account && (
          <>
            <Alert tone="info">
              {account.questions.length > 1
                ? "Answer both questions exactly as you set them at registration."
                : "Answer your security question exactly as you set it at registration."}
            </Alert>
            {account.questions.map((q, i) => (
              <Input
                key={(q as any).id || q.question}
                label={q.question}
                value={answers[i] ?? ""}
                onChangeText={(val: string) => {
                  const next = [...answers];
                  next[i] = val;
                  setAnswers(next);
                }}
                error={touched && (answers[i] ?? "").trim().length < 2 ? "Enter an answer." : ""}
              />
            ))}
            <Button
              variant="admin"
              full
              loading={loading}
              disabled={!answersValid}
              onClick={() => {
                setTouched(true);
                if (!answersValid) return;
                void run(async () => {
                  await api.verifyAnswers(account.id, answers);
                  setTouched(false);
                  setStep(3);
                });
              }}
            >
              {t("admin.verify_answers_btn")}
            </Button>
          </>
        )}

        {step === 3 && account && (
          <>
            <Input
              label={t("admin.new_password")}
              type={showPassword ? "text" : "password"}
              secureTextEntry={!showPassword}
              value={pw.password}
              onChangeText={(v: string) => setPw({ ...pw, password: v })}
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
            <Input
              label={t("admin.confirm_new_password")}
              type={showConfirm ? "text" : "password"}
              secureTextEntry={!showConfirm}
              value={pw.confirm}
              onChangeText={(v: string) => setPw({ ...pw, confirm: v })}
              error={touched ? confirmError : ""}
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
            <Button
              variant="admin"
              full
              loading={loading}
              disabled={!!pwError || !!confirmError}
              onClick={() => {
                setTouched(true);
                if (pwError || confirmError) return;
                void run(async () => {
                  await api.resetAdminPassword(account.id, pw.password);
                  toast(t("admin.password_reset_success"));
                  router.replace("/admin/login" as any);
                });
              }}
            >
              {t("admin.set_new_password_btn")}
            </Button>
          </>
        )}
      </View>
    </AuthLayout>
  );
}
