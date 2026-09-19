import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Plus, Pencil, Trash2, Phone, Building2, UserCheck } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Input, Modal, theme, useToast } from "@/components/ui";
import type { Contact } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedContactRole } from "@/lib/contentTranslation";

export default function AdminContactsScreen() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        name: draft.name.trim().length < 2 ? "Enter official name." : "",
        role: draft.role.trim().length < 2 ? "Enter designation/role." : "",
        phone: !/^\d{10}$/.test(draft.phone.trim()) ? "Enter 10-digit mobile number." : "",
      }
    : { name: "", role: "", phone: "" };
  const valid = Object.values(errors).every((e) => !e);

  async function save() {
    if (!draft || !valid) return;
    setLoading(true);
    setError("");
    try {
      await api.saveContact(draft);
      toast(t("admin.contact_saved") || "Contact saved successfully!");
      setDraft(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell
      portal="admin"
      title={t("admin.contacts_title") || "Directory Contacts"}
      subtitle={t("admin.contacts_subtitle") || "Manage official contacts for citizens"}
    >
      <View style={{ marginBottom: 16 }}>
        <Button
          variant="admin"
          full
          icon={<Plus size={18} color="#ffffff" />}
          onClick={() => setDraft({ id: "", name: "", role: "Panchayat Secretary", phone: "", office: "Panchayat Office" })}
        >
          {t("admin.add_contact") || "Add Official Contact"}
        </Button>
      </View>

      {db.contacts.length === 0 ? (
        <Card elevated style={{ alignItems: "center", paddingVertical: 32 }}>
          <Phone size={36} color={theme.colors.mutedForeground} />
          <Text style={styles.emptyTitle}>{t("admin.no_contacts_title") || "No Contacts Listed"}</Text>
          <Text style={styles.emptyDesc}>
            {t("admin.no_contacts_desc") || "Add official village contacts to display on the citizen portal."}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {db.contacts.map((c) => {
            const transRole = getTranslatedContactRole(c.role, language as any);
            return (
              <Card key={c.id} elevated style={{ padding: 16 }}>
                <View style={styles.cardHeader}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{transRole}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Phone size={16} color={theme.colors.primary} />
                  <Text style={styles.phoneText}>{c.phone}</Text>
                </View>

                {c.office ? (
                  <View style={[styles.infoRow, { marginTop: 4 }]}>
                    <Building2 size={15} color={theme.colors.mutedForeground} />
                    <Text style={styles.officeText}>{c.office}</Text>
                  </View>
                ) : null}

                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <Button
                      full
                      variant="outline"
                      icon={<Pencil size={15} color={theme.colors.foreground} />}
                      onClick={() => setDraft(c)}
                    >
                      {t("action.edit") || "Edit"}
                    </Button>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      full
                      variant="danger"
                      icon={<Trash2 size={15} color={theme.colors.destructiveForeground} />}
                      onClick={async () => {
                        try {
                          await api.deleteContact(c.id);
                          toast(t("admin.contact_deleted") || "Contact deleted");
                        } catch (err: any) {
                          toast(err.message || "Failed to delete contact");
                        }
                      }}
                    >
                      {t("action.delete") || "Delete"}
                    </Button>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? "Edit Contact" : "New Official Contact"}>
        <View style={{ gap: 14 }}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input
            label="Officer Name"
            value={draft?.name ?? ""}
            onChangeText={(v: string) => setDraft(draft ? { ...draft, name: v } : null)}
            error={errors.name}
          />
          <Input
            label="Role / Designation"
            value={draft?.role ?? ""}
            onChangeText={(v: string) => setDraft(draft ? { ...draft, role: v } : null)}
            error={errors.role}
          />
          <Input
            label="10-Digit Phone Number"
            inputMode="numeric"
            value={draft?.phone ?? ""}
            onChangeText={(v: string) => setDraft(draft ? { ...draft, phone: v.replace(/\D/g, "").slice(0, 10) } : null)}
            error={errors.phone}
          />
          <Input
            label="Department / Office Location"
            value={draft?.office ?? ""}
            onChangeText={(v: string) => setDraft(draft ? { ...draft, office: v } : null)}
          />
          <Button full loading={loading} disabled={!valid} onClick={save}>
            {t("action.save") || "Save Contact"}
          </Button>
        </View>
      </Modal>
    </Shell>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "flex-start",
    marginBottom: 10,
  },
  contactName: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  roleBadge: {
    backgroundColor: theme.colors.adminSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.admin,
    textTransform: "uppercase",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  officeText: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
