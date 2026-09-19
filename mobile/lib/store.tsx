import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { saveUser, getUser, logout, type UserSession } from "./auth";
import { api } from "./api";
import {
  type Admin,
  type Announcement,
  type Citizen,
  type Complaint,
  type Contact,
  type Rule,
  type ServiceRequest,
  type Status,
  seedCitizens,
  seedAdmins,
  seedComplaints,
  seedRules,
  seedAnnouncements,
  seedServices,
  seedContacts,
} from "./mock-data";

export function cleanAddress(addr?: string | null): string {
  if (!addr) return '';
  const trimmed = String(addr).trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'add' || lower === 'n/a' || lower === 'na' || lower === 'none' || lower === 'null' || lower === 'undefined' || trimmed.length < 4) {
    return '';
  }
  return trimmed;
}

interface Database {
  citizens: Citizen[];
  admins: Admin[];
  complaints: Complaint[];
  rules: Rule[];
  announcements: Announcement[];
  services: ServiceRequest[];
  contacts: Contact[];
}

const initialDb: Database = {
  citizens: seedCitizens,
  admins: seedAdmins,
  complaints: seedComplaints,
  rules: seedRules,
  announcements: seedAnnouncements,
  services: seedServices,
  contacts: seedContacts,
};

interface StoreContextValue {
  db: Database;
  citizen: Citizen | null;
  admin: Admin | null;
  hydrated: boolean;
  setDb: React.Dispatch<React.SetStateAction<Database>>;
  setCitizen: React.Dispatch<React.SetStateAction<Citizen | null>>;
  setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database>(initialDb);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      const citizenUser = await getUser('citizen');
      const adminUser = await getUser('admin');
      const user = (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin')) ? adminUser : (citizenUser || adminUser);
      
      const [rulesRes, annRes, contactsRes, servicesRes] = await Promise.allSettled([
        api.getVillageInfo(),
        api.getAnnouncements(),
        api.getContacts(),
        api.getServices(),
      ]);

      const rulesData = rulesRes.status === 'fulfilled' && rulesRes.value ? (rulesRes.value.rules || rulesRes.value) : [];
      const annData = annRes.status === 'fulfilled' && annRes.value ? (annRes.value.announcements || annRes.value) : [];
      const contactsData = contactsRes.status === 'fulfilled' && contactsRes.value ? (contactsRes.value.contacts || contactsRes.value) : [];
      const servicesData = servicesRes.status === 'fulfilled' && servicesRes.value ? (servicesRes.value.requests || servicesRes.value) : [];

      let complaintsData: any[] = [];
      const relevantToken = (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin')) ? adminUser?.token : (citizenUser?.token || adminUser?.token);
      if (relevantToken) {
        try {
          const compRes = (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/admin')) ? await api.getAllComplaints() : await api.getMyComplaints();
          complaintsData = compRes.complaints || compRes || [];
        } catch {
          /* ignore complaint fetch failure if unauthorized */
        }

        try {
          const meRes = await api.getMe();
          if (meRes?.user && user) {
            const updatedUser = {
              ...user,
              name: meRes.user.fullName || meRes.user.name || user.name,
              phone: meRes.user.phoneNumber || meRes.user.phone || user.phone,
              email: meRes.user.email || user.email,
              address: cleanAddress(meRes.user.address || user.address),
              ward: meRes.user.ward || user.ward,
              avatar: meRes.user.avatar || meRes.user.avatarUrl || user.avatar,
              department: meRes.user.officeOrDepartment || meRes.user.department || user.department,
              officeOrDepartment: meRes.user.officeOrDepartment || meRes.user.department || user.officeOrDepartment,
              governmentKeyUsed: meRes.user.governmentKeyUsed || user.governmentKeyUsed,
              createdAt: meRes.user.createdAt || user.createdAt,
              securityQuestions: meRes.user.securityQuestions || user.securityQuestions,
            };
            await saveUser(updatedUser);
          }
        } catch {
          /* ignore */
        }
      }

      const rules: Rule[] = (Array.isArray(rulesData) ? rulesData : []).map((r: any) => ({
        id: r._id || r.id,
        section: r.category || 'General',
        title: r.title || 'Village Rule',
        body: r.content || r.body || '',
      }));

      const announcements: Announcement[] = (Array.isArray(annData) ? annData : []).map((a: any) => ({
        id: a._id || a.id,
        title: a.title,
        body: a.content || a.description || a.body || '',
        date: a.createdAt || a.created_at || a.date || new Date().toISOString(),
      }));

      const contacts: Contact[] = (Array.isArray(contactsData) ? contactsData : []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        role: c.role || c.designation || 'Staff',
        phone: c.phone,
        office: c.office || c.department || 'Panchayat',
      }));

      const complaints: Complaint[] = (Array.isArray(complaintsData) ? complaintsData : []).map((c: any) => {
        const rawCitizenId = typeof c.citizenId === 'object' ? (c.citizenId?._id || c.citizenId?.id) : (c.citizenId || c.user_id);
        const citizenIdStr = rawCitizenId ? String(rawCitizenId) : '';
        const citizenNameStr = typeof c.citizenId === 'object' ? (c.citizenId?.fullName || c.citizenId?.name) : (c.villager || c.citizenName || 'Citizen');
        const citizenPhoneStr = typeof c.citizenId === 'object' ? (c.citizenId?.phoneNumber || c.citizenId?.phone) : (c.phone || c.citizenPhone || '');
        const compText = c.transcript || c.textDescription || c.body || '';
        const voiceUrl = c.voice_recording_url || (c.audioFileId || c.type === 'voice' ? `http://localhost:5000/api/complaints/${c.id || c._id}/audio` : undefined);
        const titleText = compText.split('\n')[0]?.slice(0, 50) || c.title || 'Complaint';
        const modeType = c.type === 'voice' || c.inputMethod?.toLowerCase() === 'voice' || voiceUrl ? 'voice' : 'text';

        return {
          id: c.id || String(c._id || ''),
          citizenId: citizenIdStr,
          citizenName: citizenNameStr,
          citizenPhone: citizenPhoneStr,
          title: titleText,
          body: compText,
          mode: modeType,
          voice_recording_url: voiceUrl,
          status: (c.status as Status) || 'Under Review',
          reply: c.adminReply || c.adminNotes || c.reply || '',
          createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          timeline: c.timeline || [{ status: c.status || 'Under Review', at: c.createdAt || c.created_at || new Date().toISOString(), note: 'Submitted' }],
        };
      });

      const activeCitizen: Citizen | null = citizenUser ? {
        id: citizenUser.id,
        name: citizenUser.name,
        phone: citizenUser.phone,
        pin: '1234',
        address: cleanAddress(citizenUser.address),
        language: (citizenUser.language as any) || 'English',
        avatar: citizenUser.avatar,
      } : null;

      const activeAdmin: Admin | null = adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        fullName: adminUser.name,
        phone: adminUser.phone,
        phoneNumber: adminUser.phone,
        email: adminUser.email || (adminUser.username ? `${adminUser.username}@panchayat.gov.in` : ''),
        password: '',
        office: adminUser.officeOrDepartment || adminUser.department || 'Panchayat Office',
        officeOrDepartment: adminUser.officeOrDepartment || adminUser.department || 'Panchayat Office',
        governmentKeyUsed: adminUser.governmentKeyUsed || 'GRAM-ADMIN-2026',
        createdAt: adminUser.createdAt,
        questions: (adminUser.securityQuestions || []).map((q: any) => ({
          question: q.question,
          answer: '',
        })),
      } : null;

