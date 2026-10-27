import { UserProfile, AllowedUser } from '../types';

const STORAGE_KEY_AUTH_USER = 'kiotviet_auth_user_v1';
const STORAGE_KEY_ALLOWED_USERS = 'kiotviet_allowed_users_v1';
const STORAGE_KEY_SESSION_EXPIRES_AT = 'kiotviet_session_expires_at_v1';

export const INITIAL_ALLOWED_USERS: AllowedUser[] = [
  {
    email: 'thuyettk42@gmail.com',
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS (Super Admin)',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
  {
    email: 'hai.nguyen@kiotviet.com',
    name: 'Hải Nguyễn',
    role: 'Giám Đốc / Quản Lý CSKH',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'lam.hn@kiotviet.com',
    name: 'Lâm HN',
    role: 'Quản Lý Vận Hành CSKH',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'yendao@kiotviet.com',
    name: 'Yến Đào',
    role: 'Manager CS',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'thuyet.vm@kiotviet.com',
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
];

export function getAllowedUsers(): AllowedUser[] {
  let list = INITIAL_ALLOWED_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALLOWED_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (err) {
    console.warn(err);
  }

  // Ensure mandatory whitelist accounts are always present
  const mandatoryUsers: AllowedUser[] = [
    { email: 'thuyettk42@gmail.com', name: 'Vũ Minh Thuyết', role: 'Manager CS (Super Admin)', addedAt: '01/01/2026', addedBy: 'Hệ thống KiotViet' },
    { email: 'hai.nguyen@kiotviet.com', name: 'Hải Nguyễn', role: 'Giám Đốc / Quản Lý CSKH', addedAt: '01/01/2026', addedBy: 'Vũ Minh Thuyết' },
    { email: 'lam.hn@kiotviet.com', name: 'Lâm HN', role: 'Quản Lý Vận Hành CSKH', addedAt: '01/01/2026', addedBy: 'Vũ Minh Thuyết' },
    { email: 'yendao@kiotviet.com', name: 'Yến Đào', role: 'Manager CS', addedAt: '01/01/2026', addedBy: 'Vũ Minh Thuyết' },
  ];

  let hasChanged = false;
  mandatoryUsers.forEach((req) => {
    if (!list.some((u) => u.email.toLowerCase() === req.email.toLowerCase())) {
      list.push(req);
      hasChanged = true;
    }
  });

  if (hasChanged) {
    saveAllowedUsers(list);
  }

  return list;
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

  if (normalizedEmail === 'thuyet.vm@kiotviet.com' || normalizedEmail === 'thuyettk42@gmail.com') {
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

const STORAGE_KEY_GOOGLE_CLIENT_ID = 'kiotviet_google_client_id_v1';

export function getGoogleClientId(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
    if (custom && custom.trim().length > 0) return custom.trim();
  } catch (e) {
    console.warn(e);
  }
  return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
}

export function saveGoogleClientId(clientId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOOGLE_CLIENT_ID, clientId.trim());
  } catch (err) {
    console.error('Failed to save Google Client ID', err);
  }
}

/**
 * Verifies a real Google Profile obtained from Google OAuth against the Admin Whitelist
 */
export function verifyAndSignInGoogleProfile(profile: {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
}): { success: boolean; user?: UserProfile; message?: string } {
  const email = (profile.email || '').toLowerCase().trim();
  if (!email) {
    return { success: false, message: 'Google không trả về thông tin email hợp lệ.' };
  }

  const { allowed, user: allowedUser } = isEmailAllowed(email);

  if (!allowed) {
    return {
      success: false,
      message: `Tài khoản Google "${email}" chưa được cấp quyền truy cập. Vui lòng liên hệ Quản lý (thuyet.vm@kiotviet.com hoặc lam.tran@kiotviet.com) để thêm vào Whitelist.`,
    };
  }

  const initials = allowedUser?.name
    ? allowedUser.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  const authUser: UserProfile = {
    name: allowedUser?.name || profile.name || email.split('@')[0],
    role: allowedUser?.role || 'Quản lý CSKH',
    email: email,
    avatarText: initials,
    provider: 'google',
    isAdmin: true,
  };

  setCurrentUser(authUser);
  return { success: true, user: authUser };
}

/**
 * Triggers authentic Google OAuth 2.0 popup via Google Identity Services (GIS)
 */
export function triggerGoogleIdentityPopup(callbacks: {
  onSuccess: (user: UserProfile) => void;
  onError: (msg: string) => void;
  onConfigNeeded: () => void;
}): void {
  const clientId = getGoogleClientId();

  // If Google Client ID is not configured yet, notify user to configure it
  if (!clientId) {
    callbacks.onConfigNeeded();
    return;
  }

  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    callbacks.onError('Thư viện Google Identity Services chưa tải xong. Vui lòng tải lại trang hoặc kiểm tra kết nối mạng.');
    return;
  }

  try {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          if (tokenResponse.error === 'access_denied') {
            callbacks.onError('Bạn đã từ chối xác thực tài khoản Google.');
          } else {
            callbacks.onError(`Lỗi xác thực Google: ${tokenResponse.error_description || tokenResponse.error}`);
          }
          return;
        }

        if (!tokenResponse.access_token) {
          callbacks.onError('Google không cấp mã truy cập xác thực.');
          return;
        }

        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });

          if (!res.ok) {
            throw new Error(`Google trả về mã lỗi ${res.status}`);
          }

          const profile = await res.json();
          const verification = verifyAndSignInGoogleProfile(profile);

          if (verification.success && verification.user) {
            callbacks.onSuccess(verification.user);
          } else {
            callbacks.onError(verification.message || 'Tài khoản Google không có trong danh sách Whitelist.');
          }
        } catch (fetchErr: any) {
          callbacks.onError(`Không thể đọc hồ sơ Google: ${fetchErr.message}`);
        }
      },
    });

    // Forces Google to show the account chooser popup (select_account)
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err: any) {
    callbacks.onError(`Không thể khởi tạo cửa sổ đăng nhập Google: ${err.message}`);
  }
}

