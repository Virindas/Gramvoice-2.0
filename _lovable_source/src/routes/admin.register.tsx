import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, Select, useToast } from "@/components/ui";
import { ADMIN_KEY, SECURITY_QUESTIONS } from "@/lib/mock-data";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/admin/register")({
  head: () => ({
    meta: [
      { title: "Administrator Registration — GramVoice" },
      {
        name: "description",
        content: "Register a Panchayat administrator account with a Government Registration Key.",
      },
      { property: "og:title", content: "Administrator Registration — GramVoice" },
      {
        property: "og:description",
        content: "Register a Panchayat administrator account with a Government Registration Key.",
      },
    ],
  }),
  component: AdminRegister,
});

function AdminRegister() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

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
    key: f.key.trim() !== ADMIN_KEY ? "This registration key is not recognised." : "",
    name: f.name.trim().length < 3 ? "Enter your full name." : "",
    office: f.office.trim().length < 3 ? "Enter your office or department." : "",
    email: !/^\S+@\S+\.\S+$/.test(f.email) ? "Enter a valid email address." : "",
    phone: !/^\d{10}$/.test(f.phone) ? "Phone number must be exactly 10 digits." : "",
    password:
      f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)
        ? "At least 8 characters, with one letter and one number."
        : "",
    confirm: f.confirm !== f.password ? "Passwords do not match." : "",
  };
  const step1Valid = Object.values(e1).every((x) => !x);

  const e2 = {
    q: q.q1 === q.q2 ? "Choose two different questions." : "",
    a1: q.a1.trim().length < 2 ? "Enter an answer." : "",
    a2: q.a2.trim().length < 2 ? "Enter an answer." : "",
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
        name: f.name.trim(),
        office: f.office.trim(),
        email: f.email.trim(),
        phone: f.phone,
        password: f.password,
        questions: [
          { question: q.q1, answer: q.a1.trim() },
          { question: q.q2, answer: q.a2.trim() },
        ],
      });
      toast("Administrator account created. Please sign in.");
      navigate({ to: "/admin/login" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="admin"
      title={step === 1 ? "Administrator registration" : "Set security questions"}
      subtitle={
        step === 1
          ? "Step 1 of 2 — official details"
          : "Step 2 of 2 — used only to recover your password"
      }
      footer={
        <span className="text-muted-foreground">
          Already registered?{" "}
          <Link to="/admin/login" className="font-bold text-admin underline">
            Sign in
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
            label="Government Registration Key"
            value={f.key}
            placeholder="GRAM-ADMIN-XXXX"
            onChange={(e) => setF({ ...f, key: e.target.value.toUpperCase() })}
            error={touched ? e1.key : ""}
            hint="Issued by the district office."
          />
          <Input
            label="Full Name"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            error={touched ? e1.name : ""}
          />
          <Input
            label="Office / Department"
            value={f.office}
            placeholder="Panchayat Development Office"
            onChange={(e) => setF({ ...f, office: e.target.value })}
            error={touched ? e1.office : ""}
          />
          <Input
            label="Email"
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            error={touched ? e1.email : ""}
          />
          <Input
            label="Phone Number"
            inputMode="numeric"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            error={touched ? e1.phone : ""}
          />
          <Input
            label="Password"
            type="password"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            error={touched ? e1.password : ""}
            hint="Minimum 8 characters, including a letter and a number."
          />
          <Input
            label="Confirm Password"
            type="password"
            value={f.confirm}
            onChange={(e) => setF({ ...f, confirm: e.target.value })}
            error={touched ? e1.confirm : ""}
          />
          <Button type="submit" variant="admin" full disabled={!step1Valid}>
            Continue to security questions
          </Button>
        </form>
      ) : (
        <form className="space-y-5" noValidate onSubmit={finish}>
          <Select
            label="Security question 1"
            options={SECURITY_QUESTIONS}
            value={q.q1}
            onChange={(e) => setQ({ ...q, q1: e.target.value })}
            error={touched ? e2.q : ""}
          />
          <Input
            label="Answer 1"
            value={q.a1}
            onChange={(e) => setQ({ ...q, a1: e.target.value })}
            error={touched ? e2.a1 : ""}
          />
          <Select
            label="Security question 2"
            options={SECURITY_QUESTIONS}
            value={q.q2}
            onChange={(e) => setQ({ ...q, q2: e.target.value })}
          />
          <Input
            label="Answer 2"
            value={q.a2}
            onChange={(e) => setQ({ ...q, a2: e.target.value })}
            error={touched ? e2.a2 : ""}
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" variant="admin" full loading={loading} disabled={!step2Valid}>
              Complete registration
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
