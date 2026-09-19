import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Inbox, Mic, Plus } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui";
import { STATUSES, type Status, type Complaint } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint, getTranslatedTimelineNote } from "@/lib/contentTranslation";

function CitizenComplaintCard({ complaint }: { complaint: Complaint }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const { title, body, reply, isTranslated } = useTranslatedComplaint(complaint);
  const isVoice = complaint.mode === "voice" || Boolean(complaint.voice_recording_url);

  const displayTitle = title || complaint.title || (isVoice ? t("voiceRecordingSubmitted") : complaint.body);
  const displayBody = body || complaint.complaint_text || complaint.body || (isVoice ? t("voiceRecordingSubmitted") : "");

  return (
    <Card elevated className="overflow-hidden p-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-muted/40"
      >
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
            isVoice ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {isVoice ? <Mic className="size-5" /> : <span className="text-lg font-bold">#</span>}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <span className="text-sm font-semibold text-muted-foreground">
              #{complaint.id} · {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
            {isTranslated && language !== "en" && (
              <span className="text-xs italic text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {t("machineTranslatedTag") || "Translated"}
              </span>
            )}
          </span>
          <span className="mt-2 block text-lg font-bold text-foreground">
            {displayTitle}
          </span>
        </span>
        <ChevronDown
          className={cn("size-6 shrink-0 text-muted-foreground transition-transform mt-1", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-border px-5 py-5">
          {(complaint.voice_recording_url || complaint.mode === "voice") && (
            <div className="rounded-xl bg-primary-soft/30 p-3">
              <p className="mb-2 text-xs font-bold text-primary uppercase">{t("track.voice_submission.title")}</p>
              <audio
                controls
                preload="metadata"
                src={`/api/complaints/${complaint.id}/audio`}
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase">{t("track.text_submission.title")}</p>
            <p className="mt-1 text-base text-foreground leading-relaxed">
              {displayBody}
            </p>
          </div>

          {(reply || complaint.reply) && (
            <div className="rounded-xl bg-secondary-soft/60 p-4 border border-secondary/30">
              <p className="text-sm font-bold text-secondary-foreground">
                {t("track.reply_from_panchayat") || t("track.summary.remarks") || "Reply from the Panchayat"}
              </p>
              <p className="mt-1 text-base text-foreground font-medium">{reply || complaint.reply}</p>
            </div>
          )}

          {complaint.timeline && complaint.timeline.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-bold text-muted-foreground uppercase">
                {t("track.timeline.title")}
              </p>
              <ol className="space-y-4 border-l-2 border-border pl-5">
                {complaint.timeline.map((item, i) => (
                  <li key={i} className="relative">
                    <span className="absolute top-1.5 -left-[27px] size-3 rounded-full bg-primary ring-4 ring-background" />
                    <StatusBadge status={item.status} />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(item.at).toLocaleString()}
                      {item.note ? ` · ${getTranslatedTimelineNote(item.note, (language as any) || "en")}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function CitizenComplaints() {
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
    <Shell
      portal="citizen"
      title={t("track.title")}
      subtitle={t("track.subtitle")}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "min-h-12 rounded-xl border-2 px-4 text-base font-bold transition-colors",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
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
          title={t("track.empty.title")}
          description={t("track.empty.desc")}
          action={
            <Link to="/complaint/new">
              <Button>{t("track.empty.btn")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <CitizenComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </Shell>
  );
}
