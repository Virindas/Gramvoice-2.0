import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { saveUser, getUser, clearUser, type UserSession } from "./auth";
import { api } from "./api";
import {
  type Admin,
  type Announcement,
  type Citizen,
  type Complaint,
  type Contact,
  type Language,
  type Rule,
  type ServiceRequest,
  type Status,
  seedCitizens,
  seedAdmins,
  seedComplaints,
  seedRules,
  seedAnnouncements,
  seedContacts,
  seedServices,
} from "./mock-data";

export interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

export function cleanAddress(addr?: string | null): string {
  if (!addr) return '';
  const trimmed = String(addr).trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'add' || lower === 'n/a' || lower === 'na' || lower === 'none' || lower === 'null' || lower === 'undefined' || trimmed.length < 4) {
    return '';
  }
  return trimmed;
}

interface DB {
  citizens: Citizen[];
  admins: Admin[];
  complaints: Complaint[];
  rules: Rule[];
  announcements: Announcement[];
  services: ServiceRequest[];
  contacts: Contact[];
  citizenSession: string | null;
  adminSession: string | null;
  language: Language;
  chatMessages: ChatMessage[];
}

const CACHE_KEY = "gramvoice_db_cache_v2";

function getInitialDB(): DB {
  const citizenUser = typeof window !== 'undefined' ? getUser('citizen') : null;
  const adminUser = typeof window !== 'undefined' ? getUser('admin') : null;

  let cached: any = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }

  return {
    citizens: cached?.citizens?.length ? cached.citizens : seedCitizens,
    admins: cached?.admins?.length ? cached.admins : seedAdmins,
    complaints: cached?.complaints?.length ? cached.complaints : seedComplaints,
    rules: cached?.rules?.length ? cached.rules : seedRules,
    announcements: cached?.announcements?.length ? cached.announcements : seedAnnouncements,
    services: cached?.services?.length ? cached.services : seedServices,
    contacts: cached?.contacts?.length ? cached.contacts : seedContacts,
    citizenSession: citizenUser?.id || cached?.citizenSession || null,
    adminSession: adminUser?.id || cached?.adminSession || null,
    language: "English",
    chatMessages: cached?.chatMessages || [
      {
        from: "bot",
        text: "Vanakkam! I'm the GramVoice assistant. Ask me anything about complaints, rules or services.",
      },
    ],
  };
}