export function signInWithCredentials(emailInput: string, passwordInput: string): { success: boolean; user?: UserProfile; message?: string } {
  return loginWithWhitelistedEmail(emailInput, passwordInput);
}

/**
 * Direct Whitelist Authentication:
 * Checks if email belongs to the internal authorized Whitelist.
 * If password is provided, verifies security passcode.
 */
export function loginWithWhitelistedEmail(
  emailInput: string,
  passwordInput?: string
): { success: boolean; user?: UserProfile; message?: string } {
  const email = emailInput.toLowerCase().trim();
  if (!email) {
    return { success: false, message: 'Vui lòng nhập hoặc chọn tài khoản email được cấp quyền.' };
  }

  const { allowed, user: allowedUser } = isEmailAllowed(email);

  if (!allowed) {
    return {
      success: false,
      message: `Tài khoản "${email}" KHÔNG nằm trong danh sách Whitelist được cấp quyền xem báo cáo nội bộ CSKH KiotViet. Vui lòng liên hệ Quản trị viên (thuyettk42@gmail.com / thuyet.vm@kiotviet.com).`,
    };
  }

  // Check password if provided (default KiotViet#2026)
  if (passwordInput && passwordInput.trim() !== '') {
    if (passwordInput !== 'KiotViet#2026' && passwordInput !== 'KiotViet#2024') {
      return {
        success: false,
        message: 'Mật khẩu bảo mật nội bộ không chính xác. Mật khẩu mặc định: KiotViet#2026',
      };
    }
  }

  const initials = allowedUser?.name
    ? allowedUser.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase()
    : 'KV';

  const authUser: UserProfile = {
    name: allowedUser?.name || 'Vũ Minh Thuyết',
    role: allowedUser?.role || 'Manager CS',
    email: email,
    avatarText: initials,
    provider: email.includes('@gmail.com') ? 'google' : 'sso',
    isAdmin: true,
  };

  setCurrentUser(authUser);
  return { success: true, user: authUser };
}

export function signOut(): void {
  setCurrentUser(null);
}
