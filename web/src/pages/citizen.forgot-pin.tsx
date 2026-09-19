import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Card, Input, PinInput, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ForgotPin() {
  const api = useApi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState<"phone" | "confirm_name" | "reset_pin">("phone");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [foundName, setFoundName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFoundErr, setNotFoundErr] = useState(false);

  useEffect(() => {
    const prefill = searchParams.get("phone");
    if (prefill && prefill !== phone) {
      setPhone(prefill);
    }
  }, [searchParams]);

  const phoneError = !/^\d{10}$/.test(phone) ? t("login.err.phone_format") : "";
  const pinError = pin.length !== 4 ? t("pin.err.4digits") : "";
  const confirmPinError =
    confirmPin.length !== 4
      ? t("pin.err.4digits")
      : pin !== confirmPin
      ? t("pin.err.mismatch")
      : "";

  async function checkPhone(e: React.FormEvent) {
    e.preventDefault();
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

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (pinError || confirmPinError) return;

    setLoading(true);
    setError("");

    try {
      await api.resetCitizenPin(phone, pin);
      toast(t("forgot_pin.success"));
      navigate("/citizen/home");
    } catch (err: any) {
      setError(err.message || "Failed to reset PIN");
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
        <span className="text-muted-foreground">
          {t("forgot_pin.remembered")}{" "}
          <Link to="/citizen/login" className="font-bold text-primary underline">
            {t("login.tab.login")}
          </Link>
        </span>
      }
    >
      {step === "phone" && (
        <form onSubmit={checkPhone} className="space-y-5" noValidate>
          {error && (
            <Alert tone="error">
              <div className="space-y-2">
                <p>{error}</p>
                {notFoundErr && (
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/citizen/signup?phone=${phone}`)}
                    >
                      {t("login.tab.register")}
                    </Button>
                  </div>
                )}
              </div>
            </Alert>
          )}

          <Input
            label={t("login.phone")}
            inputMode="numeric"
            placeholder={t("login.phone_placeholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            error={touched ? phoneError : ""}
          />

          <Button full type="submit" loading={loading} disabled={touched && !!phoneError}>
            {t("action.submit")}
          </Button>
        </form>
      )}

      {step === "confirm_name" && (
        <div className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}

          <Card elevated className="text-center space-y-3 py-6">
            <p className="text-xl font-bold text-foreground">
              {t("forgot_pin.confirm_user", { name: foundName })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("forgot_pin.mobile_fmt", { phone })}
            </p>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              full
              onClick={() => {
                setError(t("forgot_pin.not_user_msg"));
                setStep("phone");
              }}
            >
              {t("forgot_pin.confirm_no")}
            </Button>

            <Button
              type="button"
              full
              onClick={() => {
                setError("");
                setTouched(false);
                setStep("reset_pin");
              }}
            >
              {t("forgot_pin.confirm_yes")}
            </Button>
          </div>
        </div>
      )}

      {step === "reset_pin" && (
        <form onSubmit={submitReset} className="space-y-5" noValidate>
          {error && <Alert tone="error">{error}</Alert>}

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

          <Button full type="submit" loading={loading} disabled={touched && (!!pinError || !!confirmPinError)}>
            {t("action.save")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
