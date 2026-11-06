import React, { useState } from 'react';
import {
  getAllowedUsers,
  addAllowedUser,
  removeAllowedUser,
  updateAllowedUser,
  isSuperAdmin,
  signInAsWhitelistedUser,
  getGoogleClientId,
  saveGoogleClientId,
  getCurrentOrigin,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from '../../services/authService';
import { getSupabaseCredentials, saveSupabaseCredentials, SUPABASE_SQL_SCHEMA } from '../../services/supabaseClient';
import { AllowedUser, UserProfile, AccessRequest } from '../../types';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onSwitchUser?: (user: UserProfile) => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'requests' | 'google-oauth' | 'supabase'>('whitelist');
  const [users, setUsers] = useState<AllowedUser[]>(getAllowedUsers());
  const [requests, setRequests] = useState<AccessRequest[]>(getAccessRequests());
  const [roleToAssignMap, setRoleToAssignMap] = useState<Record<string, string>>({});
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Quản lý CSKH');
  const [newPermission, setNewPermission] = useState('full_access');
  const [newDepartment, setNewDepartment] = useState('Vận hành CSKH');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<AllowedUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPermission, setEditPermission] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Check if current user is Super Admin (thuyettk42@gmail.com or thuyet.vm@kiotviet.com)
  const isUserSuperAdmin = isSuperAdmin(currentUser);

  // Google OAuth Client ID
  const [googleClientId, setGoogleClientId] = useState(getGoogleClientId());

  // Supabase credentials
  const initialCreds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền lưu cấu hình Google OAuth.');
      return;
    }
    saveGoogleClientId(googleClientId.trim());
    showToast('Đã lưu Google OAuth Client ID thành công!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền cấp quyền tài khoản mới.');
      return;
    }
    if (!newEmail) return;

    const res = addAllowedUser({
      email: newEmail,
      name: newName || newEmail.split('@')[0],
      role: newRole,
      permission: newPermission,
      permissionLabel:
        newPermission === 'super_admin'
          ? 'Toàn quyền Quản trị (Super Admin)'
          : newPermission === 'full_access'
          ? 'Quản lý CSKH (Full Access)'
          : newPermission === 'view_export'
          ? 'Giám sát / QA (View & Export)'
          : 'Chỉ xem báo cáo (View Only)',
      department: newDepartment,
      addedBy: currentUser ? `${currentUser.name} (${currentUser.email})` : 'Vũ Minh Thuyết (Super Admin)',
    });

    if (res.success) {
      setUsers(getAllowedUsers());
      setNewEmail('');
      setNewName('');
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleStartEdit = (user: AllowedUser) => {
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền chỉnh sửa thông tin tài khoản!');
      return;
    }
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditPermission(user.permission || (user.email.includes('thuyet') ? 'super_admin' : 'full_access'));
    setEditDepartment(user.department || 'Vận hành CSKH');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền lưu chỉnh sửa!');
      return;
    }
    if (!editingUser) return;

    const permissionLabels: Record<string, string> = {
      super_admin: 'Toàn quyền Quản trị (Super Admin)',
      full_access: 'Quản lý CSKH (Full Access)',
      view_export: 'Giám sát / QA (View & Export)',
      view_only: 'Chỉ xem báo cáo (View Only)',
    };

    const res = updateAllowedUser(editingUser.email, {
      name: editName,
      email: editEmail,
      role: editRole,
      permission: editPermission,
      permissionLabel: permissionLabels[editPermission] || editRole,
      department: editDepartment,
    });

    if (res.success) {
      setUsers(getAllowedUsers());
      setEditingUser(null);
      showToast(res.message);
      // If user edited their own info or current session, refresh in App
      if (onSwitchUser && res.updatedUser && currentUser?.email.toLowerCase() === editingUser.email.toLowerCase()) {
        onSwitchUser({
          name: res.updatedUser.name,
          email: res.updatedUser.email,
          role: res.updatedUser.role,
          avatarText: res.updatedUser.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase(),
          isAdmin: true,
          provider: 'google',
        });
      }
    } else {
      showToast(res.message);
    }
  };

  const handleRemoveUser = (email: string) => {
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền thu hồi tài khoản.');
      return;
    }
    if (confirm(`Bạn có chắc muốn thu hồi quyền truy cập của ${email}?`)) {
      const res = removeAllowedUser(email);
      setUsers(getAllowedUsers());
      showToast(res.message);
    }
  };

  const handleSwitchToSuperAdmin = () => {
    const res = signInAsWhitelistedUser('thuyettk42@gmail.com');
    if (res.success && res.user && onSwitchUser) {
      onSwitchUser(res.user);
      showToast('Đã chuyển phiên sang Super Admin: Vũ Minh Thuyết (thuyettk42@gmail.com)');
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin mới có quyền cập nhật Supabase Database.');
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    showToast('Đã lưu cấu hình kết nối Supabase thành công!');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  const handleApproveRequest = (req: AccessRequest) => {
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền phê duyệt yêu cầu!');
      return;
    }
    const roleToAssign = roleToAssignMap[req.id] || req.requestedRole || 'Quản lý CSKH';
    const res = approveAccessRequest(req.id, roleToAssign, currentUser?.email || 'thuyettk42@gmail.com');
    if (res.success) {
      setUsers(getAllowedUsers());
      setRequests(getAccessRequests());
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleRejectRequest = (req: AccessRequest) => {
    if (!isUserSuperAdmin) {
      showToast('Chỉ tài khoản Super Admin (thuyettk42@gmail.com) mới có quyền từ chối yêu cầu!');
      return;
    }
    const res = rejectAccessRequest(req.id, currentUser?.email || 'thuyettk42@gmail.com');
    if (res.success) {
      setRequests(getAccessRequests());
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5 sm:p-6 border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Quản Trị Phân Quyền &amp; Cấu Hình Hệ Thống
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Super Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Phân quyền truy cập Whitelist Google Account và quản lý thông tin tài khoản nội bộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Super Admin Status Banner */}
        <div className="mt-3 shrink-0">
          {isUserSuperAdmin ? (
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div>
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Quyền Super Admin tối cao:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                      {currentUser?.email || 'thuyettk42@gmail.com'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Bạn có toàn quyền chỉnh sửa thông tin (Họ tên, Email, Chức vụ, Quyền hạn) của tất cả tài khoản.
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                Được cấp phép sửa
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">lock</span>
                <div>
                  <div className="font-bold text-amber-950">Chế độ Chỉ Xem (Read Only)</div>
                  <div className="text-[11px] text-amber-800">
                    Chỉ tài khoản Super Admin <b className="font-mono">thuyettk42@gmail.com</b> mới có quyền sửa chức vụ, quyền, tên và email.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSwitchToSuperAdmin}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[15px]">switch_account</span>
                <span>Chuyển sang Super Admin thuyettk42</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl my-3 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'whitelist' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Whitelist ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'requests' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Chờ Duyệt ({pendingRequestsCount})</span>
            {pendingRequestsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('google-oauth')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'google-oauth' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">vpn_key</span>
            <span>Google OAuth 2.0</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'supabase' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>Supabase DB</span>
          </button>
        </div>

        {toastMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0 border border-emerald-200">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'whitelist' ? (
            <>
              {/* Form add new admin (Super Admin Only) */}
              <form
                onSubmit={handleAddUser}
                className={`p-3.5 rounded-xl border text-xs space-y-3 transition-opacity ${
                  isUserSuperAdmin ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-200 opacity-60 pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
                    <span>Thêm Tài Khoản Mới Vào Whitelist:</span>
                  </div>
                  {!isUserSuperAdmin && (
                    <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      Yêu cầu Super Admin
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Email Google *</label>
                    <input
                      type="email"
                      required
                      disabled={!isUserSuperAdmin}
                      placeholder="vd: ten@kiotviet.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Họ &amp; Tên *</label>
                    <input
                      type="text"
                      required
                      disabled={!isUserSuperAdmin}
                      placeholder="vd: Nguyễn Văn A"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Chức vụ *</label>
                    <select
                      value={newRole}
                      disabled={!isUserSuperAdmin}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none cursor-pointer text-xs"
                    >
                      <option>Manager CS</option>
                      <option>Giám Đốc / Quản Lý CSKH</option>
                      <option>Quản Lý Vận Hành CSKH</option>
                      <option>Trưởng Nhóm Call Center</option>
                      <option>Trưởng Nhóm Freshchat</option>
                      <option>Trưởng Nhóm Ticket CRM</option>
                      <option>Chuyên Viên QA / CSAT</option>
                      <option>System Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Quyền hạn truy cập *</label>
                    <select
                      value={newPermission}
                      disabled={!isUserSuperAdmin}
                      onChange={(e) => setNewPermission(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none cursor-pointer text-xs font-semibold"
                    >
                      <option value="full_access">Quản lý CSKH (Full Access)</option>
                      <option value="view_export">Giám sát / QA (View &amp; Export)</option>
                      <option value="view_only">Chỉ xem báo cáo (View Only)</option>
                      <option value="super_admin">Toàn quyền Quản trị (Super Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Người cấp quyền: <b className="text-slate-600">{currentUser?.name || 'Vũ Minh Thuyết'}</b>
                  </span>
                  <button
                    type="submit"
                    disabled={!isUserSuperAdmin}
                    className="px-3.5 py-1.5 bg-primary hover:bg-[#004b74] text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Thêm vào Whitelist</span>
                  </button>
                </div>
              </form>

              {/* Whitelist users list table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span>Danh sách tài khoản được cấp quyền truy cập</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                      {users.length} tài khoản
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Chỉ Super Admin ({users.find((u) => u.email === 'thuyettk42@gmail.com')?.email || 'thuyettk42@gmail.com'}) có nút Sửa
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Họ Tên &amp; Email</th>
                        <th className="py-2.5 px-3">Chức vụ &amp; Phòng ban</th>
                        <th className="py-2.5 px-3">Quyền hạn truy cập</th>
                        <th className="py-2.5 px-3 text-center">Ngày cấp</th>
                        <th className="py-2.5 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const isPrimary = u.email === 'thuyettk42@gmail.com' || u.email === 'thuyet.vm@kiotviet.com';
                        return (
                          <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-sky-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                  {u.name.split(' ').map((w) => w[0]).join('').slice(-2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isPrimary && (
                                      <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-bold uppercase tracking-wider">
                                        Super Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-500 truncate">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-800">{u.role}</div>
                              <div className="text-[10px] text-slate-400">{u.department || 'Vận hành CSKH'}</div>
                            </td>

                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.permission === 'super_admin' || isPrimary
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : u.permission === 'view_export'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : u.permission === 'view_only'
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : 'bg-sky-100 text-[#006195] border border-sky-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {u.permission === 'super_admin' || isPrimary
                                    ? 'stars'
                                    : u.permission === 'view_export'
                                    ? 'download'
                                    : u.permission === 'view_only'
                                    ? 'visibility'
                                    : 'shield'}
                                </span>
                                <span>{u.permissionLabel || u.role}</span>
                              </span>
                            </td>

                            <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                              {u.addedAt}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {/* EDIT BUTTON - Only functional for Super Admin */}
                                {isUserSuperAdmin ? (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(u)}
                                    className="p-1.5 rounded-lg text-primary hover:bg-sky-50 hover:text-[#004b74] transition-colors cursor-pointer"
                                    title="Chỉnh sửa chức vụ, quyền, tên, email"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">edit</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed opacity-50"
                                    title="Chỉ Super Admin (thuyettk42@gmail.com) mới có quyền sửa"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">edit</span>
                                  </button>
                                )}

                                {/* DELETE BUTTON */}
                                {!isPrimary && isUserSuperAdmin ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUser(u.email)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                                    title="Thu hồi quyền truy cập"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">delete</span>
                                  </button>
                                ) : isPrimary ? (
                                  <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                                    Bảo lưu
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed opacity-50"
                                    title="Chỉ Super Admin có quyền xóa"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'requests' ? (
            <div className="space-y-4">
              {/* Requests banner */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-[#006195] shrink-0 mt-0.5">
                    how_to_reg
                  </span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#006195] text-sm">
                      Duyệt Yêu Cầu Đăng Ký Tài Khoản Google Account
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Nhân sự đăng ký bằng Google Account từ cổng đăng nhập sẽ hiển thị tại đây. Chỉ tài khoản Super Admin (<b>thuyettk42@gmail.com</b>) có quyền phê duyệt &amp; phân quyền truy cập.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#006195] border border-sky-200 shrink-0">
                  {pendingRequestsCount} yêu cầu chờ duyệt
                </span>
              </div>

              {/* Requests list */}
              {requests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  Chưa có yêu cầu đăng ký nào trong hệ thống.
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const isPending = req.status === 'pending';
                    const assignedRole = roleToAssignMap[req.id] || req.requestedRole || 'Quản lý CSKH';

                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isPending
                            ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-100'
                            : req.status === 'approved'
                            ? 'bg-slate-50/70 border-slate-200 opacity-80'
                            : 'bg-rose-50/30 border-rose-200 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 relative">
                              <span className="text-sm">
                                {req.name
                                  .split(' ')
                                  .map((w) => w[0])
                                  .join('')
                                  .slice(-2)
                                  .toUpperCase()}
                              </span>
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                                <svg className="w-3 h-3" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">{req.name}</span>
                                <span className="text-slate-400">•</span>
                                <span className="font-mono text-slate-600 text-xs font-semibold">{req.email}</span>
                                {isPending ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    Chờ phê duyệt
                                  </span>
                                ) : req.status === 'approved' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    ✓ Đã duyệt
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                    Đã từ chối
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                                <span>Phòng ban: <b>{req.department || 'Vận hành CSKH'}</b></span>
                                <span>Thời gian gửi: <b className="font-mono text-slate-700">{req.createdAt}</b></span>
                              </div>

                              {req.note && (
                                <p className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 mt-1 italic">
                                  "{req.note}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Approval actions */}
                          {isPending ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <select
                                value={assignedRole}
                                onChange={(e) =>
                                  setRoleToAssignMap({ ...roleToAssignMap, [req.id]: e.target.value })
                                }
                                disabled={!isUserSuperAdmin}
                                className="h-8 px-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                              >
                                <option value="Manager CS (Super Admin)">Manager CS (Super Admin)</option>
                                <option value="Giám Đốc / Quản Lý CSKH">Giám Đốc / Quản Lý CSKH</option>
                                <option value="Quản lý CSKH">Quản lý CSKH</option>
                                <option value="Quản Lý Vận Hành CSKH">Quản Lý Vận Hành CSKH</option>
                                <option value="Giám sát / QA (View & Export)">Giám sát / QA (View &amp; Export)</option>
                                <option value="Chỉ xem báo cáo (View Only)">Chỉ xem báo cáo (View Only)</option>
                              </select>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveRequest(req)}
                                  disabled={!isUserSuperAdmin}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                  <span>Phê Duyệt</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRejectRequest(req)}
                                  disabled={!isUserSuperAdmin}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                  <span>Từ Chối</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 text-right">
                              {req.reviewedBy && <div>Bởi: {req.reviewedBy}</div>}
                              {req.reviewedAt && <div>Lúc: {req.reviewedAt}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'google-oauth' ? (
            <>
              {/* Google OAuth 2.0 configuration */}
              <form onSubmit={handleSaveGoogleClientId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">key</span>
                  <span>Cấu hình Google Cloud OAuth 2.0 Client ID:</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-600 font-semibold">Google OAuth Client ID (Web Application):</label>
                  <input
                    type="text"
                    required
                    disabled={!isUserSuperAdmin}
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="vd: 115149341080-xxxx.apps.googleusercontent.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500">
                    Client ID này được lưu trữ để kích hoạt popup xác thực chính thức `accounts.google.com` cho nhân sự.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-800">Cấu hình Authorized JavaScript origins trên Google Cloud:</div>
                  <div className="font-mono bg-white p-1.5 rounded border border-sky-200 text-slate-900 select-all">
                    {getCurrentOrigin() || (typeof window !== 'undefined' ? window.location.origin : 'https://cs-report-sage.vercel.app')}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Thêm URL trên vào mục <b>Authorized JavaScript origins</b> trên Google Cloud Console để không bị Lỗi 400: origin_mismatch.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isUserSuperAdmin}
                  className="px-4 py-1.5 bg-primary hover:bg-[#004b74] text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu Google Client ID</span>
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Supabase configuration */}
              <form onSubmit={handleSaveSupabase} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">cloud</span>
                  <span>Kết nối Supabase Project (Backend &amp; Database):</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-600 font-semibold">Supabase Project URL:</label>
                  <input
                    type="url"
                    disabled={!isUserSuperAdmin}
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-600 font-semibold">Supabase Public Anon Key:</label>
                  <input
                    type="password"
                    disabled={!isUserSuperAdmin}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isUserSuperAdmin}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu Kết Nối Supabase</span>
                </button>
              </form>

              {/* SQL Schema to copy */}
              <div className="p-3.5 bg-slate-900 rounded-xl text-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] font-semibold text-emerald-400">SQL Migration Script (Paste vào Supabase SQL Editor):</span>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedSql ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedSql ? 'Đã sao chép!' : 'Sao chép SQL'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 max-h-52 overflow-y-auto leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: SỬA THÔNG TIN TÀI KHOẢN (CHỨC VỤ, QUYỀN, TÊN, EMAIL) */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Chỉnh Sửa Thông Tin Tài Khoản
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chỉ Super Admin (thuyettk42@gmail.com) có quyền thực hiện thay đổi này
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Field 1: Họ & Tên */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Họ &amp; Tên nhân sự *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">person</span>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Họ & Tên nhân viên"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
              </div>

              {/* Field 2: Email Google / Đăng nhập */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tài khoản Google / Email *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">mail</span>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email đăng nhập Google"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
              </div>

              {/* Field 3: Chức vụ (Role) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chức vụ đảm nhiệm *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">badge</span>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs cursor-pointer"
                  >
                    <option value="Manager CS (Super Admin)">Manager CS (Super Admin)</option>
                    <option value="Giám Đốc / Quản Lý CSKH">Giám Đốc / Quản Lý CSKH</option>
                    <option value="Quản Lý Vận Hành CSKH">Quản Lý Vận Hành CSKH</option>
                    <option value="Trưởng Nhóm Call Center">Trưởng Nhóm Call Center</option>
                    <option value="Trưởng Nhóm Freshchat">Trưởng Nhóm Freshchat</option>
                    <option value="Trưởng Nhóm Ticket CRM">Trưởng Nhóm Ticket CRM</option>
                    <option value="Chuyên Viên QA / CSAT">Chuyên Viên QA / CSAT</option>
                    <option value="Chuyên Viên Vận Hành Hệ Thống">Chuyên Viên Vận Hành Hệ Thống</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Quyền hạn truy cập */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Quyền hạn trong hệ thống *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">admin_panel_settings</span>
                  <select
                    value={editPermission}
                    onChange={(e) => setEditPermission(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs cursor-pointer"
                  >
                    <option value="super_admin">Toàn quyền Quản trị (Super Admin) - Thêm/sửa whitelist, cấu hình hệ thống</option>
                    <option value="full_access">Quản lý CSKH (Full Access) - Xem, duyệt chỉ số, xuất tất cả báo cáo</option>
                    <option value="view_export">Giám sát / QA (View &amp; Export) - Xem chi tiết và xuất báo cáo</option>
                    <option value="view_only">Chỉ xem báo cáo (View Only) - Không thể xuất hoặc thay đổi cấu hình</option>
                  </select>
                </div>
              </div>

              {/* Field 5: Phòng ban */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phòng ban / Đơn vị
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">corporate_fare</span>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="vd: Ban Giám Đốc CSKH, Vận hành CSKH..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="py-2 px-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-primary hover:bg-[#004b74] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
