import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, Select, theme, useToast } from "@/components/ui";
import { ADMIN_KEY, SECURITY_QUESTIONS } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminRegisterScreen() {
  const api = useApi();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [f, setF] = useState({
    key: "",
    name: "",
    office: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [q, setQ] = useState({
    q1: SECURITY_QUESTIONS[0] as string,
    a1: "",
    q2: SECURITY_QUESTIONS[1] as string,
    a2: "",
  });

  const e1 = {
    key: f.key.trim() !== ADMIN_KEY && f.key.trim() !== "GV2026" ? "This registration key is not recognised." : "",
    name: f.name.trim().length < 3 ? "Enter your full name." : "",
    office: f.office.trim().length < 3 ? "Enter your office or department." : "",
    email: !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(f.email.trim())
      ? "Enter a valid email address (e.g. name@panchayat.gov.in or name@gmail.com)."
      : "",
    phone: !/^\d{10}$/.test(f.phone) ? "Phone number must be exactly 10 digits." : "",
    password:
      f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)
        ? "Password must be at least 8 characters and include at least one letter and one number."
        : "",
    confirm: f.confirm !== f.password ? "Passwords do not match." : "",
  };
  const step1Valid = Object.values(e1).every((x) => !x);

  const e2 = {
    q: q.q1 === q.q2 ? "Please pick two different questions." : "",
    a1: q.a1.trim().length < 2 ? "Answer the first question." : "",
    a2: q.a2.trim().length < 2 ? "Answer the second question." : "",
  };
  const step2Valid = Object.values(e2).every((x) => !x);

  async function finish() {
    setTouched(true);
    if (!step2Valid) return;
    setLoading(true);
    setError("");
    try {
      await api.adminRegister({
        ...f,
        questions: [
          { question: q.q1, answer: q.a1.trim() },
          { question: q.q2, answer: q.a2.trim() },
        ],
      });
      toast(t("admin.account_created"));
      router.replace("/admin/login" as any);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="admin"
      title={step === 1 ? t("admin.reg_title") : t("admin.next_step_btn")}
      subtitle={
        step === 1
          ? t("admin.reg_subtitle", { step: 1 })
          : t("admin.step2_subtitle")
      }
      footer={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.mutedForeground }}>{t("admin.already_registered")} </Text>
          <TouchableOpacity onPress={() => router.push("/admin/login" as any)}>
            <Text style={{ fontWeight: "700", color: theme.colors.admin, textDecorationLine: "underline" }}>
              {t("admin.signin_here")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={{ gap: 16 }}>
        {error ? <Alert tone="error">{error}</Alert> : null}

        {step === 1 ? (
          <>
            <Input
              label={t("admin.gov_key_label")}
              value={f.key}
              placeholder="GRAM-ADMIN-XXXX"
              onChangeText={(v: string) => setF({ ...f, key: v.toUpperCase() })}
              error={touched ? e1.key : ""}
              hint={t("admin.gov_key_hint")}
            />
            <Input
              label={t("admin.full_name")}
              value={f.name}
              onChangeText={(v: string) => setF({ ...f, name: v })}
              error={touched ? e1.name : ""}
            />
            <Input
              label={t("admin.office_label")}
              value={f.office}
              placeholder="Panchayat Development Office"
              onChangeText={(v: string) => setF({ ...f, office: v })}
              error={touched ? e1.office : ""}
            />
            <Input
              label={t("admin.email_label")}
              value={f.email}
              onChangeText={(v: string) => setF({ ...f, email: v })}
              error={touched ? e1.email : ""}
            />
            <Input
              label={t("admin.phone_label_10")}
              inputMode="numeric"
              value={f.phone}
              onChangeText={(v: string) => setF({ ...f, phone: v.replace(/\D/g, "").slice(0, 10) })}
              error={touched ? e1.phone : ""}
            />
            <Input
              label={t("admin.password_label")}
              type={showPassword ? "text" : "password"}
              secureTextEntry={!showPassword}
              value={f.password}
              onChangeText={(v: string) => setF({ ...f, password: v })}
              error={touched ? e1.password : ""}
              hint="Minimum 8 characters, including a letter and a number."
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
              label={t("admin.confirm_password_label")}
              type={showConfirm ? "text" : "password"}
              secureTextEntry={!showConfirm}
              value={f.confirm}
              onChangeText={(v: string) => setF({ ...f, confirm: v })}
              error={touched ? e1.confirm : ""}
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
              disabled={!step1Valid}
              onClick={() => {
                setTouched(true);
                if (step1Valid) {
                  setTouched(false);
                  setStep(2);
                }
              }}
            >
              {t("admin.next_step_btn")}
            </Button>
          </>
        ) : (
          <>
            <Select
              label={t("admin.question_1")}
              options={SECURITY_QUESTIONS}
              value={q.q1}
              onChange={(e: any) => setQ({ ...q, q1: e.target.value })}
              error={touched ? e2.q : ""}
            />
            <Input
              label={t("admin.answer_1")}
              value={q.a1}
              onChangeText={(v: string) => setQ({ ...q, a1: v })}
              error={touched ? e2.a1 : ""}
            />
            <Select
              label={t("admin.question_2")}
              options={SECURITY_QUESTIONS}
              value={q.q2}
              onChange={(e: any) => setQ({ ...q, q2: e.target.value })}
            />
            <Input
              label={t("admin.answer_2")}
              value={q.a2}
              onChangeText={(v: string) => setQ({ ...q, a2: v })}
              error={touched ? e2.a2 : ""}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button variant="outline" full onClick={() => setStep(1)}>
                  {t("admin.back_step_btn")}
                </Button>
              </View>
              <View style={{ flex: 2 }}>
                <Button variant="admin" full loading={loading} disabled={!step2Valid} onClick={finish}>
                  {t("admin.create_admin_btn")}
                </Button>
              </View>
            </View>
          </>
        )}
      </View>
    </AuthLayout>
  );
}
