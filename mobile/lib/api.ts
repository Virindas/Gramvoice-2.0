import Constants from 'expo-constants';
import { getToken, logout, getUser } from './auth';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Extract host IP if it matches a valid local IPv4 pattern (e.g. 192.168.x.x or 10.x.x.x)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).experienceUrl || '';
  if (hostUri) {
    const rawHost = hostUri.split(':')[0];
    // Strict IPv4 regex test to avoid sending http requests to SSL/tunnel hostnames
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(rawHost)) {
      if (rawHost !== '127.0.0.1') {
        return `http://${rawHost}:5000`;
      }
    }
  }

  return 'http://localhost:5000';
};

export const API_BASE = getApiBaseUrl();
export { getApiBaseUrl };

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error('Network error: Unable to connect to backend server');
  }

  if (res.status === 401) {
    throw new Error('Unauthorized or session expired');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  citizenSignup: async (payload: { name: string; phone: string; address?: string; ward?: string; language?: string; pin?: string }) => {
    return apiFetch('/api/auth/register-villager', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  citizenLogin: async (payload: { phone: string; pin?: string } | string, pinArg?: string) => {
    const body = typeof payload === 'string' ? { phone: payload, pin: pinArg } : payload;
    return apiFetch('/api/auth/login-villager', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  checkCitizenPhone: async (phone: string) => {
    return apiFetch('/api/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  resetCitizenPin: async (phone: string, pin: string) => {
    return apiFetch('/api/auth/reset-pin', {
      method: 'POST',
      body: JSON.stringify({ phone, pin }),
    });
  },

  verifyVillagerOTP: async (payload: { phone: string; otp: string }) => {
    return apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminRegister: async (payload: any) => {
    return apiFetch('/api/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async () => {
    return apiFetch('/api/auth/me');
  },

  updateProfile: async (payload: any) => {
    return apiFetch('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  adminLogin: async (payload: { username?: string; email?: string; identifier?: string; password: string }) => {
    return apiFetch('/api/auth/login-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminLookup: async (identifier: string) => {
    return apiFetch('/api/auth/forgot-password-question', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  verifyAdminSecurityAnswers: async (identifier: string, answers: string[]) => {
    return apiFetch('/api/auth/verify-security-answers', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, answers }),
    });
  },

  resetAdminPassword: async (payload: { username?: string; email?: string; identifier?: string; new_password?: string; password?: string }) => {
    return apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Complaints
  createComplaint: async (payload: { textDescription: string; category?: string; inputMethod?: string; complaint_text?: string }) => {
    return apiFetch('/api/complaints', {
      method: 'POST',
      body: JSON.stringify({
        category: payload.category || 'general',
        department: payload.category || 'Panchayat',
        inputMethod: payload.inputMethod || 'Manual',
        textDescription: payload.textDescription,
        complaint_text: payload.complaint_text || payload.textDescription,
      }),
    });
  },

  createVoiceComplaint: async (
    audioFile: { uri: string; name?: string; type?: string } | Blob,
    textDescription: string,
    category: string = 'Water'
  ) => {
    const formData = new FormData();
    if (typeof Blob !== 'undefined' && audioFile instanceof Blob) {
      formData.append('audio', audioFile, 'recording.webm');
    } else {
      const fileObj = audioFile as { uri: string; name?: string; type?: string };
      formData.append('audio', {
        uri: fileObj.uri,
        name: fileObj.name || 'recording.m4a',
        type: fileObj.type || 'audio/m4a',
      } as any);
    }
    formData.append('textDescription', textDescription);
    formData.append('complaint_text', textDescription);
    formData.append('category', category);
    formData.append('department', category);
    formData.append('inputMethod', 'Voice');
    formData.append('type', 'voice');

    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/complaints`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit voice complaint');
    return data;
  },

  getMyComplaints: async () => {
    return apiFetch('/api/complaints/my');
  },

  getAllComplaints: async () => {
    return apiFetch('/api/complaints');
  },

  getComplaintById: async (id: string) => {
    return apiFetch(`/api/complaints/${id}`);
  },

  translateComplaintText: async (id: string, targetLang: 'hi' | 'ta' | 'en') => {
    return apiFetch(`/api/complaints/${id}/translate`, {
      method: 'POST',
      body: JSON.stringify({ targetLang }),
    });
  },

  updateComplaintStatus: async (id: string, payload: { status: string; adminNotes?: string }) => {
    return apiFetch(`/api/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Village Info / Rules
  getVillageInfo: async () => {
    return apiFetch('/api/village-info');
  },

  createRule: async (rule: any) => {
    return apiFetch('/api/village-info', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  updateRule: async (id: string, rule: any) => {
    return apiFetch(`/api/village-info/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(rule),
    });
  },

  deleteRule: async (id: string) => {
    return apiFetch(`/api/village-info/${id}`, {
      method: 'DELETE',
    });
  },

  // Announcements
  getAnnouncements: async () => {
    return apiFetch('/api/announcements');
  },

  createAnnouncement: async (announcement: any) => {
    return apiFetch('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  },

  updateAnnouncement: async (id: string, announcement: any) => {
    return apiFetch(`/api/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(announcement),
    });
  },

  deleteAnnouncement: async (id: string) => {
    return apiFetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // Services
  getServices: async () => {
    return apiFetch('/api/service-requests');
  },

  createService: async (service: any) => {
    return apiFetch('/api/service-requests', {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  updateService: async (id: string, patch: { status?: string; details?: string; reply?: string }) => {
    return apiFetch(`/api/service-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  deleteService: async (id: string) => {
    return apiFetch(`/api/service-requests/${id}`, {
      method: 'DELETE',
    });
  },

  // Contacts
  getContacts: async () => {
    return apiFetch('/api/contacts');
  },

  createContact: async (contact: { name: string; role?: string; phone: string; office?: string }) => {
    return apiFetch('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        phoneNumber: contact.phone,
        office: contact.office,
      }),
    });
  },

  updateContact: async (id: string, contact: { name?: string; role?: string; phone?: string; office?: string }) => {
    return apiFetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: contact.name,
        role: contact.role,
        phone: contact.phone,
        phoneNumber: contact.phone,
        office: contact.office,
      }),
    });
  },

  deleteContact: async (id: string) => {
    return apiFetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};
