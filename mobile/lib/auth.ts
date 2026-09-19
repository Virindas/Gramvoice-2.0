import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

let memoryCitizenSession: UserSession | null = null;
let memoryAdminSession: UserSession | null = null;

const ADMIN_TOKEN_KEY = 'gramvoice_admin_token';
const CITIZEN_TOKEN_KEY = 'gramvoice_citizen_token';
const ADMIN_SESSION_KEY = 'gramvoice_admin_session';
const CITIZEN_SESSION_KEY = 'gramvoice_citizen_session';
const LEGACY_TOKEN_KEY = 'gramvoice_jwt_token';
const LEGACY_SESSION_KEY = 'gramvoice_user_session';

export async function saveUser(user: UserSession): Promise<void> {
  const isAdmin = user.role === 'admin';
  if (isAdmin) {
    memoryAdminSession = user;
  } else {
    memoryCitizenSession = user;
  }

  const jsonString = JSON.stringify(user);
  const sessionKey = isAdmin ? ADMIN_SESSION_KEY : CITIZEN_SESSION_KEY;
  const tokenKey = isAdmin ? ADMIN_TOKEN_KEY : CITIZEN_TOKEN_KEY;

  if (Platform.OS === 'web') {
    try {
      if (user.token) {
        localStorage.setItem(tokenKey, user.token);
        localStorage.setItem(LEGACY_TOKEN_KEY, user.token);
      }
      localStorage.setItem(sessionKey, jsonString);
      localStorage.setItem(LEGACY_SESSION_KEY, jsonString);
    } catch (e) {
      /* ignore */
    }
  } else {
    try {
      if (user.token) {
        await SecureStore.setItemAsync(tokenKey, user.token);
        await SecureStore.setItemAsync(LEGACY_TOKEN_KEY, user.token);
      }
      await SecureStore.setItemAsync(sessionKey, jsonString);
      await SecureStore.setItemAsync(LEGACY_SESSION_KEY, jsonString);
    } catch (e) {
      console.warn('SecureStore error saving session:', e);
    }
  }
}

export async function getUser(portal?: 'citizen' | 'admin'): Promise<UserSession | null> {
  // Determine if admin or citizen context
  let isAdmin = portal === 'admin';
  if (!portal && typeof window !== 'undefined' && window.location?.pathname) {
    isAdmin = window.location.pathname.startsWith('/admin');
  }

  if (isAdmin && memoryAdminSession) return memoryAdminSession;
  if (!isAdmin && memoryCitizenSession) return memoryCitizenSession;

  const targetKey = isAdmin ? ADMIN_SESSION_KEY : CITIZEN_SESSION_KEY;

  if (Platform.OS === 'web') {
    try {
      const data = localStorage.getItem(targetKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (isAdmin) memoryAdminSession = parsed;
        else memoryCitizenSession = parsed;
        return parsed;
      }
      // Check legacy only if role matches
      const legacyData = localStorage.getItem(LEGACY_SESSION_KEY);
      if (legacyData) {
        const parsed = JSON.parse(legacyData);
        if ((isAdmin && parsed.role === 'admin') || (!isAdmin && parsed.role === 'villager')) {
          return parsed;
        }
      }
    } catch (e) {
      /* ignore */
    }
  } else {
    try {
      const data = await SecureStore.getItemAsync(targetKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (isAdmin) memoryAdminSession = parsed;
        else memoryCitizenSession = parsed;
        return parsed;
      }
      const legacyData = await SecureStore.getItemAsync(LEGACY_SESSION_KEY);
      if (legacyData) {
        const parsed = JSON.parse(legacyData);
        if ((isAdmin && parsed.role === 'admin') || (!isAdmin && parsed.role === 'villager')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('SecureStore error reading session:', e);
    }
  }
  return null;
}

export async function getToken(portal?: 'citizen' | 'admin'): Promise<string | null> {
  const user = await getUser(portal);
  if (user?.token) return user.token;

  let isAdmin = portal === 'admin';
  if (!portal && typeof window !== 'undefined' && window.location?.pathname) {
    isAdmin = window.location.pathname.startsWith('/admin');
  }
  const tokenKey = isAdmin ? ADMIN_TOKEN_KEY : CITIZEN_TOKEN_KEY;

  if (Platform.OS === 'web') {
    return localStorage.getItem(tokenKey);
  } else {
    try {
      return await SecureStore.getItemAsync(tokenKey);
    } catch (e) {
      return null;
    }
  }
}

export async function logout(portal?: 'citizen' | 'admin'): Promise<void> {
  let isAdmin = portal === 'admin';
  if (!portal && typeof window !== 'undefined' && window.location?.pathname) {
    isAdmin = window.location.pathname.startsWith('/admin');
  }

  if (isAdmin) {
    memoryAdminSession = null;
  } else {
    memoryCitizenSession = null;
  }

  const tokenKey = isAdmin ? ADMIN_TOKEN_KEY : CITIZEN_TOKEN_KEY;
  const sessionKey = isAdmin ? ADMIN_SESSION_KEY : CITIZEN_SESSION_KEY;

  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(sessionKey);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem(LEGACY_SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  } else {
    try {
      await SecureStore.deleteItemAsync(tokenKey);
      await SecureStore.deleteItemAsync(sessionKey);
      await SecureStore.deleteItemAsync(LEGACY_TOKEN_KEY);
      await SecureStore.deleteItemAsync(LEGACY_SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
  }
}
