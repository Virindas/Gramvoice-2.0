import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminLogin() {
  const api = useApi();
  const navigate = useNavigate();
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.adminLogin(identifier, password);
      toast(t("admin.signin_success"));
      navigate("/admin/home");
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
        <div className="space-y-1 text-muted-foreground">
          <p>
            {t("admin.need_account")}{" "}
            <Link to="/admin/register" className="font-bold text-admin underline">
              {t("admin.register_key")}
            </Link>
          </p>
          <p>
            <Link to="/admin/forgot-password" className="font-bold text-admin underline">
              {t("admin.forgot_password_link")}
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label={t("admin.email_or_phone")}
          value={identifier}
          placeholder="admin@panchayat.gov.in"
          onChange={(e) => setIdentifier(e.target.value)}
          error={touched ? idError : ""}
        />
        <Input
          label={t("admin.password_label")}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched ? pwError : ""}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
        />
        <Button type="submit" variant="admin" full loading={loading} disabled={!valid}>
          {t("admin.signin_btn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
