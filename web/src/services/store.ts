export type ComplaintStatus = 'Under Review' | 'In Progress' | 'Completed' | 'Rejected';

export interface CitizenSession {
  id: string;
  name: string;
  phone: string;
  address: string;
  language: 'en' | 'hi' | 'ta';
  pin: string;
}

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface AdminSession {
  id: string;
  govtKey: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  securityQuestions: [SecurityQuestion, SecurityQuestion];
}

export interface TimelineEvent {
  date: string;
  status: ComplaintStatus;
  note: string;
  by: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenAddress: string;
  category: 'Water' | 'Electricity' | 'Roads & Sanitation' | 'Health & Welfare' | 'Other';
  mode: 'Voice' | 'Text';
  title: string;
  description: string;
  audioDurationSeconds?: number;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  timeline: TimelineEvent[];
}

export interface VillageRule {
  id: string;
  category: string;
  title: string;
  description: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'High' | 'Normal';
  date: string;
  author: string;
}

export interface ServiceRequest {
  id: string;
  citizenId: string;
  serviceType: string;
  details: string;
  status: 'Requested' | 'Processing' | 'Approved' | 'Completed';
  createdAt: string;
}

export interface VillageContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  department: string;
}

// Initial Mock Seed Data
const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'GV-2026-8091',
    citizenId: 'c1',
    citizenName: 'Ramesh Kumar',
    citizenPhone: '9876543210',
    citizenAddress: 'Ward No. 4, Main Bazaar',
    category: 'Water',
    mode: 'Voice',
    title: 'Water Pipe Leakage near Primary School',
    description: 'Clean drinking water has been leaking near the Ward 4 primary school for 2 days. The street is flooded.',
    audioDurationSeconds: 24,
    status: 'Under Review',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    timeline: [
      {
        date: new Date(Date.now() - 3600000 * 4).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Under Review',
        note: 'Voice complaint registered via GramVoice Portal.',
        by: 'System Auto-Log',
      },
    ],
  },
  {
    id: 'GV-2026-8042',
    citizenId: 'c1',
    citizenName: 'Ramesh Kumar',
    citizenPhone: '9876543210',
    citizenAddress: 'Ward No. 4, Main Bazaar',
    category: 'Electricity',
    mode: 'Text',
    title: 'Streetlight Pole Broken near Temple Intersection',
    description: 'The street light pole near Shiva Temple intersection was damaged in rain and non-functional causing dark spots.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    adminReply: 'Dispatched Panchayat Linesman team. Replacement lamp fixture ordered.',
    timeline: [
      {
        date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        status: 'Under Review',
        note: 'Submitted by citizen.',
        by: 'Citizen',
      },
      {
        date: new Date(Date.now() - 3600000 * 12).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        status: 'In Progress',
        note: 'Assigned to Panchayat Linesman team.',
        by: 'Gram Panchayat Admin',
      },
    ],
  },
  {
    id: 'GV-2026-7910',
    citizenId: 'c1',
    citizenName: 'Ramesh Kumar',
    citizenPhone: '9876543210',
    citizenAddress: 'Ward No. 4, Main Bazaar',
    category: 'Roads & Sanitation',
    mode: 'Voice',
    title: 'Pothole Repair on Panchayat Approach Road',
    description: 'Deep potholes repaired and road leveled with gravel near North Gate entrance.',
    audioDurationSeconds: 18,
    status: 'Completed',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    adminReply: 'Gravel filling and asphalt patching completed by PWD contractor on 15th Aug.',
    timeline: [
      {
        date: new Date(Date.now() - 86400000 * 6).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        status: 'Under Review',
        note: 'Voice recording submitted.',
        by: 'Citizen',
      },
      {
        date: new Date(Date.now() - 86400000 * 4).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        status: 'In Progress',
        note: 'PWD Work Order issued.',
        by: 'Admin',
      },
      {
        date: new Date(Date.now() - 86400000 * 1).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        status: 'Completed',
        note: 'Road repair verified and closed.',
        by: 'Admin',
      },
    ],
  },
];

