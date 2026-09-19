import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, useToast } from "@/components/ui";
import type { Admin } from "@/lib/mock-data";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recover Administrator Password — GramVoice" },
      {
        name: "description",
        content: "Reset your administrator password by answering your security questions.",
      },
      { property: "og:title", content: "Recover Administrator Password — GramVoice" },
      {
        property: "og:description",
        content: "Reset your administrator password by answering your security questions.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [account, setAccount] = useState<Admin | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [pw, setPw] = useState({ password: "", confirm: "" });
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
  const answersValid = answers.every((a) => a.trim().length > 1);
  const pwError =
    pw.password.length < 8 || !/[A-Za-z]/.test(pw.password) || !/\d/.test(pw.password)
      ? "At least 8 characters, with one letter and one number."
      : "";
  const confirmError = pw.confirm !== pw.password ? "Passwords do not match." : "";

  return (
    <AuthLayout
      portal="admin"
      title="Recover your password"
      subtitle={`Step ${step} of 3 — no email or OTP required.`}
      footer={
        <Link to="/admin/login" className="font-bold text-admin underline">
          Back to sign in
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
              setTouched(false);
              setStep(2);
            });
          }}
        >
          <Input
            label="Email or Phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={touched ? idError : ""}
          />
          <Button type="submit" variant="admin" full loading={loading} disabled={!!idError}>
            Find my account
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
          <Alert tone="info">Answer both questions exactly as you set them at registration.</Alert>
          {account.questions.map((q, i) => (
            <Input
              key={q.question}
              label={q.question}
              value={answers[i] ?? ""}
              onChange={(e) =>
                setAnswers(answers.map((a, idx) => (idx === i ? e.target.value : a)))
              }
              error={touched && (answers[i] ?? "").trim().length < 2 ? "Enter an answer." : ""}
            />
          ))}
          <Button type="submit" variant="admin" full loading={loading} disabled={!answersValid}>
            Verify answers
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
              toast("Password updated. Please sign in.");
              navigate({ to: "/admin/login" });
            });
          }}
        >
          <Input
            label="New Password"
            type="password"
            value={pw.password}
            onChange={(e) => setPw({ ...pw, password: e.target.value })}
            error={touched ? pwError : ""}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            error={touched ? confirmError : ""}
          />
          <Button
            type="submit"
            variant="admin"
            full
            loading={loading}
            disabled={!!pwError || !!confirmError}
          >
            Save new password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
