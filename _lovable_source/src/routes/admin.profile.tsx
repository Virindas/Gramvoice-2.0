import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, KeyRound, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, useToast } from "@/components/ui";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Administrator Profile — GramVoice" },
      { name: "description", content: "Your official details and password settings." },
      { property: "og:title", content: "Administrator Profile — GramVoice" },
      { property: "og:description", content: "Your official details and password settings." },
    ],
  }),
  component: AdminProfile,
});

function AdminProfile() {
  const { admin } = useStore();
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
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
      toast("Password changed.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="admin" title="Administrator profile" subtitle={admin?.office}>
      <Card elevated>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-xl bg-admin text-admin-foreground">
            <ShieldCheck className="size-7" />
          </span>
          <div>
            <p className="text-xl font-extrabold">{admin?.name}</p>
            <p className="text-base text-muted-foreground">{admin?.office}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Row label="Email" value={admin?.email ?? ""} />
          <Row label="Phone Number" value={admin?.phone ?? ""} />
          <Row label="Security question 1" value={admin?.questions[0]?.question ?? "—"} />
          <Row label="Security question 2" value={admin?.questions[1]?.question ?? "—"} />
        </div>
      </Card>

      <Card elevated className="mt-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <KeyRound className="size-5 text-admin" /> Change password
        </h2>
        <form className="space-y-5" noValidate onSubmit={submit}>
          {error && <Alert tone="error">{error}</Alert>}
          {ok && <Alert tone="success">Your password has been updated.</Alert>}
          <Input
            label="Current password"
            type="password"
            value={f.old}
            onChange={(e) => setF({ ...f, old: e.target.value })}
            error={touched ? errors.old : ""}
          />
          <Input
            label="New password"
            type="password"
            value={f.next}
            onChange={(e) => setF({ ...f, next: e.target.value })}
            error={touched ? errors.next : ""}
          />
          <Input
            label="Confirm new password"
            type="password"
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
            error={touched ? errors.confirm : ""}
          />
          <Button type="submit" variant="admin" full loading={loading} disabled={!valid}>
            Update password
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
          navigate({ to: "/admin/login", replace: true });
        }}
      >
        Log out
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
