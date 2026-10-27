import React, { useState } from 'react';
import { signInWithGoogle, signInWithCredentials, getAllowedUsers } from '../../services/authService';
import { UserProfile } from '../../types';

interface PortalSSOModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  isFullPage?: boolean;
  sessionExpiredNotice?: string | null;
}

export const PortalSSOModal: React.FC<PortalSSOModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isFullPage = false,
  sessionExpiredNotice,
}) => {
  const [email, setEmail] = useState('thuyet.vm@kiotviet.com');
  const [password, setPassword] = useState('KiotViet#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('thuyet.vm@kiotviet.com');
  const [showGoogleCustomInput, setShowGoogleCustomInput] = useState(false);
  const [showWhitelistPreview, setShowWhitelistPreview] = useState(false);

  if (!isOpen) return null;

  const allowedList = getAllowedUsers();

  const handleQuickfill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('KiotViet#2026');
    setErrorMessage(null);
    setInfoNotice(null);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoNotice(null);

    setTimeout(() => {
      const result = signInWithCredentials(email, password);
      setIsLoading(false);
      if (result.success && result.user) {
        if (onLoginSuccess) onLoginSuccess(result.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(result.message || 'Đăng nhập không thành công.');
      }
    }, 600);
  };

  const handleGoogleLogin = (targetEmail?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setInfoNotice(null);
    const emailToUse = targetEmail || googleEmailInput || email;

    setTimeout(() => {
      const result = signInWithGoogle(emailToUse);
      setIsLoading(false);
      if (result.success && result.user) {
        if (onLoginSuccess) onLoginSuccess(result.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(result.message || 'Tài khoản Google không được cấp quyền.');
      }
    }, 700);
  };

  const content = (
    <div className="w-full max-w-[460px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/80 p-6 sm:p-8 relative">
      {/* Brand Header matching image_93b94bf6.png */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* Logo KiotViet SVG */}
          <div className="flex items-center gap-1.5">
            <svg className="h-8 w-auto" viewBox="0 0 120 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C7.58 4 4 7.58 4 12V22C4 26.42 7.58 30 12 30C16.42 30 20 26.42 20 22V12C20 7.58 16.42 4 12 4Z" fill="#0090DA"/>
              <path d="M22 14L28 20L22 26V14Z" fill="#20C65A"/>
              <text x="36" y="24" fontFamily="'Be Vietnam Pro', sans-serif" fontWeight="bold" fontSize="20" fill="#073763">KiotViet</text>
            </svg>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#20C65A] animate-pulse"></span>
          PORTAL 2.4 SSO
        </span>
      </div>

      {/* Headline & Welcome */}
      <div className="space-y-1.5 mb-6 text-left">
        <div className="inline-block px-2 py-0.5 rounded bg-sky-100 text-[#0090DA] text-[11px] font-bold tracking-wider uppercase">
          HỆ THỐNG CHUYÊN TRÁCH CSKH
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Trung tâm Chăm sóc khách hàng KiotViet
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Chào mừng bạn đến với hệ thống điều hành. Đăng nhập để theo dõi vận hành, chất lượng dịch vụ và hiệu suất đội ngũ.
        </p>
      </div>

      {/* Role Quick Switcher Pills (Matching Image 93b94bf6) */}
      <div className="mb-5 space-y-1.5 text-left">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          VAI TRÒ VẬN HÀNH MẪU (DEMO QUICKFILL)
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickfill('thuyet.vm@kiotviet.com')}
            className="px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0090DA] font-semibold text-xs transition-colors"
          >
            Thuyết (Manager CS)
          </button>
          <button
            type="button"
            onClick={() => handleQuickfill('lam.tran@kiotviet.com')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
          >
            Lâm (Quản lý CSKH)
          </button>
          <button
            type="button"
            onClick={() => handleQuickfill('yen.nguyen@kiotviet.com')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
          >
            Yến (Manager CS)
          </button>
          <button
            type="button"
            onClick={() => handleQuickfill('cskh.leader@kiotviet.com')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
          >
            Team Leader
          </button>
        </div>
      </div>

      {/* PRIMARY GOOGLE LOGIN BUTTON */}
      <div className="mb-5 space-y-2">
        <button
          type="button"
          onClick={() => handleGoogleLogin(email)}
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm"
        >
          {/* Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Đăng nhập với Google Account</span>
        </button>

        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400">Kiểm tra tài khoản cấp sẵn trong Whitelist</span>
          <button
            type="button"
            onClick={() => setShowGoogleCustomInput(!showGoogleCustomInput)}
            className="text-primary hover:underline font-medium"
          >
            {showGoogleCustomInput ? 'Ẩn nhập email' : 'Chọn email Google khác'}
          </button>
        </div>

        {showGoogleCustomInput && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 animate-fadeIn">
            <label className="block text-[11px] font-semibold text-slate-600">Nhập Email Google của bạn:</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="vd: thuyet.vm@kiotviet.com"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => handleGoogleLogin(googleEmailInput)}
                className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Xác thực
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Hoặc đăng nhập mật khẩu</span>
        <div className="flex-grow border-t border-slate-200"></div>
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

      {/* Info Notice Box */}
      {infoNotice && (
        <div className="mb-4 p-3 rounded-xl bg-sky-50 text-slate-700 text-left flex items-start gap-2.5 text-xs animate-fadeIn border border-sky-200">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">info</span>
          <div className="flex-1 leading-relaxed">{infoNotice}</div>
        </div>
      )}

      {/* Error / Unauthorized Warning Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-left flex items-start gap-2.5 text-xs animate-fadeIn border border-error/20">
          <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">error</span>
          <div className="flex-1">
            <div className="font-bold text-error">Quyền truy cập bị từ chối</div>
            <div className="mt-0.5 leading-relaxed">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Tên đăng nhập hoặc Email nội bộ
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">badge</span>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="thuyet.vm@kiotviet.com"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu bảo mật
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu (vd: KiotViet#2026)"
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
            <span>Ghi nhớ đăng nhập trên thiết bị này</span>
          </label>
          <button
            type="button"
            onClick={() => setInfoNotice('Quên mật khẩu? Vui lòng liên hệ Quản trị viên: thuyet.vm@kiotviet.com hoặc lam.tran@kiotviet.com để được cấp lại.')}
            className="text-primary hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Primary Login Button matching #006195 in image_93b94bf6.png */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg bg-[#006195] hover:bg-[#004b74] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-2 cursor-pointer"
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
          <span>Đăng nhập hệ thống</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      {/* Whitelist Preview Drawer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setShowWhitelistPreview(!showWhitelistPreview)}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Xem Whitelist ({allowedList.length} Admin được cấp quyền)</span>
        </button>

        {!isFullPage && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        )}
      </div>

      {showWhitelistPreview && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 animate-fadeIn max-h-40 overflow-y-auto">
          <div className="font-bold text-slate-800">Danh sách Admin được cấp quyền truy cập:</div>
          <div className="space-y-1 font-mono text-[11px]">
            {allowedList.map((u) => (
              <div key={u.email} className="flex justify-between items-center py-0.5 border-b border-slate-100">
                <span className="text-slate-700 font-semibold">{u.email}</span>
                <span className="text-slate-400 font-sans text-[10px]">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col items-center justify-center p-4">
        {content}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>© 2026 KiotViet Customer Care Enterprise • All rights reserved</p>
          <p className="text-[11px] text-slate-400">Hệ thống bảo mật xác thực tập trung theo tiêu chuẩn nội bộ</p>
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