const INITIAL_RULES: VillageRule[] = [
  {
    id: 'r1',
    category: 'Waste Disposal & Cleanliness',
    title: 'Door-to-Door Garbage Collection Timings',
    description: 'Wet and dry waste must be segregated into green and blue bins before 8:00 AM daily collection.',
    updatedAt: '2026-08-10',
  },
  {
    id: 'r2',
    category: 'Water Conservation',
    title: 'Agricultural Water Pump Usage Guidelines',
    description: 'Submersible water pumps for farming must operate between 10:00 PM and 6:00 AM to preserve grid voltage.',
    updatedAt: '2026-08-12',
  },
  {
    id: 'r3',
    category: 'Panchayat Community Hall',
    title: 'Community Hall Booking & Cleaning Deposit',
    description: 'Booking requests must be submitted 7 days prior at Panchayat Bhawan with INR 500 refundable cleaning deposit.',
    updatedAt: '2026-08-14',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Free Mega Health & Eye Checkup Camp',
    content: 'Specialists from City Civil Hospital will conduct free health screenings at Primary School Grounds on Sunday, 9 AM – 4 PM.',
    priority: 'High',
    date: '2026-08-18',
    author: 'Gram Panchayat Secretary',
  },
  {
    id: 'a2',
    title: 'PM-KISAN KCC Application Verification Drive',
    content: 'Kisan Credit Card applications and land record verifications will take place at Panchayat Bhawan counter.',
    priority: 'Normal',
    date: '2026-08-15',
    author: 'Agriculture Nodal Officer',
  },
];

const INITIAL_CONTACTS: VillageContact[] = [
  { id: 'vc1', name: 'Suresh Chandra Sharma', role: 'Sarpanch (Village Head)', phone: '9876500001', department: 'Panchayat Executive' },
  { id: 'vc2', name: 'Anita Devi Verma', role: 'Gram Sevak / Panchayat Secretary', phone: '9876500002', department: 'Rural Development' },
  { id: 'vc3', name: 'Rajesh Patel', role: 'Panchayat Linesman (Electricity)', phone: '9876500003', department: 'Electricity Board' },
  { id: 'vc4', name: 'Dr. Sunita Rao', role: 'Primary Health Centre Officer', phone: '9876500004', department: 'Health' },
  { id: 'vc5', name: 'Inspector Vikram Singh', role: 'Local Police Station In-charge', phone: '9876500005', department: 'Police & Safety' },
];

const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'SR-101',
    citizenId: 'c1',
    serviceType: 'Water Supply Tanker Request',
    details: 'Need 1000L water tanker for community gathering at Ward 4 grounds.',
    status: 'Approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// LocalStorage Persistence Helpers
