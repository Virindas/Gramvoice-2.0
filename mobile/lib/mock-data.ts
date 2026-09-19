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
  avatar?: string;
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
  note?: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  title: string;
  body: string;
  complaint_text?: string;
  mode: "voice" | "text";
  voice_recording_url?: string;
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
    name: "M. Ramanathan",
    office: "Panchayat Development Office",
    email: "admin@gramvoice.in",
    phone: "9123456789",
    password: "gram2026password",
    questions: [
      { question: SECURITY_QUESTIONS[0] as string, answer: "Thirumalai" },
      { question: SECURITY_QUESTIONS[1] as string, answer: "Madurai" },
    ],
  },
];

export const seedComplaints: Complaint[] = [
  {
    id: "1001",
    citizenId: "c1",
    citizenName: "Lakshmi Devi",
    citizenPhone: "9876543210",
    title: "Street light not working near the temple",
    body: "The main street light opposite the Mariamman temple has been dark for 4 days. It is unsafe for women and children walking home at night.",
    mode: "voice",
    status: "In Progress",
    reply: "The electrician was informed on Friday. Replacement bulb and wiring fix scheduled for tomorrow morning.",
    createdAt: day(3),
    timeline: [
      { status: "Under Review", at: day(3), note: "Received at Panchayat desk" },
      { status: "In Progress", at: day(1), note: "Assigned to Ward 3 electrician" },
    ],
  },
  {
    id: "1002",
    citizenId: "c1",
    citizenName: "Lakshmi Devi",
    citizenPhone: "9876543210",
    title: "Drinking water supply leak on East Street",
    body: "Water pipeline broken near handpump #2. Water is leaking on the mud road since yesterday 6 AM.",
    mode: "text",
    status: "Under Review",
    createdAt: day(1),
    timeline: [{ status: "Under Review", at: day(1), note: "Submitted by citizen" }],
  },
];

export const seedRules: Rule[] = [
  {
    id: "r1",
    section: "Water & Sanitation",
    title: "Drinking Water Timings",
    body: "Overhead tank water supply is opened daily from 6:00 AM to 8:30 AM and 5:00 PM to 6:30 PM. Please do not attach motors directly to the main line.",
  },
  {
    id: "r2",
    section: "Water & Sanitation",
    title: "Garbage Segregation",
    body: "Wet waste (green bin) is collected every morning. Dry and plastic waste (blue bin) is collected on Tuesdays and Saturdays. Burning plastic inside village limits is strictly prohibited.",
  },
  {
    id: "r3",
    section: "Governance",
    title: "Gram Sabha Meetings",
    body: "Gram Sabha takes place four times a year: January 26, May 1, August 15, and October 2. Every registered resident above 18 years has the right to attend and speak.",
  },
  {
    id: "r4",
    section: "Public Spaces",
    title: "Use of Common Hall",
    body: "Village community hall can be booked for family functions at ₹500 per day. Submit request to Panchayat Secretary at least 7 days in advance.",
  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "n1",
    title: "Free Health Check-up Camp",
    body: "General medical camp and eye screening will take place this Sunday from 9 AM to 3 PM at the Panchayat Primary School. Doctors from District Hospital will attend.",
    date: day(1),
  },
  {
    id: "n2",
    title: "Property Tax Collection Drive",
    body: "Panchayat staff will collect annual house and water tax directly at the ward offices till the 30th of this month. Digital receipt provided immediately.",
    date: day(5),
  },
];

export const seedServices: ServiceRequest[] = [
  {
    id: "s1",
    citizenId: "c1",
    type: "Birth Certificate",
    details: "Required for school admission of my daughter. Born on 12/04/2021.",
    status: "Under Review",
    createdAt: day(2),
  },
];

export const seedContacts: Contact[] = [
  { id: "k1", name: "M. Ramanathan", role: "Panchayat President", phone: "9443100001" },
  { id: "k2", name: "S. Anbazhagan", role: "Panchayat Secretary", phone: "9443100002" },
  { id: "k3", name: "Dr. K. Vijay", role: "Primary Health Center MO", phone: "9443100003" },
  { id: "k4", name: "P. Murugan", role: "Electricity Board Overseer", phone: "9443100004" },
  { id: "k5", name: "Village Emergency SOS Line", role: "24x7 Help Desk", phone: "108" },
];

export const SERVICE_TYPES = [
  "Birth Certificate",
  "Death Certificate",
  "Income Certificate",
  "Water Tanker Request",
  "Street Light Repair Request",
  "Drainage Cleaning Request",
  "Other Service",
];
