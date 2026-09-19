import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, Card, StatusBadge } from "@/components/ui";
import { STATUSES, type Complaint } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslatedComplaint } from "@/lib/contentTranslation";

const tone: Record<string, string> = {
  "Under Review": "bg-review-soft text-review",
  "In Progress": "bg-progress-soft text-progress",
  Completed: "bg-completed-soft text-completed",
  Rejected: "bg-rejected-soft text-rejected",
};

function AdminRecentComplaintRow({ complaint }: { complaint: Complaint }) {
  const { title, body } = useTranslatedComplaint(complaint);
  return (
    <Link
      to={`/admin/complaints/${complaint.id}`}
      className="flex items-center gap-3 py-3 hover:bg-muted/40 transition-colors rounded-lg px-2"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{title || body}</p>
        <p className="text-sm text-muted-foreground">
          {complaint.citizenName} · {new Date(complaint.createdAt).toLocaleDateString()}
        </p>
      </div>
      <StatusBadge status={complaint.status} />
    </Link>
  );
}

export default function AdminHome() {
  const { db, admin } = useStore();
  const { t } = useLanguage();

  const getStatusLabel = (s: string) => {
    if (s === "Under Review") return t("status.review");
    if (s === "In Progress") return t("status.progress");
    if (s === "Completed") return t("status.resolved");
    if (s === "Rejected") return t("status.rejected");
    return s;
  };

  const counts = STATUSES.map((s) => ({
    status: s,
    n: db.complaints.filter((c) => c.status === s).length,
  }));
  const recent = [...db.complaints].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);

  const officeText = admin?.office || admin?.officeOrDepartment || t("admin.office_fallback");
  const subtitleText = `${officeText} · ${db.complaints.length} ${t("admin.total_complaints", { count: db.complaints.length })}`;

  return (
    <Shell
      portal="admin"
      title={t("admin.dash_title")}
      subtitle={subtitleText}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {counts.map((c) => (
          <Card key={c.status} elevated className={tone[c.status]}>
            <p className="text-4xl font-black">{c.n}</p>
            <p className="mt-1 text-base font-bold">{getStatusLabel(c.status)}</p>
          </Card>
        ))}
      </div>

      <Card elevated className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{t("admin.latest_complaints")}</h2>
          <Link to="/admin/complaints">
            <Button variant="admin" icon={<ArrowRight className="size-5" />}>
              {t("admin.review_all")}
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">{t("admin.no_complaints_yet")}</p>
          ) : (
            recent.map((c) => (
              <AdminRecentComplaintRow key={c.id} complaint={c} />
            ))
          )}
        </div>
      </Card>
    </Shell>
  );
}