const KEYS = {
  CITIZEN_USERS: 'gv_citizen_users',
  CITIZEN_SESSION: 'gv_citizen_session',
  ADMIN_USERS: 'gv_admin_users',
  ADMIN_SESSION: 'gv_admin_session',
  COMPLAINTS: 'gv_complaints',
  RULES: 'gv_rules',
  ANNOUNCEMENTS: 'gv_announcements',
  SERVICE_REQUESTS: 'gv_service_requests',
  CONTACTS: 'gv_contacts',
  LANG: 'gv_lang',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export class AppStore {
  // Citizen Auth
  static getCitizens(): CitizenSession[] {
    return getItem<CitizenSession[]>(KEYS.CITIZEN_USERS, [
      {
        id: 'c1',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        address: 'Ward No. 4, Main Bazaar',
        language: 'en',
        pin: '1234',
      },
    ]);
  }

  static registerCitizen(data: Omit<CitizenSession, 'id'>): CitizenSession {
    const citizens = this.getCitizens();
    if (citizens.some(c => c.phone === data.phone)) {
      throw new Error('Phone number is already registered.');
    }
    const newCitizen: CitizenSession = {
      ...data,
      id: `c_${Date.now()}`,
    };
    setItem(KEYS.CITIZEN_USERS, [newCitizen, ...citizens]);
    this.setCitizenSession(newCitizen);
    return newCitizen;
  }

  static loginCitizen(phone: string, pin: string): CitizenSession {
    const citizens = this.getCitizens();
    const user = citizens.find(c => c.phone === phone && c.pin === pin);
    if (!user) {
      throw new Error('Invalid Phone Number or 4-Digit PIN.');
    }
    this.setCitizenSession(user);
    return user;
  }

  static getCitizenSession(): CitizenSession | null {
    return getItem<CitizenSession | null>(KEYS.CITIZEN_SESSION, null);
  }

  static setCitizenSession(user: CitizenSession | null): void {
    setItem(KEYS.CITIZEN_SESSION, user);
  }

  static updateCitizenProfile(updates: Partial<CitizenSession>): CitizenSession {
    const current = this.getCitizenSession();
    if (!current) throw new Error('Not authenticated');
    const updated = { ...current, ...updates };
    const citizens = this.getCitizens().map(c => (c.id === current.id ? updated : c));
    setItem(KEYS.CITIZEN_USERS, citizens);
    setItem(KEYS.CITIZEN_SESSION, updated);
    return updated;
  }

  static logoutCitizen(): void {
    localStorage.removeItem(KEYS.CITIZEN_SESSION);
  }

  // Admin Auth
  static getAdmins(): AdminSession[] {
    return getItem<AdminSession[]>(KEYS.ADMIN_USERS, [
      {
        id: 'a1',
        govtKey: 'GRAM-ADMIN-2026',
        name: 'Nodal Admin Officer',
        department: 'Gram Panchayat Development',
        email: 'admin@grampanchayat.gov.in',
        phone: '9876543211',
        securityQuestions: [
          { question: 'Your first village posting?', answer: 'rampur' },
          { question: "Your mother's hometown?", answer: 'jaipur' },
        ],
      },
    ]);
  }

  static registerAdmin(data: Omit<AdminSession, 'id'>): AdminSession {
    if (data.govtKey !== 'GRAM-ADMIN-2026') {
      throw new Error('Invalid Government Registration Key.');
    }
    const admins = this.getAdmins();
    if (admins.some(a => a.email === data.email || a.phone === data.phone)) {
      throw new Error('Email or Phone is already registered.');
    }
    const newAdmin: AdminSession = {
      ...data,
      id: `a_${Date.now()}`,
    };
    setItem(KEYS.ADMIN_USERS, [newAdmin, ...admins]);
    this.setAdminSession(newAdmin);
    return newAdmin;
  }

  static loginAdmin(identifier: string, pass: string): AdminSession {
    const admins = this.getAdmins();
    const admin = admins.find(a => (a.email === identifier || a.phone === identifier));
    if (!admin) {
      throw new Error('Invalid Email/Phone or Password.');
    }
    this.setAdminSession(admin);
    return admin;
  }

  static getAdminSession(): AdminSession | null {
    return getItem<AdminSession | null>(KEYS.ADMIN_SESSION, null);
  }

  static setAdminSession(admin: AdminSession | null): void {
    setItem(KEYS.ADMIN_SESSION, admin);
  }

  static logoutAdmin(): void {
    localStorage.removeItem(KEYS.ADMIN_SESSION);
  }

  // Complaints Management
  static getComplaints(): Complaint[] {
    return getItem<Complaint[]>(KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }

  static addComplaint(data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>): Complaint {
    const complaints = this.getComplaints();
    const dateStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newComplaint: Complaint = {
      ...data,
      id: `GV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Under Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          date: dateStr,
          status: 'Under Review',
          note: `${data.mode} complaint registered by citizen.`,
          by: 'System Auto-Log',
        },
      ],
    };
    setItem(KEYS.COMPLAINTS, [newComplaint, ...complaints]);
    return newComplaint;
  }

  static updateComplaintStatus(id: string, newStatus: ComplaintStatus, replyNote: string, adminName: string): Complaint {
    const complaints = this.getComplaints();
    const target = complaints.find(c => c.id === id);
    if (!target) throw new Error('Complaint not found.');

    const dateStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newTimelineEvent: TimelineEvent = {
      date: dateStr,
      status: newStatus,
      note: replyNote || `Status updated to ${newStatus}.`,
      by: adminName,
    };

    const updated: Complaint = {
      ...target,
      status: newStatus,
      adminReply: replyNote || target.adminReply,
      updatedAt: new Date().toISOString(),
      timeline: [newTimelineEvent, ...target.timeline],
    };

    const updatedList = complaints.map(c => (c.id === id ? updated : c));
    setItem(KEYS.COMPLAINTS, updatedList);
    return updated;
  }

  // Rules Management
  static getRules(): VillageRule[] {
    return getItem<VillageRule[]>(KEYS.RULES, INITIAL_RULES);
  }

  static saveRule(rule: Omit<VillageRule, 'id' | 'updatedAt'> & { id?: string }): VillageRule {
    const rules = this.getRules();
    const today = new Date().toISOString().split('T')[0];
    if (rule.id) {
      const updated = rules.map(r => (r.id === rule.id ? { ...r, ...rule, updatedAt: today } as VillageRule : r));
      setItem(KEYS.RULES, updated);
      return updated.find(r => r.id === rule.id)!;
    } else {
      const newRule: VillageRule = {
        ...rule,
        id: `r_${Date.now()}`,
        updatedAt: today,
      };
      setItem(KEYS.RULES, [newRule, ...rules]);
      return newRule;
    }
  }

  static deleteRule(id: string): void {
    const rules = this.getRules().filter(r => r.id !== id);
    setItem(KEYS.RULES, rules);
  }

  // Announcements Management
  static getAnnouncements(): Announcement[] {
    return getItem<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  static saveAnnouncement(anc: Omit<Announcement, 'id' | 'date'> & { id?: string }): Announcement {
    const list = this.getAnnouncements();
    const dateStr = new Date().toISOString().split('T')[0];
    if (anc.id) {
      const updated = list.map(a => (a.id === anc.id ? { ...a, ...anc } as Announcement : a));
      setItem(KEYS.ANNOUNCEMENTS, updated);
      return updated.find(a => a.id === anc.id)!;
    } else {
      const newAnc: Announcement = {
        ...anc,
        id: `a_${Date.now()}`,
        date: dateStr,
      };
      setItem(KEYS.ANNOUNCEMENTS, [newAnc, ...list]);
      return newAnc;
    }
  }

  static deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    setItem(KEYS.ANNOUNCEMENTS, list);
  }

  // Service Requests
  static getServiceRequests(): ServiceRequest[] {
    return getItem<ServiceRequest[]>(KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
  }

  static addServiceRequest(req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>): ServiceRequest {
    const list = this.getServiceRequests();
    const newReq: ServiceRequest = {
      ...req,
      id: `SR-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };
    setItem(KEYS.SERVICE_REQUESTS, [newReq, ...list]);
    return newReq;
  }

  // Contacts
  static getContacts(): VillageContact[] {
    return getItem<VillageContact[]>(KEYS.CONTACTS, INITIAL_CONTACTS);
  }

  // Language Preference
  static getLang(): 'en' | 'hi' | 'ta' {
    return getItem<'en' | 'hi' | 'ta'>(KEYS.LANG, 'en');
  }

  static setLang(lang: 'en' | 'hi' | 'ta'): void {
    setItem(KEYS.LANG, lang);
  }
}