interface StoreValue {
  db: DB;
  hydrated: boolean;
  update: (fn: (db: DB) => DB) => void;
  refreshData: () => Promise<void>;
  citizen: Citizen | null;
  admin: Admin | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(getInitialDB);
  const [hydrated, setHydrated] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const citizenUser = getUser('citizen');
      const adminUser = getUser('admin');
      const user = (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) ? adminUser : (citizenUser || adminUser);
      const citizenSession = citizenUser?.id || null;
      const adminSession = adminUser?.id || null;

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
      const relevantToken = (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) ? adminUser?.token : (citizenUser?.token || adminUser?.token);
      if (relevantToken) {
        try {
          const compRes = (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) ? await api.getAllComplaints() : await api.getMyComplaints();
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
            saveUser(updatedUser);
          }
        } catch {
          /* ignore me fetch error */
        }
      }

      // Map backend fields to frontend domain models
      const rules: Rule[] = (Array.isArray(rulesData) ? rulesData : []).map((r: any) => ({
        id: r._id || r.id,
        section: r.category || 'General',
        title: r.title || 'Village Rule',
        body: r.content || r.body || '',
        category: r.category || 'policy',
        content: r.content || r.body || '',
        penalty: r.penalty || 'None',
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
        const compText = c.complaint_text || c.transcript || c.textDescription || c.body || '';
        const voiceUrl = c.voice_recording_url || (c.audioFileId || c.type === 'voice' ? `http://localhost:5000/api/complaints/${c.id || c._id}/audio` : undefined);
        const titleText = compText ? (compText.split('\n')[0]?.slice(0, 60) || 'Complaint') : 'Complaint';
        const modeType = c.type === 'voice' || c.inputMethod?.toLowerCase() === 'voice' || voiceUrl ? 'voice' : 'text';

        return {
          id: c.id || String(c._id || ''),
          citizenId: citizenIdStr,
          citizenName: citizenNameStr,
          citizenPhone: citizenPhoneStr,
          title: titleText,
          body: compText,
          complaint_text: compText,
          voice_recording_url: voiceUrl,
          mode: modeType,
          status: (c.status as Status) || 'Under Review',
          reply: c.adminReply || c.adminNotes || c.reply || '',
          createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          timeline: c.timeline || [{ status: c.status || 'Under Review', at: c.createdAt || c.created_at || new Date().toISOString() }],
        };
      });

      const activeCitizen: Citizen | null = citizenUser ? {
        id: citizenUser.id,
        name: citizenUser.name,
        phone: citizenUser.phone,
        pin: '1234',
        address: cleanAddress(citizenUser.address),
        language: (citizenUser.language as Language) || 'English',
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
        rules,
        announcements,
        contacts,
        complaints,
        services,
        citizenSession,
        adminSession,
        citizens: activeCitizen ? [activeCitizen] : prev.citizens,
        admins: activeAdmin ? [activeAdmin] : prev.admins,
      }));
    } catch (err) {
      console.warn('Backend refresh warning:', err);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          complaints: db.complaints,
          rules: db.rules,
          announcements: db.announcements,
          services: db.services,
          contacts: db.contacts,
          citizens: db.citizens,
          admins: db.admins,
          citizenSession: db.citizenSession,
          adminSession: db.adminSession,
        }));
      } catch {
        /* ignore */
      }
    }
  }, [db]);

  const update = useCallback((fn: (d: DB) => DB) => {
    setDb((prev) => fn(prev));
  }, []);

  const citizen = useMemo(() => {
    const fromList = db.citizens.find((c) => c.id === db.citizenSession);
    if (fromList) return fromList;
    const u = getUser('citizen');
    if (u) {
      return {
        id: u.id,
        name: u.name,
        phone: u.phone || '',
        address: u.address || 'Gram Panchayat',
        ward: u.ward || 'Ward 1',
        language: (u.language as Language) || 'English',
        pin: '1234',
      };
    }
    return null;
  }, [db.citizens, db.citizenSession]);

  const admin = useMemo(() => {
    const fromList = db.admins.find((a) => a.id === db.adminSession);
    if (fromList) return fromList;
    const u = getUser('admin');
    if (u) {
      return {
        id: u.id,
        name: u.name,
        fullName: u.name,
        phone: u.phone || '',
        phoneNumber: u.phone || '',
        email: u.email || '',
        password: '',
        office: u.officeOrDepartment || u.department || 'Panchayat Office',
        officeOrDepartment: u.officeOrDepartment || u.department || 'Panchayat Office',
        governmentKeyUsed: u.governmentKeyUsed || 'GRAM-ADMIN-2026',
        createdAt: u.createdAt,
        questions: (u.securityQuestions || []).map((q: any) => ({
          question: q.question,
          answer: '',
        })),
      };
    }
    return null;
  }, [db.admins, db.adminSession]);

  const value = useMemo(
    () => ({
      db,
      hydrated,
      update,
      refreshData,
      citizen,
      admin,
    }),
    [db, hydrated, update, refreshData, citizen, admin],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export function useApi() {
  const { refreshData, update } = useStore();

  return useMemo(
    () => ({
      /* ---------------- auth: citizen ---------------- */
      async citizenSignup(input: Omit<Citizen, "id">) {
        const res = await api.citizenSignup({
          name: input.name,
          phone: input.phone,
          address: input.address,
          ward: (input as any).ward || 'Ward 1',
          language: input.language,
          pin: input.pin,
        });
        const user: UserSession = {
          id: res.user.id || res.user._id,
          name: res.user.name,
          phone: res.user.phone,
          role: 'villager',
          language: res.user.language || input.language,
          address: cleanAddress(res.user.address || input.address),
          token: res.token,
        };
        saveUser(user);
        await refreshData();
        return { ...input, id: user.id, address: user.address };
      },

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
        saveUser(user);
        await refreshData();
        return { id: user.id, name: user.name, phone: user.phone, pin, address: user.address, language: user.language as Language, avatar: user.avatar };
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
        saveUser(user);
        await refreshData();
        return res;
      },

      async updateCitizen(patch: Partial<Citizen>) {
        try {
          const res = await api.updateProfile(patch);
          const newAvatar = res?.user?.avatar || res?.user?.avatarUrl || patch.avatar;
          update((d) => ({
            ...d,
            citizens: d.citizens.map((c) => (c.id === d.citizenSession ? { ...c, ...patch, avatar: newAvatar || c.avatar } : c)),
          }));
          const user = getUser('citizen');
          if (user) {
            saveUser({ ...user, ...patch, avatar: newAvatar || user.avatar });
          }
        } catch {
          update((d) => ({
            ...d,
            citizens: d.citizens.map((c) => (c.id === d.citizenSession ? { ...c, ...patch } : c)),
          }));
        }
      },

      citizenLogout() {
        clearUser();
        update((d) => ({ ...d, citizenSession: null }));
      },

      /* ---------------- auth: admin ---------------- */
      async adminRegister(input: Omit<Admin, "id">) {
        const cleanEmail = (input.email || "").trim().toLowerCase();
        const res = await api.adminRegister({
          fullName: input.name,
          name: input.name,
          email: cleanEmail,
          phoneNumber: input.phone,
          phone: input.phone,
          password: input.password,
          designation: "Panchayat Officer",
          officeOrDepartment: input.office,
          department: input.office,
          office: input.office,
          securityQuestions: input.questions.map((q) => ({ question: q.question, answer: q.answer })),
          questions: input.questions.map((q) => ({ question: q.question, answer: q.answer })),
          security_question: input.questions[0]?.question || "Birthplace?",
          security_answer_hash: input.questions[0]?.answer || "rampur",
          key: (input as any).key || "GV2026",
        });
        return { ...input, id: res.user?.id || res.user?._id };
      },

      async adminLogin(identifier: string, password: string) {
        const cleanId = identifier.trim();
        const res = await api.adminLogin({ email: cleanId, username: cleanId, identifier: cleanId, password });
        const user: UserSession = {
          id: res.user.id || res.user._id,
          name: res.user.fullName || res.user.name || "Admin",
          phone: res.user.phoneNumber || res.user.phone || "",
          email: res.user.email,
          role: "admin",
          username: res.user.email ? res.user.email.split("@")[0] : (res.user.username || "admin"),
          designation: res.user.designation || "Panchayat Officer",
          department: res.user.officeOrDepartment || res.user.department || "Panchayat Office",
          officeOrDepartment: res.user.officeOrDepartment || res.user.department || "Panchayat Office",
          governmentKeyUsed: res.user.governmentKeyUsed || "GRAM-ADMIN-2026",
          createdAt: res.user.createdAt,
          securityQuestions: (res.user.securityQuestions || []).map((sq: any) => ({ question: sq.question })),
          language: res.user.language || "English",
          token: res.token,
        };
        saveUser(user);
        await refreshData();
        return {
          id: user.id,
          name: user.name,
          fullName: user.name,
          phone: user.phone,
          phoneNumber: user.phone,
          email: res.user.email || `${user.username}@panchayat.gov.in`,
          password,
          office: user.department || "Panchayat Office",
          officeOrDepartment: user.department || "Panchayat Office",
          governmentKeyUsed: user.governmentKeyUsed,
          createdAt: user.createdAt,
          questions: user.securityQuestions || [],
        };
      },

      async adminLookup(identifier: string) {
        const cleanId = identifier.trim();
        const res = await api.adminLookup(cleanId);
        const qList = Array.isArray(res.questions) && res.questions.length > 0
          ? res.questions
          : [{ id: "q1", question: res.security_question || "What is your security question?", answer: "" }];

        return {
          id: res.email || cleanId,
          name: res.email || res.username || "Admin",
          phone: "9999999999",
          email: res.email || `${cleanId}@panchayat.gov.in`,
          password: "",
          office: "Panchayat Office",
          questions: qList.map((q: any, i: number) => ({
            id: typeof q === "string" ? `q${i + 1}` : (q.id || `q${i + 1}`),
            question: typeof q === "string" ? q : (q.question || "Security Question"),
            answer: "",
          })),
        };
      },

      async verifyAnswers(adminId: string, answers: string[]) {
        const res = await api.verifyAdminSecurityAnswers(adminId, answers);
        return res.success;
      },

      async resetAdminPassword(adminId: string, password: string) {
        const cleanId = adminId.trim();
        await api.resetAdminPassword({ email: cleanId, username: cleanId, identifier: cleanId, new_password: password });
      },

      async changeAdminPassword(oldPassword: string, next: string) {
        const user = getUser();
        if (user?.username) {
          await api.resetAdminPassword({ username: user.username, new_password: next });
        }
      },

      adminLogout() {
        clearUser();
        update((d) => ({ ...d, adminSession: null }));
      },

      /* ---------------- complaints ---------------- */
      async createComplaint(input: { body: string; mode: "voice" | "text" }) {
        const res = await api.createComplaint({
          textDescription: input.body,
          inputMethod: input.mode === 'voice' ? 'Voice' : 'Manual',
        });
        await refreshData();
        const c = res.complaint || res;
        return {
          id: c.id || c._id,
          citizenId: c.user_id,
          citizenName: c.villager || 'Citizen',
          citizenPhone: c.phone || '',
          title: c.textDescription?.split('\n')[0]?.slice(0, 60) || 'New complaint',
          body: c.textDescription || input.body,
          mode: input.mode,
          status: (c.status as Status) || 'Under Review',
          createdAt: c.created_at || new Date().toISOString(),
          timeline: [{ status: c.status || 'Under Review', at: c.created_at || new Date().toISOString() }],
        };
      },

      async updateComplaint(complaintId: string, patch: { status: Status; reply?: string }) {
        await api.updateComplaintStatus(complaintId, {
          status: patch.status,
          adminNotes: patch.reply,
        });
        await refreshData();
      },

      /* ---------------- services ---------------- */
      async createService(input: { type: string; details: string }) {
        const res = await api.createService({
          serviceType: input.type,
          details: input.details,
        });
        await refreshData();
        return res;
      },

      /* ---------------- rules & announcements ---------------- */
      async saveRule(rule: Rule) {
        const category = rule.category || rule.section || 'policy';
        const content = rule.content || rule.body || '';
        const penalty = rule.penalty || 'None';
        const isExistingDbId = Boolean(rule.id && /^[0-9a-fA-F]{24}$/.test(rule.id));
        if (isExistingDbId) {
          await api.updateRule(rule.id, {
            title: rule.title,
            category,
            content,
            penalty,
            effectiveDate: new Date().toISOString().split('T')[0],
          });
        } else {
          await api.createRule({
            title: rule.title,
            category,
            content,
            penalty,
            effectiveDate: new Date().toISOString().split('T')[0],
          });
        }
        await refreshData();
      },

      async deleteRule(ruleId: string) {
        await api.deleteRule(ruleId);
        await refreshData();
      },

      async saveAnnouncement(a: Announcement) {
        const isExistingDbId = Boolean(a.id && /^[0-9a-fA-F]{24}$/.test(a.id));
        const bodyText = a.body || (a as any).content || (a as any).description || '';
        if (isExistingDbId) {
          await api.updateAnnouncement(a.id, {
            title: a.title,
            description: bodyText,
            content: bodyText,
            body: bodyText,
            priority: 'Medium',
          });
        } else {
          await api.createAnnouncement({
            title: a.title,
            description: bodyText,
            content: bodyText,
            body: bodyText,
            priority: 'Medium',
          });
        }
        await refreshData();
      },

      async deleteAnnouncement(aid: string) {
        await api.deleteAnnouncement(aid);
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

      async deleteContact(cid: string) {
        await api.deleteContact(cid);
        await refreshData();
      },

      async updateServiceStatus(id: string, patch: { status?: Status; reply?: string; details?: string }) {
        await api.updateService(id, patch);
        await refreshData();
      },

      async deleteServiceRequest(id: string) {
        await api.deleteService(id);
        await refreshData();
      },

      setLanguage(language: Language) {
        update((d) => ({ ...d, language }));
      },
      newId: id,
    }),
    [refreshData, update],
  );
}
