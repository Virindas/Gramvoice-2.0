import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CitizenLogin() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFoundErr, setNotFoundErr] = useState(false);

  const phoneError = !/^\d{10}$/.test(phone) ? t("login.err.phone_format") : "";
  const pinError = pin.length !== 4 ? t("pin.err.4digits") : "";
  const valid = !phoneError && !pinError;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    setNotFoundErr(false);

    try {
      await api.citizenLogin(phone, pin);
      toast(t("auth.verified_title"));
      navigate("/citizen/home");
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
        <span className="text-muted-foreground">
          {t("login.new_here")}{" "}
          <Link
            to={phone ? `/citizen/signup?phone=${phone}` : "/citizen/signup"}
            className="font-bold text-primary underline"
          >
            {t("login.tab.register")}
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
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
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={touched ? phoneError : ""}
        />

        <div className="space-y-1">
          <PinInput
            label={t("passwordLabel")}
            value={pin}
            onChange={setPin}
            error={touched ? pinError : ""}
          />
          <div className="flex justify-end pt-1">
            <Link
              to={phone ? `/citizen/forgot-pin?phone=${phone}` : "/citizen/forgot-pin"}
              className="text-sm font-bold text-primary hover:underline"
            >
              {t("login.forgot_pin")}
            </Link>
          </div>
        </div>

        <Button full type="submit" loading={loading} disabled={touched && !valid}>
          {t("login.btn.continue")}
        </Button>
      </form>
    </AuthLayout>
  );
}
