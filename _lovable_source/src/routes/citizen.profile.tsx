import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, LogOut, Pencil, UserRound } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, Modal, TextArea, useToast } from "@/components/ui";
import { useApi, useStore } from "@/lib/store";

export const Route = createFileRoute("/citizen/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — GramVoice" },
      { name: "description", content: "Update your name, phone number, address and photo." },
      { property: "og:title", content: "Your Profile — GramVoice" },
      { property: "og:description", content: "Update your name, phone number, address and photo." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const api = useApi();
  const { citizen } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    name: citizen?.name ?? "",
    phone: citizen?.phone ?? "",
    address: citizen?.address ?? "",
  });

  const errors = {
    name: !/^[A-Za-z ]{3,50}$/.test(f.name.trim()) ? "Letters and spaces only, 3-50 characters." : "",
    phone: !/^\d{10}$/.test(f.phone) ? "Phone number must be exactly 10 digits." : "",
    address: f.address.trim().length < 5 ? "Please enter your address." : "",
  };
  const valid = Object.values(errors).every((e) => !e);

  function pickAvatar(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      void api.updateCitizen({ avatar: String(reader.result) });
      toast("Photo updated.");
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.updateCitizen({
        name: f.name.trim(),
        phone: f.phone,
        address: f.address.trim(),
      });
      toast("Profile updated.");
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="citizen" title="Your profile" subtitle="Keep your details up to date.">
      <Card elevated className="flex flex-col items-center text-center">
        <div className="relative">
          {citizen?.avatar ? (
            <img
              src={citizen.avatar}
              alt="Your profile"
              className="size-28 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-28 items-center justify-center rounded-full bg-primary-soft text-primary">
              <UserRound className="size-14" />
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Upload photo"
            className="absolute right-0 bottom-0 flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-soft"
          >
            <Camera className="size-5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickAvatar(e.target.files?.[0])}
          />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">{citizen?.name}</h2>
        <p className="text-base text-muted-foreground">{citizen?.language} · {citizen?.phone}</p>
      </Card>

      <Card elevated className="mt-5 space-y-4">
        <Row label="Full Name" value={citizen?.name ?? ""} />
        <Row label="Phone Number" value={citizen?.phone ?? ""} />
        <Row label="Address" value={citizen?.address ?? ""} />
        <Button
          variant="outline"
          full
          icon={<Pencil className="size-5" />}
          onClick={() => {
            setF({
              name: citizen?.name ?? "",
              phone: citizen?.phone ?? "",
              address: citizen?.address ?? "",
            });
            setEditing(true);
          }}
        >
          Edit details
        </Button>
      </Card>

      <Button
        variant="danger"
        full
        className="mt-5"
        icon={<LogOut className="size-5" />}
        onClick={() => {
          api.citizenLogout();
          navigate({ to: "/citizen/login", replace: true });
        }}
      >
        Log out
      </Button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit your details">
        <div className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label="Full Name"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Phone Number"
            inputMode="numeric"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            error={errors.phone}
          />
          <TextArea
            label="Address"
            rows={3}
            value={f.address}
            onChange={(e) => setF({ ...f, address: e.target.value })}
            error={errors.address}
          />
          <Button full loading={loading} disabled={!valid} onClick={save}>
            Save changes
          </Button>
        </div>
      </Modal>
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
