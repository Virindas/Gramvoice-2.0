import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, Select, TextArea, useToast } from "@/components/ui";
import { LANGUAGES, type Language } from "@/lib/mock-data";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/citizen/signup")({
  head: () => ({
    meta: [
      { title: "Create Citizen Account — GramVoice" },
      {
        name: "description",
        content: "Register with your name, phone number, address and a 4-digit PIN.",
      },
      { property: "og:title", content: "Create Citizen Account — GramVoice" },
      {
        property: "og:description",
        content: "Register with your name, phone number, address and a 4-digit PIN.",
      },
    ],
  }),
  component: CitizenSignup,
});

function CitizenSignup() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({
    name: "",
    phone: "",
    address: "",
    language: "English" as Language,
    pin: "",
  });
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = {
    name: !/^[A-Za-z ]{3,50}$/.test(f.name.trim())
      ? "Use letters and spaces only, 3 to 50 characters."
      : "",
    phone: !/^\d{10}$/.test(f.phone) ? "Phone number must be exactly 10 digits." : "",
    address: f.address.trim().length < 5 ? "Please enter your address." : "",
    pin: f.pin.length !== 4 ? "Choose a 4-digit PIN." : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.citizenSignup({
        name: f.name.trim(),
        phone: f.phone,
        address: f.address.trim(),
        language: f.language,
        pin: f.pin,
      });
      toast("Account created. Welcome to GramVoice!");
      navigate({ to: "/citizen/home" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      portal="citizen"
      title="Create your account"
      subtitle="No email, no password — just your phone number and a PIN."
      footer={
        <span className="text-muted-foreground">
          Already registered?{" "}
          <Link to="/citizen/login" className="font-bold text-primary underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label="Full Name"
          value={f.name}
          placeholder="e.g. Lakshmi Devi"
          onChange={(e) => setF({ ...f, name: e.target.value })}
          error={touched ? errors.name : ""}
        />
        <Input
          label="Phone Number"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          error={touched ? errors.phone : ""}
        />
        <TextArea
          label="Address"
          rows={3}
          placeholder="House number, street, village"
          value={f.address}
          onChange={(e) => setF({ ...f, address: e.target.value })}
          error={touched ? errors.address : ""}
        />
        <Select
          label="Preferred Language"
          options={[...LANGUAGES]}
          value={f.language}
          onChange={(e) => setF({ ...f, language: e.target.value as Language })}
        />
        <PinInput
          label="Set a 4-digit PIN"
          value={f.pin}
          onChange={(v) => setF({ ...f, pin: v })}
          hint="You will use this PIN every time you sign in. Do not share it."
          error={touched ? errors.pin : ""}
        />
        <Button type="submit" full loading={loading} disabled={!valid}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
