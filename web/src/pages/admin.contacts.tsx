import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, Building2, UserCheck } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, EmptyState, Input, Modal, useToast } from "@/components/ui";
import type { Contact } from "@/lib/mock-data";
import { useApi, useStore } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedContactRole } from "@/lib/contentTranslation";

export default function ManageContacts() {
  const { db } = useStore();
  const { t, language } = useLanguage();
  const api = useApi();
  const toast = useToast();
  const [draft, setDraft] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = draft
    ? {
        name: draft.name.trim().length < 2 ? "Enter a valid official name." : "",
        role: draft.role.trim().length < 2 ? "Enter designation/role." : "",
        phone: !/^\d{10}$/.test(draft.phone.trim()) ? "Enter a valid 10-digit phone number." : "",
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
      title={t("admin.contacts_title") || "Manage Contacts Directory"}
      subtitle={t("admin.contacts_subtitle") || "Add, update or remove public contacts for citizens"}
      right={
        <Button
          variant="admin"
          icon={<Plus className="size-5" />}
          onClick={() => setDraft({ id: "", name: "", role: "Panchayat Secretary", phone: "", office: "Panchayat Office" })}
        >
          <span className="hidden sm:inline">{t("admin.add_contact") || "Add Contact"}</span>
        </Button>
      }
    >
      {db.contacts.length === 0 ? (
        <EmptyState
          icon={<Phone className="size-8" />}
          title={t("admin.no_contacts_title") || "No Contacts Listed"}
          description={t("admin.no_contacts_desc") || "Add official village contacts to display on the citizen portal."}
          action={
            <Button
              variant="admin"
              onClick={() => setDraft({ id: "", name: "", role: "Panchayat Secretary", phone: "", office: "Panchayat Office" })}
            >
              {t("admin.add_contact") || "Add Contact"}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {db.contacts.map((c) => {
            const transRole = getTranslatedContactRole(c.role, language as any);
            return (
              <Card key={c.id} elevated className="flex flex-col justify-between p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-foreground">{c.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-admin flex items-center gap-1 mt-0.5">
                        <UserCheck className="size-3.5" />
                        {transRole}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground pt-1">
                    <p className="flex items-center gap-2 font-medium">
                      <Phone className="size-4 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{c.phone}</span>
                    </p>
                    {c.office && (
                      <p className="flex items-center gap-2 text-xs">
                        <Building2 className="size-4 shrink-0" />
                        <span>{c.office}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button variant="outline" className="flex-1" icon={<Pencil className="size-4" />} onClick={() => setDraft(c)}>
                    {t("action.edit") || "Edit"}
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    icon={<Trash2 className="size-4" />}
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
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={draft?.id ? (t("admin.edit_contact") || "Edit Contact") : (t("admin.new_contact") || "New Official Contact")}>
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label={t("admin.contact_name") || "Officer Name"}
            value={draft?.name ?? ""}
            onChange={(e) => setDraft(draft ? { ...draft, name: e.target.value } : null)}
            error={errors.name}
          />
          <Input
            label={t("admin.contact_role") || "Role / Designation"}
            value={draft?.role ?? ""}
            onChange={(e) => setDraft(draft ? { ...draft, role: e.target.value } : null)}
            error={errors.role}
          />
          <Input
            label={t("admin.contact_phone") || "10-Digit Phone Number"}
            inputMode="numeric"
            value={draft?.phone ?? ""}
            onChange={(e) => setDraft(draft ? { ...draft, phone: e.target.value.replace(/\D/g, "").slice(0, 10) } : null)}
            error={errors.phone}
          />
          <Input
            label={t("admin.contact_office") || "Department / Office Location"}
            value={draft?.office ?? ""}
            onChange={(e) => setDraft(draft ? { ...draft, office: e.target.value } : null)}
          />
          <Button full loading={loading} disabled={!valid} onClick={save}>
            {t("action.save") || "Save Contact"}
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}