      const services: ServiceRequest[] = (Array.isArray(servicesData) ? servicesData : []).map((s: any) => {
        const rawCitizenId = typeof s.citizenId === 'object' ? (s.citizenId?._id || s.citizenId?.id) : (s.citizenId || s.user_id);
        const citizenIdStr = rawCitizenId ? String(rawCitizenId) : '';
        const citizenNameStr = typeof s.citizenId === 'object' ? (s.citizenId?.fullName || s.citizenId?.name) : (s.villager || s.citizenName || 'Citizen');
        const citizenPhoneStr = typeof s.citizenId === 'object' ? (s.citizenId?.phoneNumber || s.citizenId?.phone) : (s.phone || s.citizenPhone || '');
        return {
          id: s._id || s.id,
          citizenId: citizenIdStr,
          citizenName: citizenNameStr,
          citizenPhone: citizenPhoneStr,
          type: s.serviceType || s.service_type || s.type || 'General Service',
          serviceType: s.serviceType || s.service_type || s.type || 'General Service',
          details: s.details || s.description || '',
          status: (s.status as Status) || 'Under Review',
          reply: s.adminReply || s.adminNotes || s.reply || '',
          createdAt: s.createdAt || s.created_at || new Date().toISOString(),
        };
      });

      setDb((prev) => ({
        ...prev,
        citizens: activeCitizen ? [activeCitizen] : prev.citizens,
        admins: activeAdmin ? [activeAdmin] : prev.admins,
        complaints,
        rules,
        announcements,
        services,
        contacts,
      }));

