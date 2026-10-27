import React, { useState } from 'react';
import {
  getAllowedUsers,
  addAllowedUser,
  removeAllowedUser,
  getGoogleClientId,
  saveGoogleClientId,
} from '../../services/authService';
import { getSupabaseCredentials, saveSupabaseCredentials, SUPABASE_SQL_SCHEMA } from '../../services/supabaseClient';
import { AllowedUser } from '../../types';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'google-oauth' | 'supabase'>('whitelist');
  const [users, setUsers] = useState<AllowedUser[]>(getAllowedUsers());
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Quản lý CSKH');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleClientId(googleClientId.trim());
    showToast('Đã lưu Google OAuth Client ID thành công!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    const res = addAllowedUser({
      email: newEmail,
      name: newName || newEmail.split('@')[0],
      role: newRole,
      addedBy: 'Admin Điều Hành',
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

  const handleRemoveUser = (email: string) => {
    if (confirm(`Bạn có chắc muốn thu hồi quyền truy cập của ${email}?`)) {
      const res = removeAllowedUser(email);
      setUsers(getAllowedUsers());
      showToast(res.message);
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    showToast('Đã lưu cấu hình kết nối Supabase thành công!');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quản Trị Quyền Truy Cập &amp; Supabase Storage</h2>
              <p className="text-xs text-slate-500">Cấp quyền Google Account và cấu hình lưu trữ database Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl my-4 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('whitelist')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'whitelist' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Whitelist Admin ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('google-oauth')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'google-oauth' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">vpn_key</span>
            <span>Google OAuth 2.0</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'supabase' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
            <span>Supabase Database</span>
          </button>
        </div>

        {toastMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'whitelist' ? (
            <>
              {/* Form add new admin */}
              <form onSubmit={handleAddUser} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
                  <span>Thêm User / Google Account Được Phép Đăng Nhập:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Email Google (vd: user@kiotviet.com)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Họ &amp; Tên"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option>Manager CS</option>
                    <option>Quản lý CSKH</option>
                    <option>Team Leader</option>
                    <option>QA Inspector</option>
                    <option>System Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Cấp Quyền Ngay</span>
                </button>
              </form>

              {/* Whitelist users list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Tài khoản Google / Email</th>
                      <th className="py-2.5 px-3">Họ Tên &amp; Vai trò</th>
                      <th className="py-2.5 px-3 text-center">Ngày cấp</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.email} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono font-medium text-slate-900">
                          {u.email}
                          {u.email === 'thuyet.vm@kiotviet.com' && (
                            <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded text-[10px] font-bold">Chính</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.role}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-500">{u.addedAt}</td>
                        <td className="py-2 px-3 text-center">
                          {u.email !== 'thuyet.vm@kiotviet.com' ? (
                            <button
                              onClick={() => handleRemoveUser(u.email)}
                              className="text-error hover:text-red-700 p-1"
                              title="Thu hồi quyền"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Không xóa</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="vd: 875260475277-xxxxxxxx.apps.googleusercontent.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-[11px] text-slate-500">
                    Client ID này được lưu trữ để kích hoạt popup xác thực chính thức `accounts.google.com` cho nhân sự.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-800">Cấu hình Authorized JavaScript origins trên Google Cloud:</div>
                  <div className="font-mono bg-white p-1.5 rounded border border-sky-200 text-slate-900 select-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://cs-report-sage.vercel.app'}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Sau khi thêm domain trên vào Google Cloud Console, dán Client ID vào ô trên và bấm lưu.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
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
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center gap-1"
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
    </div>
  );
};
