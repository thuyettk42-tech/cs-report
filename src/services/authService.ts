import { UserProfile, AllowedUser } from '../types';

const STORAGE_KEY_AUTH_USER = 'kiotviet_auth_user_v1';
const STORAGE_KEY_ALLOWED_USERS = 'kiotviet_allowed_users_v1';
const STORAGE_KEY_SESSION_EXPIRES_AT = 'kiotviet_session_expires_at_v1';

export const INITIAL_ALLOWED_USERS: AllowedUser[] = [
  {
    email: 'thuyet.vm@kiotviet.com',
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS (Super Admin)',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
  {
    email: 'lam.tran@kiotviet.com',
    name: 'Trần Lâm',
    role: 'Quản lý CSKH (Lead Admin)',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
  {
    email: 'yen.nguyen@kiotviet.com',
    name: 'Nguyễn Thị Yến',
    role: 'Manager CS',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
  {
    email: 'cskh.leader@kiotviet.com',
    name: 'CSKH Team Leader',
    role: 'Team Leader',
    addedAt: '15/01/2026',
    addedBy: 'Trần Lâm',
  },
  {
    email: 'admin.care@kiotviet.com',
    name: 'System Admin CSKH',
    role: 'System Admin',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
];

export function getAllowedUsers(): AllowedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALLOWED_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(err);
  }
  return INITIAL_ALLOWED_USERS;
}

export function saveAllowedUsers(users: AllowedUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALLOWED_USERS, JSON.stringify(users));
  } catch (err) {
    console.error(err);
  }
}

export function addAllowedUser(newUser: Omit<AllowedUser, 'addedAt'>): { success: boolean; message: string } {
  const current = getAllowedUsers();
  const normalizedEmail = newUser.email.toLowerCase().trim();

  if (current.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: `Email ${normalizedEmail} đã tồn tại trong danh sách!` };
  }

  const updated: AllowedUser[] = [
    {
      ...newUser,
      email: normalizedEmail,
      addedAt: new Date().toLocaleDateString('vi-VN'),
    },
    ...current,
  ];

  saveAllowedUsers(updated);
  return { success: true, message: `Đã cấp quyền truy cập thành công cho ${normalizedEmail}!` };
}

export function removeAllowedUser(email: string): { success: boolean; message: string } {
  const current = getAllowedUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === 'thuyet.vm@kiotviet.com') {
    return { success: false, message: 'Không thể xóa tài khoản Super Admin chính!' };
  }

  const updated = current.filter((u) => u.email.toLowerCase() !== normalizedEmail);
  saveAllowedUsers(updated);
  return { success: true, message: `Đã thu hồi quyền của ${normalizedEmail}!` };
}

export function isEmailAllowed(email: string): { allowed: boolean; user?: AllowedUser } {
  const normalized = email.toLowerCase().trim();
  const list = getAllowedUsers();
  const found = list.find((u) => u.email.toLowerCase() === normalized);
  return {
    allowed: !!found,
    user: found,
  };
}

// 60 minutes inactivity limit (in milliseconds and seconds)
export const SESSION_INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutes = 3,600,000 ms
export const SESSION_COOKIE_NAME = 'kiotviet_session_token';
export const SESSION_COOKIE_MAX_AGE = 3600; // 3600 seconds = 60 minutes

/**
 * Set session cookie with 60-minute max-age
 */
export function setSessionCookie(maxAgeSeconds: number = SESSION_COOKIE_MAX_AGE): void {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${SESSION_COOKIE_NAME}=active; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
    }
  } catch (err) {
    console.warn('Cookie storage error:', err);
  }
}

/**
 * Clear session cookie on sign out
 */
export function clearSessionCookie(): void {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
    }
  } catch (err) {
    console.warn('Cookie clear error:', err);
  }
}

/**
 * Check if the cookie is still active
 */