      setCitizen(activeCitizen);
      setAdmin(activeAdmin);
    } catch (e) {
      console.warn('Mobile refresh error:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <StoreContext.Provider value={{ db, citizen, admin, hydrated, setDb, setCitizen, setAdmin, refreshData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useApi() {
  const { db, citizen, admin, setCitizen, setAdmin, refreshData } = useStore();

  const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}`;

  return {
    newId,
    async citizenLogin(phone: string, pin: string) {
      const res = await api.citizenLogin({ phone, pin });
      const user: UserSession = {
        id: res.user.id || res.user._id,
        name: res.user.name,
        phone: res.user.phone,
        role: 'villager',
        language: res.user.language || 'English',
        address: cleanAddress(res.user.address),
        avatar: res.user.avatar || res.user.avatarUrl,
        token: res.token,
      };
      await saveUser(user);
      await refreshData();
      return { id: user.id, name: user.name, phone: user.phone, pin, address: user.address, language: user.language, avatar: user.avatar };
    },

    async citizenSignup(data: Omit<Citizen, "id">) {
      const res = await api.citizenSignup({
        name: data.name,
        phone: data.phone,
        address: data.address,
        ward: (data as any).ward || 'Ward 1',
        language: data.language,
        pin: (data as any).pin,
      });
      const user: UserSession = {
        id: res.user.id || res.user._id,
        name: res.user.name,
        phone: res.user.phone,
        role: 'villager',
        language: res.user.language || data.language,
        address: cleanAddress(res.user.address || data.address),
        avatar: res.user.avatar || res.user.avatarUrl,
        token: res.token,
      };
      await saveUser(user);
      await refreshData();
      return { ...data, id: user.id, address: user.address, avatar: user.avatar };
    },

    async checkCitizenPhone(phone: string) {
      return api.checkCitizenPhone(phone);
    },

    async resetCitizenPin(phone: string, pin: string) {
      const res = await api.resetCitizenPin(phone, pin);
      const user: UserSession = {
        id: res.user.id || res.user._id,
        name: res.user.name,
        phone: res.user.phone,
        role: 'villager',
        language: res.user.language || 'English',
        address: cleanAddress(res.user.address),
        avatar: res.user.avatar || res.user.avatarUrl,
        token: res.token,
      };
      await saveUser(user);
      await refreshData();
      return res;
    },

    async updateCitizen(patch: Partial<Citizen>) {
      try {
        const res = await api.updateProfile(patch);
        const newAvatar = res?.user?.avatar || res?.user?.avatarUrl || patch.avatar;
        if (citizen) {
          setCitizen({ ...citizen, ...patch, avatar: newAvatar || citizen.avatar });
        }
        const user = await getUser('citizen');
        if (user) {
          await saveUser({ ...user, ...patch, avatar: newAvatar || user.avatar });
        }
      } catch {
        if (citizen) {
          setCitizen({ ...citizen, ...patch });
        }
      }
    },

    async citizenLogout() {
      await logout('citizen');
      setCitizen(null);
    },

    async adminLogin(emailOrPhone: string, password: string) {
      const cleanId = emailOrPhone.trim();
      const res = await api.adminLogin({ email: cleanId, username: cleanId, identifier: cleanId, password });
      const user: UserSession = {
        id: res.user.id || res.user._id,
        name: res.user.fullName || res.user.name || 'Admin',
        phone: res.user.phoneNumber || res.user.phone || '',
        email: res.user.email,
        role: 'admin',
        username: res.user.email ? res.user.email.split('@')[0] : (res.user.username || 'admin'),
        designation: res.user.designation || 'Panchayat Officer',
        department: res.user.officeOrDepartment || res.user.department || 'Panchayat Office',
        officeOrDepartment: res.user.officeOrDepartment || res.user.department || 'Panchayat Office',
        governmentKeyUsed: res.user.governmentKeyUsed || 'GRAM-ADMIN-2026',
        createdAt: res.user.createdAt,
        securityQuestions: (res.user.securityQuestions || []).map((sq: any) => ({ question: sq.question })),
        language: res.user.language || 'English',
        token: res.token,
      };
      await saveUser(user);
      await refreshData();
      return {
        id: user.id,
        name: user.name,
        fullName: user.name,
        phone: user.phone,
        phoneNumber: user.phone,
        email: res.user.email || `${user.username}@panchayat.gov.in`,
        password,
        office: user.department || 'Panchayat Office',
        officeOrDepartment: user.department || 'Panchayat Office',
        governmentKeyUsed: user.governmentKeyUsed,
        createdAt: user.createdAt,
        questions: user.securityQuestions || [],
      };
    },

    async adminLookup(emailOrPhone: string) {
      const cleanId = emailOrPhone.trim();
      const res = await api.adminLookup(cleanId);
      const qList = Array.isArray(res.questions) && res.questions.length > 0
        ? res.questions
        : [{ id: 'q1', question: res.security_question || 'Security Question', answer: '' }];

      return {
        id: res.email || cleanId,
        name: res.email || res.username || 'Admin',
        phone: '9999999999',
        email: res.email || `${cleanId}@panchayat.gov.in`,
        password: '',
        office: 'Panchayat Office',
        questions: qList.map((q: any, i: number) => ({
          id: typeof q === 'string' ? `q${i + 1}` : (q.id || `q${i + 1}`),
          question: typeof q === 'string' ? q : (q.question || 'Security Question'),
          answer: '',
        })),
      };
    },

    async verifyAnswers(adminId: string, answers: string[]) {
      const res = await api.verifyAdminSecurityAnswers(adminId, answers);
      return res.success;
    },

    async resetAdminPassword(adminId: string, newPw: string) {
      const cleanId = adminId.trim();
      await api.resetAdminPassword({ email: cleanId, username: cleanId, identifier: cleanId, new_password: newPw });
    },

    async adminRegister(data: Omit<Admin, "id">) {
      const cleanEmail = (data.email || '').trim().toLowerCase();
      const res = await api.adminRegister({
        fullName: data.name,
        name: data.name,
        email: cleanEmail,
        phoneNumber: data.phone,
        phone: data.phone,
        password: data.password,
        designation: 'Panchayat Officer',
        officeOrDepartment: data.office,
        department: data.office,
        office: data.office,
        securityQuestions: data.questions.map((q) => ({ question: q.question, answer: q.answer })),
        questions: data.questions.map((q) => ({ question: q.question, answer: q.answer })),
        security_question: data.questions[0]?.question || 'Birthplace?',
        security_answer_hash: data.questions[0]?.answer || 'rampur',
        key: (data as any).key || 'GV2026',
      });
      return { ...data, id: res.user?.id || res.user?._id };
    },

    async changeAdminPassword(oldPw: string, newPw: string) {
      const user = await getUser();
      if (user?.username) {
        await api.resetAdminPassword({ username: user.username, new_password: newPw });
      }
    },

    async adminLogout() {
      await logout('admin');
      setAdmin(null);
    },

    async createComplaint({ body, category, mode }: { body: string; category?: string; mode: "voice" | "text" }) {
      const res = await api.createComplaint({
        textDescription: body,
        category: category || 'Water',
        inputMethod: mode === 'voice' ? 'Voice' : 'Manual',
      });
      await refreshData();
      const c = res.complaint || res;
      return {
        id: c.id || c._id,
        citizenId: c.citizenId?._id || c.citizenId || c.user_id,
        citizenName: c.citizenId?.fullName || c.villager || 'Citizen',
        citizenPhone: c.citizenId?.phoneNumber || c.phone || '',
        title: c.textDescription?.split('\n')[0]?.slice(0, 50) || 'Complaint',
        body: c.textDescription || body,
        mode,
        status: (c.status as Status) || 'Under Review',
        category: c.category || category,
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
        timeline: [{ status: c.status || 'Under Review', at: c.createdAt || c.created_at || new Date().toISOString(), note: 'Submitted' }],
      };
    },

    async createVoiceComplaint(
      audioFile: { uri: string; name?: string; type?: string } | Blob,
      textDescription: string,
      category: string = 'Water'
    ) {
      const res = await api.createVoiceComplaint(audioFile, textDescription, category);
      await refreshData();
      const c = res.complaint || res;
      return {
        id: c.id || c._id,
        citizenId: c.citizenId?._id || c.citizenId || c.user_id,
        citizenName: c.citizenId?.fullName || c.villager || 'Citizen',
        citizenPhone: c.citizenId?.phoneNumber || c.phone || '',
        title: c.transcript?.slice(0, 50) || c.complaint_text?.slice(0, 50) || 'Voice Complaint',
        body: c.transcript || c.complaint_text || textDescription,
        mode: 'voice' as const,
        voice_recording_url: c.voice_recording_url || `/api/complaints/${c.id}/audio`,
        status: (c.status as Status) || 'Under Review',
        category: c.category || category,
        createdAt: c.createdAt || c.created_at || new Date().toISOString(),
        timeline: [{ status: c.status || 'Under Review', at: c.createdAt || c.created_at || new Date().toISOString(), note: 'Submitted' }],
      };
    },

    async updateComplaint(id: string, patch: { status?: Status; reply?: string }) {
      await api.updateComplaintStatus(id, {
        status: patch.status || 'Under Review',
        adminNotes: patch.reply,
      });
      await refreshData();
    },

    async saveRule(rule: Rule) {
      const isExistingDbId = Boolean(rule.id && /^[0-9a-fA-F]{24}$/.test(rule.id));
      if (isExistingDbId) {
        await api.updateRule(rule.id, {
          title: rule.title,
          category: rule.section || 'policy',
          content: rule.body,
          penalty: 'None',
          effectiveDate: new Date().toISOString().split('T')[0],
        });
      } else {
        await api.createRule({
          title: rule.title,
          category: rule.section || 'policy',
          content: rule.body,
          penalty: 'None',
          effectiveDate: new Date().toISOString().split('T')[0],
        });
      }
      await refreshData();
    },

    async deleteRule(id: string) {
      await api.deleteRule(id);
      await refreshData();
    },

    async saveAnnouncement(ann: Announcement) {
      const isExistingDbId = Boolean(ann.id && /^[0-9a-fA-F]{24}$/.test(ann.id));
      const bodyText = ann.body || (ann as any).content || (ann as any).description || '';
      if (isExistingDbId) {
        await api.updateAnnouncement(ann.id, {
          title: ann.title,
          description: bodyText,
          content: bodyText,
          body: bodyText,
          priority: 'Medium',
        });
      } else {
        await api.createAnnouncement({
          title: ann.title,
          description: bodyText,
          content: bodyText,
          body: bodyText,
          priority: 'Medium',
        });
      }
      await refreshData();
    },

    async deleteAnnouncement(id: string) {
      await api.deleteAnnouncement(id);
      await refreshData();
    },

    async saveContact(contact: Contact) {
      const isExistingDbId = Boolean(contact.id && /^[0-9a-fA-F]{24}$/.test(contact.id));
      if (isExistingDbId) {
        await api.updateContact(contact.id, {
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          office: contact.office,
        });
      } else {
        await api.createContact({
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          office: contact.office,
        });
      }
      await refreshData();
    },

    async deleteContact(id: string) {
      await api.deleteContact(id);
      await refreshData();
    },

    async createService({ type, details }: { type: string; details: string }) {
      const res = await api.createService({
        serviceType: type,
        details,
      });
      await refreshData();
      return res;
    },

    async updateServiceStatus(id: string, patch: { status?: Status; reply?: string; details?: string }) {
      await api.updateService(id, patch);
      await refreshData();
    },

    async deleteServiceRequest(id: string) {
      await api.deleteService(id);
      await refreshData();
    },
  };
}
