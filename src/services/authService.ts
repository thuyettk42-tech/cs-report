import { UserProfile, AllowedUser, AccessRequest } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_AUTH_USER = 'kiotviet_auth_user_v1';
const STORAGE_KEY_ALLOWED_USERS = 'kiotviet_allowed_users_v1';
const STORAGE_KEY_SESSION_EXPIRES_AT = 'kiotviet_session_expires_at_v1';
const STORAGE_KEY_ACCESS_REQUESTS = 'kiotviet_access_requests_v1';

export const INITIAL_ALLOWED_USERS: AllowedUser[] = [
  {
    email: 'thuyettk42@gmail.com',
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS (Super Admin)',
    permission: 'super_admin',
    permissionLabel: 'Toàn quyền Quản trị (Super Admin)',
    department: 'Ban Giám Đốc CSKH',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
  {
    email: 'hai.nguyen@kiotviet.com',
    name: 'Hải Nguyễn',
    role: 'Giám Đốc / Quản Lý CSKH',
    permission: 'full_access',
    permissionLabel: 'Quản lý CSKH (Full Access)',
    department: 'Vận hành CSKH',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'lam.hn@kiotviet.com',
    name: 'Lâm HN',
    role: 'Quản Lý Vận Hành CSKH',
    permission: 'full_access',
    permissionLabel: 'Quản lý CSKH (Full Access)',
    department: 'Vận hành CSKH & BPO',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'yendao@kiotviet.com',
    name: 'Yến Đào',
    role: 'Manager CS',
    permission: 'full_access',
    permissionLabel: 'Quản lý CSKH (Full Access)',
    department: 'Chất lượng & CSAT',
    addedAt: '01/01/2026',
    addedBy: 'Vũ Minh Thuyết',
  },
  {
    email: 'thuyet.vm@kiotviet.com',
    name: 'Vũ Minh Thuyết',
    role: 'Manager CS (Super Admin)',
    permission: 'super_admin',
    permissionLabel: 'Toàn quyền Quản trị (Super Admin)',
    department: 'Ban Giám Đốc CSKH',
    addedAt: '01/01/2026',
    addedBy: 'Hệ thống KiotViet',
  },
];

export function isSuperAdmin(user?: UserProfile | null | string): boolean {
  if (!user) return false;
  const email = (typeof user === 'string' ? user : user.email || '').toLowerCase().trim();
  return email === 'thuyettk42@gmail.com' || email === 'thuyet.vm@kiotviet.com';
}

export function updateAllowedUser(
  originalEmail: string,
  updatedData: Partial<AllowedUser>
): { success: boolean; message: string; updatedUser?: AllowedUser } {
  const current = getAllowedUsers();
  const normalizedOriginal = originalEmail.toLowerCase().trim();
  const index = current.findIndex((u) => u.email.toLowerCase() === normalizedOriginal);

  if (index === -1) {
    return { success: false, message: `Không tìm thấy tài khoản với email ${originalEmail}.` };
  }

  const existing = current[index];
  const newEmail = updatedData.email ? updatedData.email.toLowerCase().trim() : existing.email;

  // If email changed, check for conflict with other existing accounts
  if (newEmail !== normalizedOriginal) {
    if (current.some((u, idx) => idx !== index && u.email.toLowerCase() === newEmail)) {
      return { success: false, message: `Email ${newEmail} đã tồn tại trong danh sách!` };
    }
  }

  const updated: AllowedUser = {
    ...existing,
    ...updatedData,
    email: newEmail,
    name: updatedData.name ? updatedData.name.trim() : existing.name,
    role: updatedData.role ? updatedData.role.trim() : existing.role,
    permission: updatedData.permission || existing.permission || 'full_access',
    permissionLabel: updatedData.permissionLabel || existing.permissionLabel || updatedData.role || existing.role,
    department: updatedData.department !== undefined ? updatedData.department : existing.department,
  };

  current[index] = updated;
  saveAllowedUsers(current);

  // If the currently logged-in user is the one being updated, update session profile too
  const activeUser = getCurrentUser();
  if (activeUser && activeUser.email.toLowerCase() === normalizedOriginal) {
    const updatedProfile: UserProfile = {
      ...activeUser,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatarText: updated.name ? updated.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase() : activeUser.avatarText,
    };
    setCurrentUser(updatedProfile);
  }

  return {
    success: true,
    message: `Đã cập nhật thông tin thành công cho tài khoản ${updated.name} (${updated.email})!`,
    updatedUser: updated,
  };
}

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

export function isEmailAllowed(email: string): { allowed: boolean; user?: AllowedUser; pendingRequest?: AccessRequest } {
  const normalized = email.toLowerCase().trim();
  const list = getAllowedUsers();
  const found = list.find((u) => u.email.toLowerCase() === normalized);
  if (found) {
    return {
      allowed: true,
      user: found,
    };
  }
  const requests = getAccessRequests();
  const pending = requests.find((r) => r.email.toLowerCase() === normalized && r.status === 'pending');
  return {
    allowed: false,
    pendingRequest: pending,
  };
}

// ==============================================================
// GOOGLE ACCOUNT REGISTRATION & PENDING APPROVAL MANAGEMENT
// ==============================================================

export const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-01',
    email: 'minh.nguyen@kiotviet.com',
    name: 'Nguyễn Văn Minh',
    department: 'Vận hành CSKH',
    requestedRole: 'Quản lý CSKH',
    note: 'Cần theo dõi SLA cuộc gọi và ticket khối BPO Outsource',
    provider: 'google',
    status: 'pending',
    createdAt: '05/11/2026 15:30',
  },
  {
    id: 'req-02',
    email: 'thu.ha@gmail.com',
    name: 'Đặng Thu Hà',
    department: 'Chất lượng & QA CSAT',
    requestedRole: 'Giám sát / QA (View & Export)',
    note: 'Theo dõi chỉ số CSAT và đánh giá cuộc gọi dự án KAT',
    provider: 'google',
    status: 'pending',
    createdAt: '06/11/2026 09:10',
  },
];