export function hasSessionCookie(): boolean {
  try {
    if (typeof document === 'undefined') return true;
    return document.cookie.split(';').some((item) => item.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
  } catch {
    return false;
  }
}

/**
 * Refresh the 60-minute inactivity session whenever the user interacts
 * (clicking, typing, scrolling, responding)
 */
export function refreshSession(): void {
  const expiresAt = Date.now() + SESSION_INACTIVITY_LIMIT_MS;
  try {
    localStorage.setItem(STORAGE_KEY_SESSION_EXPIRES_AT, String(expiresAt));
    setSessionCookie(SESSION_COOKIE_MAX_AGE);
  } catch (err) {
    console.warn('Failed to refresh session timestamp', err);
  }
}

/**
 * Get remaining session seconds
 */
export function getSessionRemainingSeconds(): number {
  try {
    const rawExpires = localStorage.getItem(STORAGE_KEY_SESSION_EXPIRES_AT);
    if (!rawExpires) return 0;
    const expiresAt = Number(rawExpires);
    if (isNaN(expiresAt) || expiresAt <= 0) return 0;
    const remainingMs = expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  } catch {
    return 0;
  }
}

/**
 * Check whether the session has expired due to 60 minutes of inactivity
 */
export function isSessionExpired(): boolean {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!rawUser) return true;

    const remainingSec = getSessionRemainingSeconds();
    if (remainingSec <= 0) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!raw) return null;

    // Check if 60-minute inactivity session has expired
    if (isSessionExpired()) {
      signOut();
      return null;
    }

    return JSON.parse(raw);
  } catch (err) {
    console.warn(err);
  }
  return null;
}

export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      refreshSession();
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_SESSION_EXPIRES_AT);
      clearSessionCookie();
    }
  } catch (err) {
    console.error(err);
  }
}

export function signInWithGoogle(emailInput?: string): { success: boolean; user?: UserProfile; message?: string } {
  const email = (emailInput || 'thuyet.vm@kiotviet.com').toLowerCase().trim();
  const { allowed, user: allowedUser } = isEmailAllowed(email);

  if (!allowed) {
    return {
      success: false,
      message: `Tài khoản Google "${email}" chưa được cấp quyền truy cập. Vui lòng liên hệ Thuyết (thuyet.vm@kiotviet.com) hoặc Lâm (lam.tran@kiotviet.com) để được thêm vào danh sách Admin.`,
    };
  }

  const initials = allowedUser?.name
    ? allowedUser.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase()
    : 'KV';

  const authUser: UserProfile = {
    name: allowedUser?.name || email.split('@')[0],
    role: allowedUser?.role || 'Quản lý CSKH',
    email: email,
    avatarText: initials,
    provider: 'google',
    isAdmin: true,
  };

  setCurrentUser(authUser);
  return { success: true, user: authUser };
}

export function signInWithCredentials(emailInput: string, passwordInput: string): { success: boolean; user?: UserProfile; message?: string } {
  const email = emailInput.toLowerCase().trim();
  const { allowed, user: allowedUser } = isEmailAllowed(email);

  if (!allowed) {
    return {
      success: false,
      message: `Tài khoản nội bộ "${email}" không tồn tại trong danh sách Whitelist được cấp quyền.`,
    };
  }

  // Password check: KiotViet default or custom
  if (passwordInput !== 'KiotViet#2026' && passwordInput !== 'KiotViet#2024') {
    return {
      success: false,
      message: 'Mật khẩu bảo mật không chính xác. Vui lòng kiểm tra lại!',
    };
  }

  const initials = allowedUser?.name
    ? allowedUser.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase()
    : 'KV';

  const authUser: UserProfile = {
    name: allowedUser?.name || 'Trần Lâm',
    role: allowedUser?.role || 'Quản lý CSKH',
    email: email,
    avatarText: initials,
    provider: 'sso',
    isAdmin: true,
  };

  setCurrentUser(authUser);
  return { success: true, user: authUser };
}

export function signOut(): void {
  setCurrentUser(null);
}
