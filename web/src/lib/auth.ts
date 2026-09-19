export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: 'villager' | 'admin';
  language: string;
  address?: string;
  ward?: string;
  avatar?: string;
  email?: string;
  officeOrDepartment?: string;
  username?: string;
  designation?: string;
  department?: string;
  token?: string;
  governmentKeyUsed?: string;
  createdAt?: string;
  securityQuestions?: Array<{ question: string }>;
}

const ADMIN_SESSION_KEY = 'gramvoice_admin_session';
const CITIZEN_SESSION_KEY = 'gramvoice_citizen_session';
const LEGACY_SESSION_KEY = 'gramvoice_user_session';

export function saveUser(user: UserSession): void {
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(user);
    if (user.role === 'admin') {
      localStorage.setItem(ADMIN_SESSION_KEY, serialized);
    } else {
      localStorage.setItem(CITIZEN_SESSION_KEY, serialized);
    }
    // Also save to legacy key for compatibility
    localStorage.setItem(LEGACY_SESSION_KEY, serialized);
  }
}

export function getUser(portal?: 'citizen' | 'admin'): UserSession | null {
  if (typeof window === 'undefined') return null;

  const isAdminRoute = portal ? portal === 'admin' : window.location.pathname.startsWith('/admin');

  // Check portal-specific key first
  const specificKey = isAdminRoute ? ADMIN_SESSION_KEY : CITIZEN_SESSION_KEY;
  const data = localStorage.getItem(specificKey);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && (parsed.id || parsed.token)) {
        return parsed as UserSession;
      }
    } catch (e) {
      console.error('Error parsing portal user session:', e);
    }
  }

  // Fallback to legacy key only if role matches the current context
  const legacyData = localStorage.getItem(LEGACY_SESSION_KEY);
  if (legacyData) {
    try {
      const parsed = JSON.parse(legacyData);
      if (parsed && (parsed.id || parsed.token)) {
        const expectedRole = isAdminRoute ? 'admin' : 'villager';
        if (parsed.role === expectedRole) {
          return parsed as UserSession;
        }
      }
    } catch (e) {
      console.error('Error parsing legacy user session:', e);
    }
  }

  return null;
}

export function getToken(): string | null {
  const user = getUser();
  return user?.token || null;
}

export function clearUser(portal?: 'citizen' | 'admin'): void {
  if (typeof window !== 'undefined') {
    const isAdminRoute = portal ? portal === 'admin' : window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } else {
      localStorage.removeItem(CITIZEN_SESSION_KEY);
    }
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}
