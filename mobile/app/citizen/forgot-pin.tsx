import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Card, Input, PinInput, theme, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ForgotPinScreen() {
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const toast = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState<"phone" | "confirm_name" | "reset_pin">("phone");
  const [phone, setPhone] = useState(params.phone || "");
  const [foundName, setFoundName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

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
  const confirmPinError =
    confirmPin.length !== 4
      ? t("pin.err.4digits")
      : pin !== confirmPin
      ? t("pin.err.mismatch")
      : "";

  async function checkPhone() {
    setTouched(true);
    if (phoneError) return;

    setLoading(true);
    setError("");
    setNotFoundErr(false);

    try {
      const res = await api.checkCitizenPhone(phone);
      if (res.exists) {
        setFoundName(res.fullName);
        setStep("confirm_name");
      }
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

  async function submitReset() {
    setTouched(true);
    if (pinError || confirmPinError) return;

    setLoading(true);
    setError("");

    try {
      await api.resetCitizenPin(phone, pin);
      toast(t("forgot_pin.success"));
      router.replace("/citizen/home" as any);
    } catch (err: any) {
      setError(err.message || t("err.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="citizen"
      title={t("forgot_pin.title")}
      subtitle={t("forgot_pin.desc")}
      footer={
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.mutedForeground }}>{t("forgot_pin.remembered")}{" "}</Text>
          <TouchableOpacity onPress={() => router.push("/citizen/login" as any)}>
            <Text style={{ fontWeight: "700", color: theme.colors.primary, textDecorationLine: "underline" }}>
              {t("login.tab.login")}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={{ gap: 16 }}>
        {step === "phone" && (
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

            <Button full loading={loading} disabled={touched && !!phoneError} onClick={checkPhone}>
              {t("action.submit")}
            </Button>
          </View>
        )}

        {step === "confirm_name" && (
          <View style={{ gap: 16 }}>
            {error ? <Alert tone="error">{error}</Alert> : null}

            <Card elevated style={{ alignItems: "center", paddingVertical: 20, gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.foreground, textAlign: "center" }}>
                {t("forgot_pin.confirm_user", { name: foundName })}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.mutedForeground }}>
                {t("forgot_pin.mobile_fmt", { phone })}
              </Text>
            </Card>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button
                  variant="outline"
                  full
                  onClick={() => {
                    setError(t("forgot_pin.not_user_msg"));
                    setStep("phone");
                  }}
                >
                  {t("forgot_pin.confirm_no")}
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  full
                  onClick={() => {
                    setError("");
                    setTouched(false);
                    setStep("reset_pin");
                  }}
                >
                  {t("forgot_pin.confirm_yes")}
                </Button>
              </View>
            </View>
          </View>
        )}

        {step === "reset_pin" && (
          <View style={{ gap: 16 }}>
            {error ? <Alert tone="error">{error}</Alert> : null}

            <PinInput
              label={t("pin.set")}
              value={pin}
              onChange={setPin}
              hint={t("forgot_pin.new_pin_hint")}
              error={touched ? pinError : ""}
            />

            <PinInput
              label={t("pin.confirm")}
              value={confirmPin}
              onChange={setConfirmPin}
              error={touched ? confirmPinError : ""}
            />

            <Button
              full
              loading={loading}
              disabled={touched && (!!pinError || !!confirmPinError)}
              onClick={submitReset}
            >
              {t("action.save")}
            </Button>
          </View>
        )}
      </View>
    </AuthLayout>
  );
}
