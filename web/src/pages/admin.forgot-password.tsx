import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, useToast } from "@/components/ui";
import type { Admin } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ForgotPassword() {
  const api = useApi();
  const navigate = useNavigate();
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
        <Link to="/admin/login" className="font-bold text-admin underline">
          {t("admin.back_to_signin")}
        </Link>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {step === 1 && (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
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
          <Input
            label={t("admin.email_or_phone")}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={touched ? idError : ""}
          />
          <Button type="submit" variant="admin" full loading={loading} disabled={!!idError}>
            {t("admin.find_account_btn")}
          </Button>
        </form>
      )}

      {step === 2 && account && (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!answersValid) return;
            void run(async () => {
              await api.verifyAnswers(account.id, answers);
              setTouched(false);
              setStep(3);
            });
          }}
        >
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
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              error={touched && (answers[i] ?? "").trim().length < 2 ? "Enter an answer." : ""}
            />
          ))}
          <Button type="submit" variant="admin" full loading={loading} disabled={!answersValid}>
            {t("admin.verify_answers_btn")}
          </Button>
        </form>
      )}

      {step === 3 && account && (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (pwError || confirmError) return;
            void run(async () => {
              await api.resetAdminPassword(account.id, pw.password);
              toast(t("admin.password_reset_success"));
              navigate("/admin/login");
            });
          }}
        >
          <Input
            label={t("admin.new_password")}
            type={showPassword ? "text" : "password"}
            value={pw.password}
            onChange={(e) => setPw({ ...pw, password: e.target.value })}
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
          <Input
            label={t("admin.confirm_new_password")}
            type={showConfirm ? "text" : "password"}
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            error={touched ? confirmError : ""}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />
          <Button
            type="submit"
            variant="admin"
            full
            loading={loading}
            disabled={!!pwError || !!confirmError}
          >
            {t("admin.set_new_password_btn")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
