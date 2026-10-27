import { UserProfile, AllowedUser } from '../types';

const STORAGE_KEY_AUTH_USER = 'kiotviet_auth_user_v1';
const STORAGE_KEY_ALLOWED_USERS = 'kiotviet_allowed_users_v1';

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

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(err);
  }
  // Default logged in user matching the supervisor
  return {
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS',
    email: 'thuyet.vm@kiotviet.com',
    avatarText: 'VT',
    provider: 'google',
    isAdmin: true,
  };
}

export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
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
