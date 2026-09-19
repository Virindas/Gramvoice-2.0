import { Link } from "react-router-dom";
import { Mic, ClipboardList, Scale, Megaphone, HandHelping, Phone } from "lucide-react";
import { Shell } from "@/components/layout";
import { Card, StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint, getTranslatedAnnouncement, getTranslatedCategory } from "@/lib/contentTranslation";
import type { Complaint } from "@/lib/mock-data";

function CitizenRecentComplaintRow({ complaint, index }: { complaint: Complaint; index: number }) {
  const { t, language } = useLanguage();
  const { title, body, category } = useTranslatedComplaint(complaint);
  const refId = `#CMP-${(complaint.id || String(index + 1)).slice(-4).toUpperCase()}`;
  const dateStr = complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const isVoice = complaint.mode === "voice" || Boolean(complaint.voice_recording_url);
  const textSummary = title || body || (isVoice ? t("voiceRecordingSubmitted") : "Complaint registered");
  const catLabel = category || getTranslatedCategory((complaint as any).category || "General", language as any);

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-muted-foreground">{refId}</span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
            {catLabel}
          </span>
        </div>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground line-clamp-1">{textSummary}</p>
      <p className="mt-1 text-xs text-muted-foreground">{dateStr}</p>
    </div>
  );
}

export default function CitizenHome() {
  const { db, citizen } = useStore();
  const { t, language } = useLanguage();

  const tiles = [
    {
      to: "/citizen/complaint/new",
      label: t("dash.btn.record"),
      hint: t("dash.btn.record_desc"),
      icon: Mic,
      tone: "bg-primary-soft text-primary border-primary/20",
    },
    {
      to: "/citizen/complaints",
      label: t("dash.btn.track"),
      hint: t("dash.btn.track_desc"),
      icon: ClipboardList,
      tone: "bg-review-soft text-review border-review/20",
    },
    {
      to: "/citizen/rulebook",
      label: t("dash.info.rules"),
      hint: t("dash.info.rules_desc"),
      icon: Scale,
      tone: "bg-progress-soft text-progress border-progress/20",
    },
    {
      to: "/citizen/services",
      label: t("dash.btn.services"),
      hint: t("dash.btn.services_desc"),
      icon: HandHelping,
      tone: "bg-accent-soft text-accent-foreground border-accent/20",
    },
    {
      to: "/citizen/contacts",
      label: t("dash.hub.contacts"),
      hint: t("dash.hub.contacts_desc"),
      icon: Phone,
      tone: "bg-completed-soft text-completed border-completed/20",
    },
  ];

  const greeting = citizen ? citizen.name : t("dash.welcome");
  const rawWard = citizen?.ward || "1";
  const cleanWard = String(rawWard).replace(/^(Ward|वार्ड|வார்டு)\s*/i, "").trim() || "1";
  const wardSubtitle = t("dash.tagline", { ward: cleanWard });

  const recentComplaints = (db.complaints || [])
    .filter((c) => !citizen || c.citizenId === citizen.id || c.citizenPhone === citizen.phone)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <Shell
      portal="citizen"
      title={greeting}
      subtitle={wardSubtitle}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tItem) => (
          <Link
            key={tItem.to}
            to={tItem.to}
            className="group block rounded-2xl border-2 border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
          >
            <span
              className={`mb-4 inline-flex size-14 items-center justify-center rounded-2xl border ${tItem.tone}`}
            >
              <tItem.icon className="size-7" />
            </span>
            <span className="block text-lg font-bold text-foreground">{tItem.label}</span>
            <span className="block text-sm text-muted-foreground mt-0.5">{tItem.hint}</span>
          </Link>
        ))}
      </div>

      {/* Recent Submissions Card */}
      {recentComplaints.length > 0 && (
        <Card elevated className="mt-6">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base font-bold text-muted-foreground uppercase tracking-wide">
              {t("dash.recent_submissions")}
            </h2>
            <Link to="/citizen/complaints" className="text-sm font-bold text-primary hover:underline">
              {t("dash.btn.track")} →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentComplaints.map((c, idx) => (
              <CitizenRecentComplaintRow key={c.id || idx} complaint={c} index={idx} />
            ))}
          </div>
        </Card>
      )}

      {/* Announcements Section */}
      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
          <Megaphone className="size-5 text-primary" /> {t("dash.announcements")}
        </h2>
        <div className="space-y-3">
          {db.announcements.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <Megaphone className="size-8 opacity-40 mb-2" />
              <p className="font-semibold text-sm">{t("home.noAnnouncements") || "No announcements right now"}</p>
              <p className="text-xs text-muted-foreground/80 mt-1">{t("citizen.no_announcements_hint")}</p>
            </Card>
          ) : (
            db.announcements.map((a) => {
              const transAnn = getTranslatedAnnouncement(a, language as any);
              return (
                <Card key={a.id} className="border-border bg-card">
                  <p className="font-bold text-foreground">{transAnn.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{transAnn.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(a.date).toLocaleDateString()}
                  </p>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </Shell>
  );
}
