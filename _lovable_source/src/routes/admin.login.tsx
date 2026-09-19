import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administrator Login — GramVoice" },
      { name: "description", content: "Panchayat officials sign in to review citizen complaints." },
      { property: "og:title", content: "Administrator Login — GramVoice" },
      {
        property: "og:description",
        content: "Panchayat officials sign in to review citizen complaints.",
      },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
      toast("Signed in to the administration portal.");
      navigate({ to: "/admin/home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="admin"
      title="Administrator sign in"
      subtitle="Restricted to registered Panchayat officials."
      footer={
        <div className="space-y-1 text-muted-foreground">
          <p>
            Need an account?{" "}
            <Link to="/admin/register" className="font-bold text-admin underline">
              Register with your Government Key
            </Link>
          </p>
          <p>
            <Link to="/admin/forgot-password" className="font-bold text-admin underline">
              Forgot password?
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label="Email or Phone"
          value={identifier}
          placeholder="admin@gramvoice.in"
          onChange={(e) => setIdentifier(e.target.value)}
          error={touched ? idError : ""}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched ? pwError : ""}
        />
        <Button type="submit" variant="admin" full loading={loading} disabled={!valid}>
          Sign in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Demo account: admin@gramvoice.in · gram2026
        </p>
      </form>
    </AuthLayout>
  );
}
