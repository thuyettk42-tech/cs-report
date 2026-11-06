import React, { useState } from 'react';
import {
  signInWithSupabasePassword,
  triggerGoogleIdentityPopup,
  startGoogleSignIn,
  submitGoogleRegistration,
  isEmailAllowed,
} from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { UserProfile } from '../../types';

interface PortalSSOModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  isFullPage?: boolean;
  sessionExpiredNotice?: string | null;
  authError?: string | null;
}

export const PortalSSOModal: React.FC<PortalSSOModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isFullPage = false,
  sessionExpiredNotice,
  authError,
}) => {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Pending approval screen state
  const [pendingUser, setPendingUser] = useState<{ email: string; name?: string } | null>(null);

  // Registration form state
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regDepartment, setRegDepartment] = useState('Vận hành CSKH');
  const [regRole, setRegRole] = useState('Quản lý CSKH');
  const [regNote, setRegNote] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const shownError = errorMessage || authError;

  // Handle email/password sign-in
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const res = await signInWithSupabasePassword(email, password);
    setIsLoading(false);
    if (res.user) {
      setPassword('');
      if (onLoginSuccess) onLoginSuccess(res.user);
      if (onClose) onClose();
    } else {
      setErrorMessage(res.message || 'Không đăng nhập được.');
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    // If Supabase OAuth is configured, try Supabase OAuth first
    if (isSupabaseConfigured()) {
      startGoogleSignIn()
        .then((res) => {
          setIsGoogleLoading(false);
          if (!res.success && res.message) {
            // Fallback to GIS popup if redirect fails
            triggerGisLogin();
          }
        })
        .catch(() => {
          setIsGoogleLoading(false);
          triggerGisLogin();
        });
    } else {
      // Use Google Identity Services popup
      triggerGisLogin();
    }
  };

  const triggerGisLogin = () => {
    triggerGoogleIdentityPopup({
      onSuccess: (user) => {
        setIsGoogleLoading(false);
        if (onLoginSuccess) onLoginSuccess(user);
        if (onClose) onClose();
      },
      onError: (msg) => {
        setIsGoogleLoading(false);
        // Check if message indicates pending approval
        if (msg.includes('chờ') || msg.includes('xét duyệt')) {
          setPendingUser({ email: email || 'Google Account', name: 'Nhân sự CSKH' });
        } else {
          setErrorMessage(msg);
        }
      },
      onConfigNeeded: () => {
        setIsGoogleLoading(false);
        setErrorMessage('Google Client ID chưa được cấu hình. Vui lòng liên hệ Super Admin (thuyettk42@gmail.com).');
      },
    });
  };

  // Handle Registration Form Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim()) return;

    const res = submitGoogleRegistration({
      email: regEmail,
      name: regName || regEmail.split('@')[0],
      department: regDepartment,
      requestedRole: regRole,
      note: regNote,
    });

    if (res.success) {
      if (res.alreadyApproved) {
        setErrorMessage(res.message);
        setMode('login');
        setEmail(regEmail);
      } else {
        setRegSuccessMsg(res.message);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  // Render Pending Screen (When account is awaiting approval by thuyettk42@gmail.com)
  const renderPendingView = () => (
    <div className="space-y-4 text-center py-2 animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
        <span className="material-symbols-outlined text-[32px] animate-pulse">hourglass_top</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Yêu Cầu Đang Chờ Super Admin Xét Duyệt
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Tài khoản Google của bạn đã được ghi nhận vào hệ thống phân quyền CSKH KiotViet.
        </p>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Tài khoản Google:</span>
          <span className="font-mono font-bold text-slate-900">{pendingUser?.email}</span>
        </div>
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Người phê duyệt:</span>
          <span className="font-bold text-[#006195]">Vũ Minh Thuyết (Super Admin)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Email quản trị:</span>
          <span className="font-mono text-slate-700">thuyettk42@gmail.com</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-800 space-y-1">
        <div className="font-bold flex items-center gap-1 text-amber-900">
          <span className="material-symbols-outlined text-[15px]">info</span>
          <span>Lưu ý xét duyệt:</span>
        </div>
        <p className="leading-relaxed">
          Sau khi Super Admin phê duyệt và cấp vai trò, bạn chỉ cần quay lại và bấm <b>"Đăng nhập với Google Account"</b> để vào hệ thống ngay.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setPendingUser(null);
          setMode('login');
        }}
        className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
      >
        Quay lại màn hình đăng nhập
      </button>
    </div>
  );

  // Render Registration Success Screen
  const renderRegSuccessView = () => (
    <div className="space-y-4 text-center py-2 animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
        <span className="material-symbols-outlined text-[32px]">check_circle</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Gửi Yêu Cầu Đăng Ký Thành Công!
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Thông tin của bạn đã được chuyển tới hàng đợi xét duyệt của Super Admin.
        </p>
      </div>

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tài khoản đăng ký:</span>
          <span className="font-mono font-bold text-slate-900">{regEmail}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Họ và tên:</span>
          <span className="font-semibold text-slate-800">{regName || regEmail.split('@')[0]}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Phòng ban:</span>
          <span className="text-slate-800 font-medium">{regDepartment}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Người xét duyệt:</span>
          <span className="font-bold text-[#006195]">thuyettk42@gmail.com</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Bạn sẽ có thể đăng nhập vào báo cáo ngay khi Super Admin duyệt yêu cầu.
      </p>

      <button
        type="button"
        onClick={() => {
          setRegSuccessMsg(null);
          setMode('login');
          setEmail(regEmail);
        }}
        className="w-full h-10 rounded-xl bg-[#006195] hover:bg-[#004b74] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
      >
        Về Màn Hình Đăng Nhập
      </button>
    </div>
  );

  const content = (
    <div className="w-full max-w-[460px] mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 p-6 sm:p-7 relative text-left">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <img
            src="/assets/aistudio/_ZNS__Color_Logo_ecc542c2.png"
            alt="KiotViet Logo"
            className="h-8 w-auto max-w-[150px] object-contain"
          />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#20C65A] animate-pulse"></span>
          PORTAL 2.4 SSO
        </span>
      </div>

      {/* Main Condition: If pending approval screen */}
      {pendingUser ? (
        renderPendingView()
      ) : regSuccessMsg ? (
        renderRegSuccessView()
      ) : (
        <>
          {/* Headline & Welcome */}
          <div className="space-y-1 mb-4">
            <div className="inline-block px-2 py-0.5 rounded bg-sky-100 text-[#0090DA] text-[10px] font-bold tracking-wider uppercase">
              HỆ THỐNG ĐIỀU HÀNH CSKH KIOTVIET
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {mode === 'login'
                ? 'Báo cáo nội bộ dành riêng cho danh sách Quản lý được phân quyền (Whitelist).'
                : 'Đăng ký bằng Google Account để gửi yêu cầu phê duyệt tới Super Admin (thuyettk42@gmail.com).'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#006195] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'register'
                  ? 'bg-white text-[#006195] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Đăng Ký Bằng Google</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            </button>
          </div>

          {/* Session Expired Inactivity Notice */}
          {sessionExpiredNotice && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-900 text-left flex items-start gap-2.5 text-xs animate-fadeIn border border-amber-300 shadow-xs">
              <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">timer_off</span>
              <div className="flex-1">
                <div className="font-bold text-amber-800">Phiên làm việc đã hết hạn</div>
                <div className="mt-0.5 leading-relaxed text-amber-700">{sessionExpiredNotice}</div>
              </div>
            </div>
          )}

          {/* Error Warning Banner */}
          {shownError && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 text-rose-900 text-left flex items-start gap-2 text-xs animate-fadeIn border border-rose-200">
              <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
              <div className="flex-1">
                <div className="font-bold text-rose-800">Thông báo xác thực</div>
                <div className="mt-0.5 leading-relaxed text-rose-700">{shownError}</div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: ĐĂNG NHẬP (LOGIN)                                        */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* GOOGLE SIGN IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-60 bg-white"
              >
                {isGoogleLoading ? (
                  <span className="w-4 h-4 border-2 border-[#006195] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Đăng nhập với Google Account</span>
                  </>
                )}
              </button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  HOẶC EMAIL &amp; MẬT KHẨU
                </span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* EMAIL & PASSWORD FORM */}
              <form onSubmit={handlePasswordSubmit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">Tên đăng nhập / Email</label>
                    <button
                      type="button"
                      onClick={() => setEmail('thuyettk42@gmail.com')}
                      className="text-[11px] text-[#006195] hover:underline font-semibold cursor-pointer"
                    >
                      Điền mẫu thuyettk42
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">badge</span>
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Nhập email (vd: thuyettk42@gmail.com)..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Mặc định: <b className="text-slate-600">KiotViet#2026</b>
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Nhập mật khẩu..."
                      className="w-full h-10 pl-9 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Ghi nhớ phiên 60 phút</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Tự gia hạn khi thao tác</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-[#006195] hover:bg-[#004b74] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs mt-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Đăng nhập mật khẩu</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Registration Hint */}
              <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#006195] hover:underline cursor-pointer"
                >
                  Đăng ký bằng Google Account
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: ĐĂNG KÝ BẰNG GOOGLE (REGISTER)                           */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <div className="space-y-3.5">
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                {/* Email Google */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tài khoản Google / Email *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">mail</span>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="vd: ten.nv@kiotviet.com hoặc @gmail.com..."
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                    />
                  </div>
                </div>

                {/* Họ & Tên */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Họ và Tên *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">person</span>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="vd: Nguyễn Văn A"
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                    />
                  </div>
                </div>

                {/* Phòng ban & Vị trí */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Phòng ban</label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20 cursor-pointer"
                    >
                      <option value="Vận hành CSKH">Vận hành CSKH</option>
                      <option value="Call Center 1900 6522">Call Center 1900 6522</option>
                      <option value="Chat Freshchat">Chat Freshchat</option>
                      <option value="Ticket CRM SLA">Ticket CRM SLA</option>
                      <option value="BPO Outsourced">BPO Outsourced</option>
                      <option value="Chất lượng & CSAT">Chất lượng &amp; CSAT</option>
                      <option value="Phân hệ dự án KAT">Phân hệ dự án KAT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Vị trí đề xuất</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20 cursor-pointer"
                    >
                      <option value="Quản lý CSKH">Quản lý CSKH</option>
                      <option value="Giám sát / QA (View & Export)">Giám sát / QA (View &amp; Export)</option>
                      <option value="Chỉ xem báo cáo (View Only)">Chỉ xem báo cáo (View Only)</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú xin cấp quyền */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Lý do xin cấp quyền</label>
                  <input
                    type="text"
                    value={regNote}
                    onChange={(e) => setRegNote(e.target.value)}
                    placeholder="vd: Cần theo dõi KPI cuộc gọi và ticket hỗ trợ kỹ thuật..."
                    className="w-full h-9 px-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span>
                    Yêu cầu sẽ được chuyển trực tiếp tới Super Admin (<b>thuyettk42@gmail.com</b>) xét duyệt.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-[#006195] hover:bg-[#004b74] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs mt-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Gửi Yêu Cầu Xét Duyệt</span>
                </button>
              </form>

              {/* Back to login */}
              <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#006195] hover:underline cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Close option if not full page */}
      {!isFullPage && onClose && (
        <div className="mt-4 pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      )}
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 flex flex-col items-center justify-center p-4">
        {content}
        <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 KiotViet Customer Care Enterprise • All rights reserved</p>
          <p className="text-[11px] text-slate-400">
            Hệ thống Báo cáo &amp; Điều hành CSKH KiotViet Enterprise
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      {content}
    </div>
  );
};
