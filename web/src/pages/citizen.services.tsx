import { useState } from "react";
import { HandHelping } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Select, StatusBadge, TextArea, useToast } from "@/components/ui";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Services() {
  const api = useApi();
  const toast = useToast();
  const { citizen, db } = useStore();
  const { t } = useLanguage();
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const serviceOptions = [
    { value: "Birth Certificate", label: t("service.birth_cert") },
    { value: "Death Certificate", label: t("service.death_cert") },
    { value: "Income Certificate", label: t("service.income_cert") },
    { value: "Water Tanker Request", label: t("service.tanker") },
    { value: "Street Light Installation", label: t("service.streetlight") },
    { value: "Ration Card Update", label: t("service.ration") },
  ];

  const typeError = !type ? t("services.err_type") : "";
  const detailsError = details.trim().length < 10 ? t("services.err_details") : "";
  const valid = !typeError && !detailsError;

  const mine = db.services
    .filter((s) => s.citizenId === citizen?.id || !s.citizenId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await api.createService({ type, details: details.trim() });
      toast(t("services.toast_sent"));
      setType("");
      setDetails("");
      setTouched(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell portal="citizen" title={t("services.screen_title")} subtitle={t("services.screen_subtitle")}>
      <Card elevated>
        <form className="space-y-5" noValidate onSubmit={submit}>
          {error && <Alert tone="error">{error}</Alert>}
          <Select
            label={t("services.label_type")}
            placeholder={t("services.placeholder_type")}
            options={serviceOptions}
            value={type}
            onChange={(e) => setType(e.target.value)}
            error={touched ? typeError : ""}
          />
          <TextArea
            label={t("services.label_details")}
            value={details}
            placeholder={t("services.placeholder_details")}
            onChange={(e) => setDetails(e.target.value)}
            error={touched ? detailsError : ""}
          />
          <Button type="submit" full loading={loading} disabled={!valid}>
            {t("services.btn_submit")}
          </Button>
        </form>
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-bold">{t("services.past_requests")}</h2>
      {mine.length === 0 ? (
        <EmptyState
          icon={<HandHelping className="size-8" />}
          title={t("services.empty_title")}
          description={t("services.empty_desc")}
        />
      ) : (
        <div className="space-y-3">
          {mine.map((s) => (
            <Card key={s.id} elevated>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-bold">
                  {
                    s.type === "Birth Certificate" ? t("service.birth_cert") :
                    s.type === "Death Certificate" ? t("service.death_cert") :
                    s.type === "Income Certificate" ? t("service.income_cert") :
                    s.type === "Water Tanker Request" ? t("service.tanker") :
                    s.type === "Street Light Installation" ? t("service.streetlight") :
                    s.type === "Ration Card Update" ? t("service.ration") : s.type
                  }
                </p>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-1 text-base text-muted-foreground">{s.details}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                #{s.id} · {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
