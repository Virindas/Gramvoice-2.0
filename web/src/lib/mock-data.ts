export type Status = "Under Review" | "In Progress" | "Completed" | "Rejected";
export const STATUSES: Status[] = ["Under Review", "In Progress", "Completed", "Rejected"];

export const ADMIN_KEY = "GRAM-ADMIN-2026";

export const SECURITY_QUESTIONS = [
  "Your first village posting?",
  "Your mother's hometown?",
  "Name of your first school?",
  "Your father's birth village?",
];

export type Language = "English" | "Hindi" | "Tamil";
export const LANGUAGES: Language[] = ["English", "Hindi", "Tamil"];

export interface Citizen {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward?: string;
  language: Language;
  pin: string;
  avatar?: string | undefined;
}

export interface Admin {
  id: string;
  name: string;
  fullName?: string;
  office: string;
  officeOrDepartment?: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  password: string;
  governmentKeyUsed?: string;
  createdAt?: string;
  questions: { question: string; answer: string }[];
}

export interface StatusEvent {
  status: Status;
  at: string;
  note?: string | undefined;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  body: string;
  complaint_text?: string;
  voice_recording_url?: string;
  mode: "voice" | "text";
  status: Status;
  category?: string;
  reply?: string | undefined;
  createdAt: string;
  timeline: StatusEvent[];
}

export interface Rule {
  id: string;
  section: string;
  title: string;
  body: string;
  category?: 'water' | 'waste' | 'clean' | 'policy' | 'event' | string;
  content?: string;
  penalty?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
}

export interface ServiceRequest {
  id: string;
  citizenId: string;
  citizenName?: string;
  citizenPhone?: string;
  type: string;
  serviceType?: string;
  details: string;
  status: Status;
  createdAt: string;
  reply?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  office?: string;
}

const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const seedCitizens: Citizen[] = [
  {
    id: "c1",
    name: "Lakshmi Devi",
    phone: "9876543210",
    address: "House 12, North Street, Thirumalai Village",
    language: "English",
    pin: "1234",
  },
];

export const seedAdmins: Admin[] = [
  {
    id: "a1",
    name: "R. Sundaram",
    office: "Panchayat Development Office",
    email: "admin@gramvoice.in",
    phone: "9000000001",
    password: "gram2026",
    questions: [
      { question: "Your first village posting?", answer: "kollur" },
      { question: "Your mother's hometown?", answer: "madurai" },
    ],
  },
];

export const seedComplaints: Complaint[] = [
  {
    id: "GV-2041",
    citizenId: "c1",
    citizenName: "Lakshmi Devi",
    citizenPhone: "9876543210",
    title: "Street light not working near the temple",
    body: "The street light near the Amman temple junction has not been working for eleven days. It is very dark after 7 pm and children returning from tuition are afraid to walk there.",
    mode: "voice",
    status: "In Progress",
    reply: "An electrician has been assigned. Replacement fitting arrives this week.",
    createdAt: day(3),
    timeline: [
      { status: "Under Review", at: day(3) },
      { status: "In Progress", at: day(1), note: "Electrician assigned" },
    ],
  },
  {
    id: "GV-2038",
    citizenId: "c1",
    citizenName: "Lakshmi Devi",
    citizenPhone: "9876543210",
    title: "Drinking water tanker did not arrive",
    body: "The water tanker did not come to our street on Monday and Tuesday. Twenty families are affected.",
    mode: "text",
    status: "Completed",
    reply: "Tanker route corrected. Supply resumed from Wednesday.",
    createdAt: day(9),
    timeline: [
      { status: "Under Review", at: day(9) },
      { status: "In Progress", at: day(8) },
      { status: "Completed", at: day(6), note: "Supply resumed" },
    ],
  },
  {
    id: "GV-2035",
    citizenId: "c2",
    citizenName: "Murugan S.",
    citizenPhone: "9876500011",
    title: "Request to widen the canal bund road",
    body: "The canal bund road is too narrow for tractors during harvest season. Requesting widening before June.",
    mode: "text",
    status: "Under Review",
    createdAt: day(2),
    timeline: [{ status: "Under Review", at: day(2) }],
  },
  {
    id: "GV-2030",
    citizenId: "c3",
    citizenName: "Fathima Bi",
    citizenPhone: "9876500022",
    title: "Garbage not collected in Ward 4",
    body: "Garbage has been piling up behind the school compound for two weeks. There is a bad smell and stray dogs.",
    mode: "voice",
    status: "Rejected",
    reply: "This location falls under the municipality limits, not the Panchayat. Please raise it with the town office.",
    createdAt: day(14),
    timeline: [
      { status: "Under Review", at: day(14) },
      { status: "Rejected", at: day(12), note: "Outside Panchayat jurisdiction" },
    ],
  },
];

export const seedRules: Rule[] = [
  {
    id: "r1",
    section: "Water",
    title: "Shared borewell timings",
    body: "The common borewell may be used between 6 am and 9 am and again between 5 pm and 7 pm. Motor pumps must be switched off outside these hours.",
  },
  {
    id: "r2",
    section: "Cleanliness",
    title: "Waste segregation",
    body: "Wet and dry waste must be kept in separate bins. Collection happens every Tuesday and Friday morning before 8 am.",
  },
  {
    id: "r3",
    section: "Community",
    title: "Gram Sabha meetings",
    body: "The Gram Sabha meets on the first Sunday of every month at 10 am in the Panchayat hall. Every household may send one representative.",
  },
  {
    id: "r4",
    section: "Land & Cattle",
    title: "Grazing on common land",
    body: "Cattle may graze on common land except on the school playground and the temple pond bund. Damage to crops must be reported within 24 hours.",
  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "n1",
    title: "Free health camp on Sunday",
    body: "A general health and eye check-up camp will be held at the Panchayat hall from 9 am to 3 pm. Bring your ration card.",
    date: day(1),
  },
  {
    id: "n2",
    title: "Water supply maintenance",
    body: "Supply to Wards 2 and 4 will be paused on Thursday from 10 am to 2 pm for pipeline repair.",
    date: day(4),
  },
];

export const seedContacts: Contact[] = [
  { id: "k1", name: "R. Sundaram", role: "Panchayat President", phone: "9000000001" },
  { id: "k2", name: "Meena Rajan", role: "Panchayat Secretary", phone: "9000000002" },
  { id: "k3", name: "Dr. Aravind K.", role: "Primary Health Centre", phone: "9000000003" },
  { id: "k4", name: "Village Electricity Office", role: "Power complaints", phone: "9000000004" },
  { id: "k5", name: "Selvi P.", role: "Anganwadi Worker", phone: "9000000005" },
  { id: "k6", name: "Police Outpost", role: "Emergency", phone: "100" },
];

export const seedServices: ServiceRequest[] = [
  {
    id: "SR-114",
    citizenId: "c1",
    type: "Birth Certificate",
    details: "Certificate needed for school admission of my grandson.",
    status: "Completed",
    createdAt: day(20),
  },
  {
    id: "SR-121",
    citizenId: "c1",
    type: "Water Tanker Request",
    details: "Extra tanker needed for the north street during the festival week.",
    status: "Under Review",
    createdAt: day(2),
  },
];

export const SERVICE_TYPES = [
  "Birth Certificate",
  "Death Certificate",
  "Income Certificate",
  "Water Tanker Request",
  "Street Light Installation",
  "Ration Card Update",
];
