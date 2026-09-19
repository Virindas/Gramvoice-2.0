import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { HandHelping } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Select, StatusBadge, TextArea, theme, useToast } from "@/components/ui";
import { SERVICE_TYPES } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ServicesScreen() {
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

  const getServiceLabel = (srvType: string) => {
    switch (srvType) {
      case "Birth Certificate": return t("service.birth_cert");
      case "Death Certificate": return t("service.death_cert");
      case "Income Certificate": return t("service.income_cert");
      case "Water Tanker Request": return t("service.tanker");
      case "Street Light Installation": return t("service.streetlight");
      case "Ration Card Update": return t("service.ration");
      default: return srvType;
    }
  };

  const typeError = !type ? t("services.err_type") : "";
  const detailsError = details.trim().length < 10 ? t("services.err_details") : "";
  const valid = !typeError && !detailsError;

  const mine = db.services
    .filter((s) => s.citizenId === citizen?.id || !s.citizenId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  async function submit() {
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
      <Card elevated style={{ gap: 16 }}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Select
          label={t("services.label_type")}
          placeholder={t("services.placeholder_type")}
          options={serviceOptions}
          value={type}
          onChange={(val: any) => setType(typeof val === 'string' ? val : val?.target?.value || val)}
          error={touched ? typeError : ""}
        />
        <TextArea
          label={t("services.label_details")}
          value={details}
          placeholder={t("services.placeholder_details")}
          onChangeText={setDetails}
          error={touched ? detailsError : ""}
        />
        <Button full loading={loading} disabled={!valid} onClick={submit}>
          {t("services.btn_submit")}
        </Button>
      </Card>

      <Text style={styles.sectionHeader}>{t("services.past_requests")}</Text>
      {mine.length === 0 ? (
        <EmptyState
          icon={<HandHelping size={32} color={theme.colors.mutedForeground} />}
          title={t("services.empty_title")}
          description={t("services.empty_desc")}
        />
      ) : (
        <View style={{ gap: 10, marginTop: 8 }}>
          {mine.map((s) => (
            <Card key={s.id} elevated>
              <View style={styles.requestHeader}>
                <Text style={styles.requestType}>{getServiceLabel(s.type)}</Text>
                <StatusBadge status={s.status} />
              </View>
              <Text style={styles.requestDetails}>{s.details}</Text>
              <Text style={styles.requestDate}>
                #{s.id} · {new Date(s.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 24,
    marginBottom: 8,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestType: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  requestDetails: {
    fontSize: 15,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  requestDate: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 8,
  },
});
