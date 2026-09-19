import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Pencil, UserRound } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, Modal, TextArea, useToast } from "@/components/ui";
import { useStore, useApi, cleanAddress } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CitizenProfilePage() {
  const { citizen } = useStore();
  const api = useApi();
  const toast = useToast();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    name: citizen?.name ?? "",
    phone: citizen?.phone ?? "",
    address: cleanAddress(citizen?.address),
  });

  const translatedLang = language === "hi" ? "हिन्दी" : language === "ta" ? "தமிழ்" : "English";

  const errors = {
    name: f.name.trim().length < 3 ? t("profile.err_name") : "",
    phone: !/^\d{10}$/.test(f.phone) ? t("profile.err_phone") : "",
    address: f.address.trim().length > 0 && (f.address.trim().length < 5 || ["add", "n/a", "none"].includes(f.address.trim().toLowerCase())) ? t("profile.err_address") : "",
  };
  const valid = Object.values(errors).every((e) => !e);

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
      toast(t("profile.toast_updated"));
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="citizen" title={t("profile.screen_title")} subtitle={t("profile.screen_subtitle")}>
      <Card elevated className="flex flex-col items-center text-center">
        <div>
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
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">{citizen?.name}</h2>
        <p className="text-base text-muted-foreground">{translatedLang} · {citizen?.phone}</p>
      </Card>

      <Card elevated className="mt-5 space-y-4">
        <Row label={t("profile.full_name")} value={citizen?.name ?? ""} />
        <Row label={t("profile.phone_num")} value={citizen?.phone ?? ""} />
        <div className="border-b border-border pb-3 last:border-0">
          <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{t("profile.addr_field")}</p>
          {cleanAddress(citizen?.address) ? (
            <p className="text-base font-semibold">{cleanAddress(citizen?.address)}</p>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground italic">{t("profile.no_address")}</span>
              <button
                type="button"
                onClick={() => {
                  setF({
                    name: citizen?.name ?? "",
                    phone: citizen?.phone ?? "",
                    address: "",
                  });
                  setEditing(true);
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                + {t("profile.add_address")}
              </button>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          full
          icon={<Pencil className="size-5" />}
          onClick={() => {
            setF({
              name: citizen?.name ?? "",
              phone: citizen?.phone ?? "",
              address: cleanAddress(citizen?.address),
            });
            setEditing(true);
          }}
        >
          {t("profile.btn_edit")}
        </Button>
      </Card>

      <Button
        variant="danger"
        full
        className="mt-5"
        icon={<LogOut className="size-5" />}
        onClick={() => {
          api.citizenLogout();
          navigate("/citizen/login", { replace: true });
        }}
      >
        {t("profile.btn_logout")}
      </Button>

      <Modal open={editing} onClose={() => setEditing(false)} title={t("profile.edit_title")}>
        <div className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label={t("profile.full_name")}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label={t("profile.phone_num")}
            inputMode="numeric"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            error={errors.phone}
          />
          <TextArea
            label={t("profile.addr_field")}
            rows={3}
            value={f.address}
            onChange={(e) => setF({ ...f, address: e.target.value })}
            error={errors.address}
          />
          <Button full loading={loading} disabled={!valid} onClick={save}>
            {t("profile.btn_save")}
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