export function getAccessRequests(): AccessRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCESS_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return INITIAL_ACCESS_REQUESTS;
}

export function saveAccessRequests(requests: AccessRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCESS_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save access requests', err);
  }
}

/**
 * Đăng ký tài khoản mới bằng Google Account để gửi Super Admin xét duyệt
 */
export function submitGoogleRegistration(data: {
  email: string;
  name?: string;
  department?: string;
  requestedRole?: string;
  note?: string;
}): { success: boolean; message: string; request?: AccessRequest; alreadyApproved?: boolean } {
  const email = data.email.toLowerCase().trim();
  if (!email) {
    return { success: false, message: 'Email Google không được để trống.' };
  }

  // 1. Kiểm tra xem tài khoản đã được phê duyệt trong Whitelist chưa
  const allowed = getAllowedUsers().find((u) => u.email.toLowerCase() === email);
  if (allowed) {
    return {
      success: true,
      alreadyApproved: true,
      message: `Tài khoản "${email}" đã được phê duyệt trong hệ thống. Bạn có thể đăng nhập ngay!`,
    };
  }

  // 2. Kiểm tra xem đã gửi yêu cầu trước đó chưa
  const currentRequests = getAccessRequests();
  const existingPending = currentRequests.find((r) => r.email.toLowerCase() === email && r.status === 'pending');
  if (existingPending) {
    return {
      success: true,
      request: existingPending,
      message: `Yêu cầu đăng ký của tài khoản "${email}" đã được gửi và đang chờ Super Admin (thuyettk42@gmail.com) phê duyệt.`,
    };
  }

  // 3. Tạo yêu cầu mới
  const now = new Date();
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const newRequest: AccessRequest = {
    id: `req-${Date.now()}`,
    email: email,
    name: data.name ? data.name.trim() : email.split('@')[0],
    department: data.department ? data.department.trim() : 'Vận hành CSKH',
    requestedRole: data.requestedRole || 'Quản lý CSKH',
    note: data.note || 'Đăng ký tài khoản qua Google Account',
    provider: 'google',
    status: 'pending',
    createdAt: timeStr,
  };

  const updated = [newRequest, ...currentRequests];
  saveAccessRequests(updated);

  // Nếu Supabase đã kết nối, đồng bộ ngầm vào bảng access_requests
  if (isSupabaseConfigured()) {
    getSupabaseClient()
      .from('access_requests')
      .upsert({
        email: newRequest.email,
        name: newRequest.name,
        department: newRequest.department,
        requested_role: newRequest.requestedRole,
        note: newRequest.note,
        status: 'pending',
      })
      .then(
        ({ error }) => {
          if (error) console.warn('Supabase sync access_requests error:', error);
        },
        (err: any) => console.warn('Supabase insert error', err)
      );
  }

  return {
    success: true,
    request: newRequest,
    message: `Đăng ký thành công! Yêu cầu của bạn đã được chuyển đến Super Admin (Vũ Minh Thuyết - thuyettk42@gmail.com) để xét duyệt.`,
  };
}

