import { useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, ChevronRight, Mic, Keyboard } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, EmptyState, StatusBadge } from "@/components/ui";
import { STATUSES, type Status, type Complaint } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

function AdminComplaintCard({ complaint }: { complaint: Complaint }) {
  const { t } = useLanguage();
  const { title, body } = useTranslatedComplaint(complaint);
  const voiceUrl = complaint.voice_recording_url || (complaint.mode === "voice" ? `http://localhost:5000/api/complaints/${complaint.id}/audio` : null);
  const displayText = body || title || (voiceUrl ? t("voiceRecordingSubmitted") : "No description provided");

  return (
    <Card elevated className="space-y-3 transition-colors hover:bg-muted/30">
      <Link to={`/admin/complaints/${complaint.id}`} className="block">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              <span className="text-sm font-semibold text-muted-foreground">
                #{complaint.id} · {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
              {voiceUrl && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary-soft/50 px-2 py-0.5 rounded-md">
                  <Mic className="size-3" /> {t("admin.mode_voice")}
                </span>
              )}
              {!voiceUrl && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  <Keyboard className="size-3" /> {t("admin.mode_text")}
                </span>
              )}
            </div>
            <p className="mt-2 text-lg font-bold">{complaint.citizenName}</p>
            <p className={cn("mt-1 text-base text-foreground leading-relaxed")}>
              {displayText}
            </p>
          </div>
          <ChevronRight className="size-6 shrink-0 text-muted-foreground mt-1" />
        </div>
      </Link>

      {/* HTML <audio> player for voice complaint */}
      {voiceUrl && (
        <div
          className="pt-2 border-t border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase">{t("admin.original_voice_rec")}</span>
          </div>
          <audio
            controls
            preload="metadata"
            src={voiceUrl}
            className="w-full h-9 rounded-lg border border-border bg-background"
          />
        </div>
      )}
    </Card>
  );
}

export default function ComplaintsReview() {
  const { db } = useStore();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Status | "All">("All");

  const getStatusLabel = (s: string) => {
    if (s === "All") return t("admin.filter_all");
    if (s === "Under Review") return t("status.review");
    if (s === "In Progress") return t("status.progress");
    if (s === "Completed") return t("status.resolved");
    if (s === "Rejected") return t("status.rejected");
    return s;
  };

  const list = db.complaints
    .filter((c) => filter === "All" || c.status === filter)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <Shell portal="admin" title={t("admin.complaints_title")} subtitle={t("admin.complaints_subtitle")}>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "min-h-12 rounded-xl border-2 px-4 text-base font-bold transition-colors",
              filter === s
                ? "border-admin bg-admin text-admin-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {getStatusLabel(s)}
            <span className="ml-2 opacity-75">
              {s === "All" ? db.complaints.length : db.complaints.filter((c) => c.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-8" />}
          title={t("admin.empty_filter_title")}
          description={t("admin.empty_filter_desc")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <AdminComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </Shell>
  );
}
