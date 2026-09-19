import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, useToast } from "@/components/ui";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminProfile() {
  const { admin } = useStore();
  const { t } = useLanguage();
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const errors = {
    old: f.old.length < 1 ? "Enter your current password." : "",
    next:
      f.next.length < 8 || !/[A-Za-z]/.test(f.next) || !/\d/.test(f.next)
        ? "At least 8 characters, with one letter and one number."
        : "",
    confirm: f.confirm !== f.next ? "Passwords do not match." : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    setOk(false);
    try {
      await api.changeAdminPassword(f.old, f.next);
      setOk(true);
      setF({ old: "", next: "", confirm: "" });
      setTouched(false);
      toast(t("admin.password_changed"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const officeName = admin?.officeOrDepartment || admin?.office || t("admin.office_fallback");
  const adminName = admin?.fullName || admin?.name || "Administrator";
  const adminEmail = admin?.email || "—";
  const adminPhone = admin?.phoneNumber || admin?.phone || "—";
  const govKey = admin?.governmentKeyUsed || "GRAM-ADMIN-2026";
  const createdDate = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : t("admin.registered_account");

  return (
    <Shell portal="admin" title={t("admin.profile_title")} subtitle={officeName}>
      <Card elevated>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-xl bg-admin text-admin-foreground">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <p className="text-xl font-extrabold">{adminName}</p>
            <p className="text-base text-muted-foreground">{officeName}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Row label={t("admin.full_name")} value={adminName} />
          <Row label={t("admin.official_email")} value={adminEmail} />
          <Row label={t("admin.phone_number")} value={adminPhone} />
          <Row label={t("admin.office_department")} value={officeName} />
          <Row label={t("admin.gov_key_used")} value={govKey} />
          <Row label={t("admin.registration_date")} value={createdDate} />
          {admin?.questions && admin.questions.length > 0 ? (
            admin.questions.map((q, i) => (
              <Row key={i} label={t("admin.security_question_num", { num: i + 1 })} value={q.question} />
            ))
          ) : (
            <Row label={t("admin.security_questions_configured")} value={t("admin.security_questions_configured")} />
          )}
        </div>
      </Card>

      <Card elevated className="mt-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <KeyRound className="size-5 text-admin" /> {t("admin.change_password")}
        </h2>
        <form className="space-y-5" noValidate onSubmit={submit}>
          {error && <Alert tone="error">{error}</Alert>}
          {ok && <Alert tone="success">{t("admin.password_updated_success")}</Alert>}
          <Input
            label={t("admin.current_password")}
            type={showOld ? "text" : "password"}
            value={f.old}
            onChange={(e) => setF({ ...f, old: e.target.value })}
            error={touched ? errors.old : ""}
            rightElement={
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showOld ? "Hide current password" : "Show current password"}
              >
                {showOld ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />
          <Input
            label={t("admin.new_password")}
            type={showNext ? "text" : "password"}
            value={f.next}
            onChange={(e) => setF({ ...f, next: e.target.value })}
            error={touched ? errors.next : ""}
            hint="Minimum 8 characters, with one letter and one number."
            rightElement={
              <button
                type="button"
                onClick={() => setShowNext(!showNext)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showNext ? "Hide new password" : "Show new password"}
              >
                {showNext ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            }
          />
          <Input
            label={t("admin.confirm_new_password")}
            type={showConfirm ? "text" : "password"}
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
            error={touched ? errors.confirm : ""}
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
          <Button type="submit" variant="admin" full loading={loading} disabled={!valid}>
            {t("admin.update_password_btn")}
          </Button>
        </form>
      </Card>

      <Button
        variant="danger"
        full
        className="mt-5"
        icon={<LogOut className="size-5" />}
        onClick={() => {
          api.adminLogout();
          navigate("/admin/login", { replace: true });
        }}
      >
        {t("admin.logout_btn")}
      </Button>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border pb-3 last:border-0">
      <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