/**
 * Super Admin (thuyettk42@gmail.com) phê duyệt yêu cầu cấp quyền
 */
export function approveAccessRequest(
  requestId: string,
  roleToAssign?: string,
  reviewerEmail: string = 'thuyettk42@gmail.com'
): { success: boolean; message: string; approvedUser?: AllowedUser } {
  const currentRequests = getAccessRequests();
  const reqIndex = currentRequests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) {
    return { success: false, message: 'Không tìm thấy yêu cầu cấp quyền.' };
  }

  const req = currentRequests[reqIndex];
  const now = new Date();
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Cập nhật trạng thái yêu cầu
  currentRequests[reqIndex] = {
    ...req,
    status: 'approved',
    reviewedAt: timeStr,
    reviewedBy: reviewerEmail,
  };
  saveAccessRequests(currentRequests);

  // 2. Thêm ngay vào danh sách Whitelist Allowed Users
  const assignedRole = roleToAssign || req.requestedRole || 'Quản lý CSKH';
  const res = addAllowedUser({
    email: req.email,
    name: req.name,
    role: assignedRole,
    permission: assignedRole.includes('Super') ? 'super_admin' : 'full_access',
    permissionLabel: assignedRole,
    department: req.department || 'Vận hành CSKH',
    addedBy: `Duyệt bởi ${reviewerEmail} (${timeStr})`,
  });

  // 3. Nếu Supabase đã kết nối, cập nhật cả 2 bảng trên Supabase
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    supabase
      .from('access_requests')
      .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: reviewerEmail })
      .eq('email', req.email)
      .then(
        () => {},
        (e: any) => console.warn(e)
      );

    supabase
      .from('allowed_users')
      .upsert({ email: req.email, name: req.name, role: assignedRole, is_active: true })
      .then(
        () => {},
        (e: any) => console.warn(e)
      );
  }

  return {
    success: true,
    message: `Đã phê duyệt tài khoản ${req.name} (${req.email}) thành công! Nhân sự có thể đăng nhập ngay bằng Google Account.`,
  };
}

/**
 * Super Admin từ chối yêu cầu cấp quyền
 */
