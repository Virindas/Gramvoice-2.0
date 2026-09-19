import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, Select, useToast } from "@/components/ui";
import { ADMIN_KEY, SECURITY_QUESTIONS } from "@/lib/mock-data";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminRegister() {
  const api = useApi();
  const navigate = useNavigate();
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

  async function finish(e: React.FormEvent) {
    e.preventDefault();
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
      navigate("/admin/login");
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
        <span className="text-muted-foreground">
          {t("admin.already_registered")}{" "}
          <Link to="/admin/login" className="font-bold text-admin underline">
            {t("admin.signin_here")}
          </Link>
        </span>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {step === 1 ? (
        <form
          className="space-y-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (step1Valid) {
              setTouched(false);
              setStep(2);
            }
          }}
        >
          <Input
            label={t("admin.gov_key_label")}
            value={f.key}
            placeholder="GRAM-ADMIN-XXXX"
            onChange={(e) => setF({ ...f, key: e.target.value.toUpperCase() })}
            error={touched ? e1.key : ""}
            hint={t("admin.gov_key_hint")}
          />
          <Input
            label={t("admin.full_name")}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            error={touched ? e1.name : ""}
          />
          <Input
            label={t("admin.office_label")}
            value={f.office}
            placeholder="Panchayat Development Office"
            onChange={(e) => setF({ ...f, office: e.target.value })}
            error={touched ? e1.office : ""}
          />
          <Input
            label={t("admin.email_label")}
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            error={touched ? e1.email : ""}
          />
          <Input
            label={t("admin.phone_label_10")}
            inputMode="numeric"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            error={touched ? e1.phone : ""}
          />
          <Input
            label={t("admin.password_label")}
            type={showPassword ? "text" : "password"}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            error={touched ? e1.password : ""}
            hint="Minimum 8 characters, including a letter and a number."
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
            label={t("admin.confirm_password_label")}
            type={showConfirm ? "text" : "password"}
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
            error={touched ? e1.confirm : ""}
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
          <Button type="submit" variant="admin" full disabled={!step1Valid}>
            {t("admin.next_step_btn")}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" noValidate onSubmit={finish}>
          <Select
            label={t("admin.question_1")}
            options={SECURITY_QUESTIONS}
            value={q.q1}
            onChange={(e) => setQ({ ...q, q1: e.target.value })}
            error={touched ? e2.q : ""}
          />
          <Input
            label={t("admin.answer_1")}
            value={q.a1}
            onChange={(e) => setQ({ ...q, a1: e.target.value })}
            error={touched ? e2.a1 : ""}
          />
          <Select
            label={t("admin.question_2")}
            options={SECURITY_QUESTIONS}
            value={q.q2}
            onChange={(e) => setQ({ ...q, q2: e.target.value })}
          />
          <Input
            label={t("admin.answer_2")}
            value={q.a2}
            onChange={(e) => setQ({ ...q, a2: e.target.value })}
            error={touched ? e2.a2 : ""}
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              {t("admin.back_step_btn")}
            </Button>
            <Button type="submit" variant="admin" full loading={loading} disabled={!step2Valid}>
              {t("admin.create_admin_btn")}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
