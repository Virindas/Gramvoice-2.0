import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, theme, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CitizenLoginScreen() {
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const toast = useToast();
  const { t } = useLanguage();

  const [phone, setPhone] = useState(params.phone || "");
  const [pin, setPin] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFoundErr, setNotFoundErr] = useState(false);

  useEffect(() => {
    if (params.phone && params.phone !== phone) {
      setPhone(params.phone);
    }
  }, [params.phone]);

  const phoneError = !/^\d{10}$/.test(phone) ? t("login.err.phone_format") : "";
  const pinError = pin.length !== 4 ? t("pin.err.4digits") : "";
  const valid = !phoneError && !pinError;

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    setNotFoundErr(false);

    try {
      await api.citizenLogin(phone, pin);
      toast(t("auth.verified_title"));
      router.replace("/citizen/home" as any);
    } catch (err: any) {
      const msg = err.message || "";
      setError(msg);
      if (msg.includes("couldn't find an account") || msg.includes("not found")) {
        setNotFoundErr(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="citizen"
      title={t("login.title")}
      subtitle={t("login.desc.villager")}
      footer={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.mutedForeground }}>{t("login.new_here")}{" "}</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/citizen/signup",
                params: phone ? { phone } : undefined,
              } as any)
            }
          >
            <Text style={{ fontWeight: "700", color: theme.colors.primary, textDecorationLine: "underline" }}>
              {t("login.tab.register")}
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
              {notFoundErr ? (
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.rejected,
                    alignSelf: "flex-start",
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/citizen/signup",
                      params: { phone },
                    } as any)
                  }
                >
                  <Text style={{ fontWeight: "700", color: theme.colors.rejected }}>
                    {t("login.tab.register")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Alert>
        ) : null}

        <Input
          label={t("login.phone")}
          inputMode="numeric"
          placeholder={t("login.phone_placeholder")}
          value={phone}
          onChangeText={(v: string) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
          error={touched ? phoneError : ""}
        />

        <View style={{ gap: 4 }}>
          <PinInput
            label={t("passwordLabel")}
            value={pin}
            onChange={setPin}
            error={touched ? pinError : ""}
          />
          <TouchableOpacity
            style={{ alignSelf: "flex-end", paddingTop: 4 }}
            onPress={() =>
              router.push({
                pathname: "/citizen/forgot-pin",
                params: phone ? { phone } : undefined,
              } as any)
            }
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary }}>
              {t("login.forgot_pin")}
            </Text>
          </TouchableOpacity>
        </View>

        <Button full loading={loading} disabled={touched && !valid} onClick={submit}>
          {t("login.btn.continue")}
        </Button>
      </View>
    </AuthLayout>
  );
}