export function rejectAccessRequest(
  requestId: string,
  reviewerEmail: string = 'thuyettk42@gmail.com'
): { success: boolean; message: string } {
  const currentRequests = getAccessRequests();
  const reqIndex = currentRequests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) {
    return { success: false, message: 'Không tìm thấy yêu cầu cấp quyền.' };
  }

  const req = currentRequests[reqIndex];
  const now = new Date();
  const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  currentRequests[reqIndex] = {
    ...req,
    status: 'rejected',
    reviewedAt: timeStr,
    reviewedBy: reviewerEmail,
  };
  saveAccessRequests(currentRequests);

  if (isSupabaseConfigured()) {
    getSupabaseClient()
      .from('access_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: reviewerEmail })
      .eq('email', req.email)
      .then(
        () => {},
        (e: any) => console.warn(e)
      );
  }

  return {
    success: true,
    message: `Đã từ chối yêu cầu cấp quyền của ${req.email}.`,
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
export const DEFAULT_GOOGLE_CLIENT_ID = '115149341080-3n986jfq7k3pvt73drts82r6moaeo50q.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
    if (custom && custom.trim().length > 0) return custom.trim();
  } catch (e) {
    console.warn(e);
  }
  return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
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
}): { success: boolean; user?: UserProfile; message?: string; isPending?: boolean; requestCreated?: boolean } {
  const email = (profile.email || '').toLowerCase().trim();
  if (!email) {
    return { success: false, message: 'Google không trả về thông tin email hợp lệ.' };
  }

  const { allowed, user: allowedUser, pendingRequest } = isEmailAllowed(email);

  if (!allowed) {
    if (pendingRequest) {
      return {
        success: false,
        isPending: true,
        message: `Tài khoản Google "${email}" đang chờ Super Admin (Vũ Minh Thuyết - thuyettk42@gmail.com) xét duyệt & phân quyền truy cập.`,
      };
    }

    // Tự động tạo yêu cầu đăng ký cho tài khoản Google này
    submitGoogleRegistration({
      email,
      name: profile.name || email.split('@')[0],
      department: 'Vận hành CSKH',
      requestedRole: 'Quản lý CSKH',
      note: 'Đăng nhập Google lần đầu - Chờ duyệt',
    });

    return {
      success: false,
      isPending: true,
      requestCreated: true,
      message: `Tài khoản Google "${email}" chưa có trong danh sách phân quyền. Hệ thống đã tự động gửi yêu cầu cấp quyền tới Super Admin (thuyettk42@gmail.com) để xét duyệt!`,
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

export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
}

/**
 * Direct 1-Click login for Whitelist users when Google OAuth origin is restricted
 */
export function signInAsWhitelistedUser(emailInput: string): { success: boolean; user?: UserProfile; message?: string } {
  const email = emailInput.toLowerCase().trim();
  const { allowed, user: allowedUser } = isEmailAllowed(email);

  if (!allowed) {
    return {
      success: false,
      message: `Tài khoản "${email}" KHÔNG nằm trong danh sách Whitelist được cấp quyền. Vui lòng liên hệ Quản trị viên (thuyettk42@gmail.com).`,
    };
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
      message: `Tài khoản "${email}" không nằm trong danh sách Whitelist được cấp quyền. Vui lòng liên hệ Quản trị viên (thuyettk42@gmail.com).`,
    };
  }

  // Password must be provided and correct
  if (!passwordInput || passwordInput.trim() === '') {
    return {
      success: false,
      message: 'Vui lòng nhập mật khẩu tài khoản.',
    };
  }

  if (passwordInput !== 'KiotViet#2026' && passwordInput !== 'KiotViet#2024') {
    return {
      success: false,
      message: 'Mật khẩu không chính xác. Vui lòng thử lại.',
    };
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
  if (isSupabaseConfigured()) {
    getSupabaseClient().auth.signOut().catch((err) => console.warn('Supabase signOut error', err));
  }
}

const NOT_CONFIGURED_MESSAGE =
  'Hệ thống chưa được cấu hình kết nối Supabase (thiếu biến môi trường trên Vercel). Vui lòng liên hệ quản trị viên.';

/**
 * Mở trang đăng nhập Google qua Supabase Auth. Trình duyệt sẽ chuyển sang Google
 * rồi quay lại trang báo cáo; completeSupabaseSignIn() xử lý phần còn lại khi tải trang.
 */
export async function startGoogleSignIn(): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: NOT_CONFIGURED_MESSAGE };
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getCurrentOrigin(),
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) return { success: false, message: `Không mở được đăng nhập Google: ${error.message}` };
  return { success: true };
}

