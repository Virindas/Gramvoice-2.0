import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  seedAdmins,
  seedAnnouncements,
  seedCitizens,
  seedComplaints,
  seedContacts,
  seedRules,
  seedServices,
  type Admin,
  type Announcement,
  type Citizen,
  type Complaint,
  type Contact,
  type Language,
  type Rule,
  type ServiceRequest,
  type Status,
} from "./mock-data";

/** Simulated network latency so every action has a real loading state. */
export const delay = (ms = 650) => new Promise<void>((r) => setTimeout(r, ms));

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
}

const initialDB: DB = {
  citizens: seedCitizens,
  admins: seedAdmins,
  complaints: seedComplaints,
  rules: seedRules,
  announcements: seedAnnouncements,
  services: seedServices,
  contacts: seedContacts,
  citizenSession: null,
  adminSession: null,
  language: "English",
};

const KEY = "gramvoice.db.v1";

function load(): DB {
  if (typeof window === "undefined") return initialDB;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialDB;
    return { ...initialDB, ...(JSON.parse(raw) as Partial<DB>) };
  } catch {
    return initialDB;
  }
}

interface StoreValue {
  db: DB;
  hydrated: boolean;
  update: (fn: (db: DB) => DB) => void;
  citizen: Citizen | null;
  admin: Admin | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(initialDB);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDb(load());
    setHydrated(true);
  }, []);

  const update = useCallback((fn: (d: DB) => DB) => {
    setDb((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      db,
      hydrated,
      update,
      citizen: db.citizens.find((c) => c.id === db.citizenSession) ?? null,
      admin: db.admins.find((a) => a.id === db.adminSession) ?? null,
    }),
    [db, hydrated, update],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

const id = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

/**
 * Mock API layer. Every function is shaped like a future REST call and
 * resolves/rejects asynchronously.
 */
export function useApi() {
  const { db, update } = useStore();

  return useMemo(
    () => ({
      /* ---------------- auth: citizen ---------------- */
      async citizenSignup(input: Omit<Citizen, "id">) {
        await delay();
        if (db.citizens.some((c) => c.phone === input.phone))
          throw new Error("This phone number is already registered.");
        const citizen: Citizen = { ...input, id: id("c") };
        update((d) => ({ ...d, citizens: [...d.citizens, citizen], citizenSession: citizen.id }));
        return citizen;
      },
      async citizenLogin(phone: string, pin: string) {
        await delay();
        const found = db.citizens.find((c) => c.phone === phone && c.pin === pin);
        if (!found) throw new Error("Phone number or PIN is incorrect.");
        update((d) => ({ ...d, citizenSession: found.id, adminSession: null }));
        return found;
      },
      async updateCitizen(patch: Partial<Citizen>) {
        await delay(500);
        update((d) => ({
          ...d,
          citizens: d.citizens.map((c) => (c.id === d.citizenSession ? { ...c, ...patch } : c)),
        }));
      },
      citizenLogout() {
        update((d) => ({ ...d, citizenSession: null }));
      },

      /* ---------------- auth: admin ---------------- */
      async adminRegister(input: Omit<Admin, "id">) {
        await delay();
        if (db.admins.some((a) => a.email === input.email))
          throw new Error("An account with this email already exists.");
        const admin: Admin = { ...input, id: id("a") };
        update((d) => ({ ...d, admins: [...d.admins, admin] }));
        return admin;
      },
      async adminLogin(identifier: string, password: string) {
        await delay();
        const found = db.admins.find(
          (a) =>
            (a.email.toLowerCase() === identifier.toLowerCase().trim() ||
              a.phone === identifier.trim()) &&
            a.password === password,
        );
        if (!found) throw new Error("Those credentials do not match our records.");
        update((d) => ({ ...d, adminSession: found.id, citizenSession: null }));
        return found;
      },
      async adminLookup(identifier: string) {
        await delay();
        const found = db.admins.find(
          (a) =>
            a.email.toLowerCase() === identifier.toLowerCase().trim() || a.phone === identifier.trim(),
        );
        if (!found) throw new Error("No administrator account found for that email or phone.");
        return found;
      },
      async verifyAnswers(adminId: string, answers: string[]) {
        await delay();
        const found = db.admins.find((a) => a.id === adminId);
        if (!found) throw new Error("Account not found.");
        const ok = found.questions.every(
          (q, i) => (answers[i] ?? "").trim().toLowerCase() === q.answer.trim().toLowerCase(),
        );
        if (!ok) throw new Error("One or more answers are incorrect.");
        return true;
      },
      async resetAdminPassword(adminId: string, password: string) {
        await delay();
        update((d) => ({
          ...d,
          admins: d.admins.map((a) => (a.id === adminId ? { ...a, password } : a)),
        }));
      },
      async changeAdminPassword(oldPassword: string, next: string) {
        await delay();
        const me = db.admins.find((a) => a.id === db.adminSession);
        if (!me || me.password !== oldPassword) throw new Error("Current password is incorrect.");
        update((d) => ({
          ...d,
          admins: d.admins.map((a) => (a.id === me.id ? { ...a, password: next } : a)),
        }));
      },
      adminLogout() {
        update((d) => ({ ...d, adminSession: null }));
      },

      /* ---------------- complaints ---------------- */
      async createComplaint(input: { body: string; mode: "voice" | "text" }) {
        await delay(900);
        const me = db.citizens.find((c) => c.id === db.citizenSession);
        if (!me) throw new Error("Session expired.");
        const now = new Date().toISOString();
        const complaint: Complaint = {
          id: `GV-${Math.floor(2100 + Math.random() * 800)}`,
          citizenId: me.id,
          citizenName: me.name,
          citizenPhone: me.phone,
          title: input.body.split(/[.\n]/)[0]?.slice(0, 70) || "New complaint",
          body: input.body,
          mode: input.mode,
          status: "Under Review",
          createdAt: now,
          timeline: [{ status: "Under Review", at: now }],
        };
        update((d) => ({ ...d, complaints: [complaint, ...d.complaints] }));
        return complaint;
      },
      async updateComplaint(complaintId: string, patch: { status: Status; reply?: string }) {
        await delay(700);
        update((d) => ({
          ...d,
          complaints: d.complaints.map((c) =>
            c.id === complaintId
              ? {
                  ...c,
                  status: patch.status,
                  reply: patch.reply ?? c.reply,
                  timeline:
                    c.status === patch.status
                      ? c.timeline
                      : [...c.timeline, { status: patch.status, at: new Date().toISOString() }],
                }
              : c,
          ),
        }));
      },

      /* ---------------- services ---------------- */
      async createService(input: { type: string; details: string }) {
        await delay(800);
        const me = db.citizens.find((c) => c.id === db.citizenSession);
        if (!me) throw new Error("Session expired.");
        const req: ServiceRequest = {
          id: id("SR"),
          citizenId: me.id,
          type: input.type,
          details: input.details,
          status: "Under Review",
          createdAt: new Date().toISOString(),
        };
        update((d) => ({ ...d, services: [req, ...d.services] }));
        return req;
      },

      /* ---------------- rules & announcements ---------------- */
      async saveRule(rule: Rule) {
        await delay(500);
        update((d) => ({
          ...d,
          rules: d.rules.some((r) => r.id === rule.id)
            ? d.rules.map((r) => (r.id === rule.id ? rule : r))
            : [rule, ...d.rules],
        }));
      },
      async deleteRule(ruleId: string) {
        await delay(400);
        update((d) => ({ ...d, rules: d.rules.filter((r) => r.id !== ruleId) }));
      },
      async saveAnnouncement(a: Announcement) {
        await delay(500);
        update((d) => ({
          ...d,
          announcements: d.announcements.some((x) => x.id === a.id)
            ? d.announcements.map((x) => (x.id === a.id ? a : x))
            : [a, ...d.announcements],
        }));
      },
      async deleteAnnouncement(aid: string) {
        await delay(400);
        update((d) => ({ ...d, announcements: d.announcements.filter((x) => x.id !== aid) }));
      },

      setLanguage(language: Language) {
        update((d) => ({ ...d, language }));
      },
      newId: id,
    }),
    [db, update],
  );
}
