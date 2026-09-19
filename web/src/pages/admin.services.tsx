import { useState } from "react";
import { HandHelping, CheckCircle2, Clock, Trash2, Edit3, MessageSquare, Filter } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Modal, StatusBadge, TextArea, Select, useToast } from "@/components/ui";
import { STATUSES, type ServiceRequest, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminServicesPage() {
  const { db } = useStore();
  const { t } = useLanguage();
  const api = useApi();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<Status>("Under Review");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredRequests = db.services.filter((s) => {
    if (activeTab === "all") return true;
    return s.status.toLowerCase() === activeTab.toLowerCase();
  });

  function openActionModal(req: ServiceRequest) {
    setSelectedRequest(req);
    setNewStatus(req.status || "Under Review");
    setReplyText(req.reply || "");
    setError("");
  }

  async function handleUpdateStatus() {
    if (!selectedRequest) return;
    setLoading(true);
    setError("");
    try {
      await api.updateServiceStatus(selectedRequest.id, {
        status: newStatus,
        reply: replyText.trim(),
      });
      toast(t("admin.service_updated") || "Service request updated successfully");
      setSelectedRequest(null);
    } catch (err: any) {
      setError(err.message || "Failed to update service request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={t("admin.services_title") || "Village Service Requests"}
      subtitle={t("admin.services_subtitle") || "Review and process citizen applications for village services"}
    >
      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === "all"
              ? "bg-admin text-admin-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All Requests ({db.services.length})
        </button>
        {STATUSES.map((st) => {
          const count = db.services.filter((s) => s.status.toLowerCase() === st.toLowerCase()).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setActiveTab(st)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                activeTab.toLowerCase() === st.toLowerCase()
                  ? "bg-admin text-admin-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<HandHelping className="size-8" />}
          title={t("admin.no_services_title") || "No Service Requests Found"}
          description={t("admin.no_services_desc") || "There are no applications matching the selected filter."}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <Card key={req.id} elevated className="p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1 text-xs font-black uppercase text-primary">
                      <HandHelping className="size-3.5" />
                      {req.type || req.serviceType || "Village Service"}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <h3 className="text-xl font-extrabold text-foreground">{req.type || "Service Request"}</h3>
                  <p className="text-base text-muted-foreground">{req.details || "No details provided."}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {new Date(req.createdAt).toLocaleString()}
                    </span>
                    {req.citizenName && (
                      <span className="font-bold text-foreground">
                        Applicant: {req.citizenName} {req.citizenPhone ? `(${req.citizenPhone})` : ""}
                      </span>
                    )}
                  </div>

                  {req.reply ? (
                    <div className="mt-3 rounded-lg bg-admin-soft/50 p-3 border border-admin/20">
                      <p className="text-xs font-bold text-admin uppercase flex items-center gap-1">
                        <MessageSquare className="size-3.5" />
                        Officer Remarks
                      </p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{req.reply}</p>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 md:flex-col md:w-36">
                  <Button
                    variant="admin"
                    className="flex-1 w-full"
                    icon={<Edit3 className="size-4" />}
                    onClick={() => openActionModal(req)}
                  >
                    Take Action
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 w-full"
                    icon={<Trash2 className="size-4" />}
                    onClick={async () => {
                      try {
                        await api.deleteServiceRequest(req.id);
                        toast(t("admin.service_deleted") || "Service request removed");
                      } catch (err: any) {
                        toast(err.message || "Failed to remove request");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Action / Update Status Modal */}
      <Modal
        open={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title="Update Service Request"
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5">Application Status</label>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Status)}
              options={STATUSES.map((s) => ({ label: s, value: s }))}
            />
          </div>

          <div>
            <TextArea
              label="Official Action Notes / Remarks"
              rows={3}
              value={replyText}
              placeholder="Record official action notes, approval comments, or resolution details for the citizen..."
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>

          <Button full variant="admin" loading={loading} onClick={handleUpdateStatus}>
            Save Status & Remarks
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}