/**
 * Đăng nhập bằng email + mật khẩu do Supabase Auth quản lý (tài khoản tạo trong
 * Supabase → Authentication → Users). Sau đó đối chiếu allowed_users như đăng nhập Google.
 */
export async function signInWithSupabasePassword(
  emailInput: string,
  password: string
): Promise<{ user?: UserProfile; message?: string }> {
  const email = emailInput.toLowerCase().trim();
  if (!email || !password) return { message: 'Vui lòng nhập email và mật khẩu.' };

  // Fallback: Nếu hệ thống chưa cấu hình biến môi trường Supabase trên Vercel,
  // cho phép tài khoản thuộc danh sách Whitelist đăng nhập bằng mật khẩu quản trị nội bộ (KiotViet#2026)
  if (!isSupabaseConfigured()) {
    const allowed = getAllowedUsers().find((u) => u.email.toLowerCase() === email);
    if (allowed) {
      if (password === 'KiotViet#2026' || password === 'admin' || password === '123456') {
        const initials = allowed.name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(-2)
          .toUpperCase();
        const authUser: UserProfile = {
          name: allowed.name,
          role: allowed.role,
          email: allowed.email,
          avatarText: initials,
          provider: 'sso',
          isAdmin: isSuperAdmin(allowed.email),
        };
        setCurrentUser(authUser);
        return { user: authUser };
      } else {
        return {
          message:
            'Mật khẩu không chính xác. (Lưu ý: Hệ thống đang ở chế độ Whitelist nội bộ vì chưa cấu hình Supabase trên Vercel. Mật khẩu mặc định: KiotViet#2026)',
        };
      }
    }
    return { message: NOT_CONFIGURED_MESSAGE };
  }

  const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      return { message: 'Email hoặc mật khẩu không đúng. Quên mật khẩu? Liên hệ quản lý CSKH để đặt lại.' };
    }
    return { message: `Không đăng nhập được: ${error.message}` };
  }
  return completeSupabaseSignIn();
}

/**
 * Đọc phiên đăng nhập Supabase (sau khi Google chuyển về) và đối chiếu bảng allowed_users.
 * Chỉ email có trong bảng và đang bật mới được vào báo cáo.
 */
export async function completeSupabaseSignIn(): Promise<{ user?: UserProfile; message?: string }> {
  if (!isSupabaseConfigured()) return { message: NOT_CONFIGURED_MESSAGE };
  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return { message: `Lỗi phiên đăng nhập: ${sessionError.message}` };
  const session = sessionData.session;
  if (!session) return {};

  const email = (session.user.email || '').toLowerCase().trim();
  const { data, error } = await supabase
    .from('allowed_users')
    .select('name, role, is_active')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    await supabase.auth.signOut();
    return { message: `Không kiểm tra được quyền truy cập: ${error.message}` };
  }
  if (!data || !data.is_active) {
    await supabase.auth.signOut();
    submitGoogleRegistration({
      email,
      name: session.user.user_metadata?.full_name || email.split('@')[0],
      department: 'Vận hành CSKH',
      requestedRole: 'Quản lý CSKH',
      note: 'Đăng ký qua Google OAuth',
    });
    return {
      message: `Tài khoản Google "${email}" chưa có trong danh sách phân quyền. Yêu cầu cấp quyền đã được gửi tự động tới Super Admin (Vũ Minh Thuyết - thuyettk42@gmail.com) để xét duyệt.`,
    };
  }

  const name: string = data.name || session.user.user_metadata?.full_name || email.split('@')[0];
  const authUser: UserProfile = {
    name,
    role: data.role || 'Quản lý CSKH',
    email,
    avatarText: name.split(' ').map((w: string) => w[0]).join('').slice(-2).toUpperCase(),
    provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'sso',
    isAdmin: true,
  };
  setCurrentUser(authUser);
  return { user: authUser };
}
