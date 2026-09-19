import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, Select, TextArea, theme, useToast } from "@/components/ui";
import { LANGUAGES, type Language } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CitizenSignupScreen() {
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const toast = useToast();
  const { t } = useLanguage();

  const [f, setF] = useState({
    name: "",
    phone: params.phone || "",
    address: "",
    ward: "Ward 1",
    language: "English" as Language,
    pin: "",
    confirmPin: "",
  });

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);

  useEffect(() => {
    if (params.phone && params.phone !== f.phone) {
      setF((prev) => ({ ...prev, phone: params.phone! }));
    }
  }, [params.phone]);

  const errors = {
    name: !/^[A-Za-z ]{3,50}$/.test(f.name.trim())
      ? t("signup.name_err")
      : "",
    phone: !/^\d{10}$/.test(f.phone) ? t("login.err.phone_format") : "",
    address:
      f.address.trim().length < 5 || ["add", "n/a", "none"].includes(f.address.trim().toLowerCase())
        ? t("signup.address_err")
        : "",
    ward: f.ward.trim().length < 1 ? t("signup.ward_err") : "",
    pin: f.pin.length !== 4 ? t("pin.err.4digits") : "",
    confirmPin:
      f.confirmPin.length !== 4
        ? t("pin.err.4digits")
        : f.pin !== f.confirmPin
        ? t("pin.err.mismatch")
        : "",
  };

  const valid = Object.values(errors).every((e) => !e);

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    setAlreadyExists(false);

    try {
      await api.citizenSignup({
        name: f.name.trim(),
        phone: f.phone,
        address: f.address.trim(),
        ward: f.ward.trim(),
        language: f.language,
        pin: f.pin,
      });
      toast(t("signup.account_created"));
      router.replace("/citizen/home" as any);
    } catch (err: any) {
      const msg = err.message || "";
      setError(msg);
      if (msg.includes("already exists") || msg.includes("already registered")) {
        setAlreadyExists(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="citizen"
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      footer={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.mutedForeground }}>{t("signup.already_registered")}{" "}</Text>
          <TouchableOpacity onPress={() => router.push("/citizen/login" as any)}>
            <Text style={{ fontWeight: "700", color: theme.colors.primary, textDecorationLine: "underline" }}>
              {t("signup.signin")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={{ gap: 16 }}>
        {error ? (
          <Alert tone="error">
            <View style={{ gap: 8 }}>
              <Text style={{ color: theme.colors.rejected }}>{error}</Text>
              {alreadyExists ? (
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.rejected,
                    alignSelf: "flex-start",
                  }}
                  onPress={() => router.push("/citizen/login" as any)}
                >
                  <Text style={{ fontWeight: "700", color: theme.colors.rejected }}>
                    {t("signup.go_to_login")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Alert>
        ) : null}

        <Input
          label={t("login.name")}
          value={f.name}
          placeholder={t("signup.name_placeholder")}
          onChangeText={(v: string) => setF({ ...f, name: v })}
          error={touched ? errors.name : ""}
        />

        <Input
          label={t("login.phone")}
          inputMode="numeric"
          placeholder={t("login.phone_placeholder")}
          value={f.phone}
          onChangeText={(v: string) => setF({ ...f, phone: v.replace(/\D/g, "").slice(0, 10) })}
          error={touched ? errors.phone : ""}
        />

        <Input
          label={t("login.ward")}
          placeholder={t("signup.ward_placeholder")}
          value={f.ward}
          onChangeText={(v: string) => setF({ ...f, ward: v })}
          error={touched ? errors.ward : ""}
        />

        <TextArea
          label={t("login.address")}
          rows={2}
          placeholder={t("signup.address_placeholder")}
          value={f.address}
          onChangeText={(v: string) => setF({ ...f, address: v })}
          error={touched ? errors.address : ""}
        />

        <Select
          label={t("signup.pref_lang")}
          options={[...LANGUAGES]}
          value={f.language}
          onChange={(e: any) => setF({ ...f, language: e.target.value as Language })}
        />

        <PinInput
          label={t("pin.set")}
          value={f.pin}
          onChange={(v) => setF({ ...f, pin: v })}
          hint={t("signup.pin_hint")}
          error={touched ? errors.pin : ""}
        />

        <PinInput
          label={t("pin.confirm")}
          value={f.confirmPin}
          onChange={(v) => setF({ ...f, confirmPin: v })}
          error={touched ? errors.confirmPin : ""}
        />

        <Button full loading={loading} disabled={touched && !valid} onClick={submit}>
          {t("login.btn.register")}
        </Button>
      </View>
    </AuthLayout>
  );
}
