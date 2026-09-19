import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { HandHelping, Clock, Trash2, Edit3, MessageSquare } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Modal, StatusBadge, TextArea, Select, theme, useToast } from "@/components/ui";
import { STATUSES, type ServiceRequest, type Status } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminServicesScreen() {
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
      title={t("admin.services_title") || "Service Requests"}
      subtitle={t("admin.services_subtitle") || "Process citizen village service requests"}
    >
      {/* Scrollable Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={[styles.filterChip, activeTab === "all" && styles.filterChipActive]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.filterChipText, activeTab === "all" && styles.filterChipTextActive]}>
              All ({db.services.length})
            </Text>
          </TouchableOpacity>
          {STATUSES.map((st) => {
            const count = db.services.filter((s) => s.status.toLowerCase() === st.toLowerCase()).length;
            const isActive = activeTab.toLowerCase() === st.toLowerCase();
            return (
              <TouchableOpacity
                key={st}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveTab(st)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {st} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {filteredRequests.length === 0 ? (
        <Card elevated style={{ alignItems: "center", paddingVertical: 32 }}>
          <HandHelping size={36} color={theme.colors.mutedForeground} />
          <Text style={styles.emptyTitle}>{t("admin.no_services_title") || "No Requests Found"}</Text>
          <Text style={styles.emptyDesc}>
            {t("admin.no_services_desc") || "There are no applications matching the selected filter."}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {filteredRequests.map((req) => (
            <Card key={req.id} elevated style={{ padding: 16 }}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <HandHelping size={14} color={theme.colors.primary} />
                  <Text style={styles.typeBadgeText}>{req.type || req.serviceType || "Service"}</Text>
                </View>
                <StatusBadge status={req.status} />
              </View>

              <Text style={styles.requestTitle}>{req.type || "Service Request"}</Text>
              <Text style={styles.requestDetails}>{req.details || "No details provided."}</Text>

              <View style={styles.metaRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Clock size={13} color={theme.colors.mutedForeground} />
                  <Text style={styles.metaText}>{new Date(req.createdAt).toLocaleDateString()}</Text>
                </View>
                {req.citizenName ? (
                  <Text style={styles.applicantText}>
                    By: {req.citizenName} {req.citizenPhone ? `(${req.citizenPhone})` : ""}
                  </Text>
                ) : null}
              </View>

              {req.reply ? (
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksLabel}>OFFICER REMARKS</Text>
                  <Text style={styles.remarksText}>{req.reply}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <Button
                    full
                    variant="admin"
                    icon={<Edit3 size={15} color={theme.colors.adminForeground} />}
                    onClick={() => openActionModal(req)}
                  >
                    Action
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    full
                    variant="danger"
                    icon={<Trash2 size={15} color={theme.colors.destructiveForeground} />}
                    onClick={async () => {
                      try {
                        await api.deleteServiceRequest(req.id);
                        toast(t("admin.service_deleted") || "Request removed");
                      } catch (err: any) {
                        toast(err.message || "Failed to remove request");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Action / Update Status Modal */}
      <Modal open={selectedRequest !== null} onClose={() => setSelectedRequest(null)} title="Update Service Request">
        <View style={{ gap: 14 }}>
          {error ? <Alert tone="error">{error}</Alert> : null}

          <View>
            <Text style={styles.modalLabel}>Application Status</Text>
            <Select
              value={newStatus}
              onChange={(v: string) => setNewStatus(v as Status)}
              options={STATUSES.map((s) => ({ label: s, value: s }))}
            />
          </View>

          <View>
            <Text style={styles.modalLabel}>Official Remarks / Reply</Text>
            <TextArea
              rows={3}
              value={replyText}
              placeholder="Record official comments or resolution remarks..."
              onChangeText={setReplyText}
            />
          </View>

          <Button full variant="admin" loading={loading} onClick={handleUpdateStatus}>
            Save Status & Remarks
          </Button>
        </View>
      </Modal>
    </Shell>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.muted,
  },
  filterChipActive: {
    backgroundColor: theme.colors.admin,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  filterChipTextActive: {
    color: theme.colors.adminForeground,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 4,
  },
  requestDetails: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  applicantText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  remarksBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.adminSoft,
    borderRadius: 8,
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.admin,
  },
  remarksText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginBottom: 6,
  },
});
