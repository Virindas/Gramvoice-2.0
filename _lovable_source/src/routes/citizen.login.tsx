import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/layout";
import { Alert, Button, Input, PinInput, useToast } from "@/components/ui";
import { useApi } from "@/lib/store";

export const Route = createFileRoute("/citizen/login")({
  head: () => ({
    meta: [
      { title: "Citizen Login — GramVoice" },
      { name: "description", content: "Sign in with your phone number and 4-digit PIN." },
      { property: "og:title", content: "Citizen Login — GramVoice" },
      { property: "og:description", content: "Sign in with your phone number and 4-digit PIN." },
    ],
  }),
  component: CitizenLogin,
});

function CitizenLogin() {
  const api = useApi();
  const navigate = useNavigate();
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const phoneError = !/^\d{10}$/.test(phone) ? "Enter your 10-digit phone number." : "";
  const pinError = pin.length !== 4 ? "Enter your 4-digit PIN." : "";
  const valid = !phoneError && !pinError;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.citizenLogin(phone, pin);
      toast("Welcome back!");
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
      title="Citizen sign in"
      subtitle="Use your phone number and the 4-digit PIN you created."
      footer={
        <span className="text-muted-foreground">
          New here?{" "}
          <Link to="/citizen/signup" className="font-bold text-primary underline">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label="Phone Number"
          inputMode="numeric"
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          error={touched ? phoneError : ""}
        />
        <PinInput
          label="4-digit PIN"
          value={pin}
          onChange={setPin}
          error={touched ? pinError : ""}
        />
        <Button type="submit" full loading={loading} disabled={!valid}>
          Sign in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Demo account: 9876543210 · PIN 1234
        </p>
      </form>
    </AuthLayout>
  );
}
