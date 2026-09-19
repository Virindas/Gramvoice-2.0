import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, Select, TextArea, useToast } from "@/components/ui";
import { LANGUAGES, type Language } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CitizenSignup() {
  const api = useApi();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { t } = useLanguage();

  const [f, setF] = useState({
    name: "",
    phone: searchParams.get("phone") || "",
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
    const prefill = searchParams.get("phone");
    if (prefill && prefill !== f.phone) {
      setF((prev) => ({ ...prev, phone: prefill }));
    }
  }, [searchParams]);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      navigate("/citizen/home");
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
        <span className="text-muted-foreground">
          {t("signup.already_registered")}{" "}
          <Link to="/citizen/login" className="font-bold text-primary underline">
            {t("signup.signin")}
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && (
          <Alert tone="error">
            <div className="space-y-2">
              <p>{error}</p>
              {alreadyExists && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/citizen/login")}
                  >
                    {t("signup.go_to_login")}
                  </Button>
                </div>
              )}
            </div>
          </Alert>
        )}

        <Input
          label={t("login.name")}
          value={f.name}
          placeholder={t("signup.name_placeholder")}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          error={touched ? errors.name : ""}
        />

        <Input
          label={t("login.phone")}
          inputMode="numeric"
          placeholder={t("login.phone_placeholder")}
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          error={touched ? errors.phone : ""}
        />

        <Input
          label={t("login.ward")}
          placeholder={t("signup.ward_placeholder")}
          value={f.ward}
          onChange={(e) => setF({ ...f, ward: e.target.value })}
          error={touched ? errors.ward : ""}
        />

        <TextArea
          label={t("login.address")}
          rows={2}
          placeholder={t("signup.address_placeholder")}
          value={f.address}
          onChange={(e) => setF({ ...f, address: e.target.value })}
          error={touched ? errors.address : ""}
        />

        <Select
          label={t("signup.pref_lang")}
          options={[...LANGUAGES]}
          value={f.language}
          onChange={(e) => setF({ ...f, language: e.target.value as Language })}
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

        <Button type="submit" full loading={loading} disabled={touched && !valid}>
          {t("login.btn.register")}
        </Button>
      </form>
    </AuthLayout>
  );
}
