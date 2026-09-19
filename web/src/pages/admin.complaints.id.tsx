import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mic, Keyboard, Save, Inbox } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, LoadingSpinner, Select, StatusBadge, TextArea, useToast } from "@/components/ui";
import { STATUSES, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { db, hydrated } = useStore();
  const { t } = useLanguage();
  const api = useApi();
  const toast = useToast();
  const complaint = db.complaints.find((c) => c.id === id);

  const [status, setStatus] = useState<Status>(complaint?.status ?? "Under Review");
  const [reply, setReply] = useState(complaint?.reply ?? "");
  const [loading, setLoading] = useState(false);
  const { title: transTitle, body: transBody } = useTranslatedComplaint(complaint);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setReply(complaint.reply ?? "");
    }
  }, [complaint?.id, complaint?.status, complaint?.reply]);

  if (!complaint) {
    if (!hydrated) {
      return (
        <Shell portal="admin" title="Loading complaint…">
          <LoadingSpinner label="Loading complaint…" />
        </Shell>
      );
    }
    return (
      <Shell portal="admin" title={t("admin.not_found_title")}>
        <EmptyState
          icon={<Inbox className="size-8" />}
          title={t("admin.not_found_title")}
          description={t("admin.not_found_desc")}
          action={
            <Link to="/admin/complaints">
              <Button variant="admin">{t("admin.back_to_complaints")}</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  async function save() {
    setLoading(true);
    try {
      await api.updateComplaint(complaint!.id, { status, reply });
      toast(t("admin.complaint_updated"));
    } catch (err: any) {
      toast(err.message || t("admin.complaint_update_failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={t("admin.detail_title", { id: complaint.id })}
      subtitle={`${t("admin.submitted_by", { name: complaint.citizenName })} · ${new Date(complaint.createdAt).toLocaleDateString()}`}
      right={
        <Link to="/admin/complaints">
          <Button variant="outline" icon={<ArrowLeft className="size-5" />}>
            {t("action.back") || "Back"}
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Card elevated className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">{transTitle || complaint.title}</h2>
            <StatusBadge status={complaint.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {complaint.mode === "voice" ? (
              <>
                <Mic className="size-4 text-primary" /> {t("admin.recorded_via_voice")}
              </>
            ) : (
              <>
                <Keyboard className="size-4 text-muted-foreground" /> {t("admin.typed_manually")}
              </>
            )}
            <span>•</span>
            <span>{t("admin.phone_prefix")}: {complaint.citizenPhone}</span>
            <span>•</span>
            <span className="font-bold text-accent-foreground">
              {t("admin.ward_prefix")}: {db.citizens.find((c) => c.id === complaint.citizenId)?.ward || (complaint as any).citizenId?.ward || "Ward 1"}
            </span>
          </div>

          <p className="text-base text-foreground leading-relaxed">
            {transBody || complaint.complaint_text || complaint.body || ((complaint.voice_recording_url || complaint.mode === "voice") ? t("voiceRecordingSubmitted") : "No complaint text provided")}
          </p>

          {(complaint.voice_recording_url || complaint.mode === "voice") && (
            <div className="mt-3 p-3 rounded-xl bg-primary-soft border border-border">
              <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">{t("admin.original_voice_rec")}:</p>
              <audio
                controls
                preload="metadata"
                className="w-full h-10 rounded-lg"
                src={complaint.voice_recording_url || `http://localhost:5000/api/complaints/${complaint.id}/audio`}
              />
            </div>
          )}
        </Card>

        <Card elevated className="space-y-4">
          <h3 className="text-lg font-bold">{t("admin.response_action_title")}</h3>

            <Select
              label={t("admin.update_status_label")}
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              options={[...STATUSES]}
            />

          <div className="space-y-2">
            <TextArea
              label={t("admin.official_response_label")}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t("admin.response_placeholder")}
              rows={4}
            />
          </div>

          <Button
            variant="admin"
            loading={loading}
            icon={<Save className="size-5" />}
            onClick={save}
          >
            {t("admin.save_changes")}
          </Button>
        </Card>
      </div>
    </Shell>
  );
}
