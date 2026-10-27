import React, { useState } from 'react';
import {
  loginWithWhitelistedEmail,
  triggerGoogleIdentityPopup,
  getGoogleClientId,
  saveGoogleClientId,
} from '../../services/authService';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle standard credentials login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = loginWithWhitelistedEmail(email, password);
      setIsLoading(false);
      if (result.success && result.user) {
        if (onLoginSuccess) onLoginSuccess(result.user);
        if (onClose) onClose();
      } else {
        setErrorMessage(result.message || 'Tài khoản không tồn tại trong danh sách Whitelist được cấp quyền.');
      }
    }, 300);
  };

  // Handle Google Account Sign-In (Real Google SSO Popup)
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(getGoogleClientId());

  const handleGoogleClick = () => {
    setIsLoading(true);
    setErrorMessage(null);

    triggerGoogleIdentityPopup({
      onSuccess: (user) => {
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess(user);
        if (onClose) onClose();
      },
      onError: (msg) => {
        setIsLoading(false);
        setErrorMessage(msg);
      },
      onConfigNeeded: () => {
        setIsLoading(false);
        setShowGoogleConfig(true);
      },
    });
  };

  const handleSaveClientIdAndOpenGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      setErrorMessage('Vui lòng nhập Google OAuth Client ID hợp lệ.');
      return;
    }
    saveGoogleClientId(clientIdInput.trim());
    setShowGoogleConfig(false);
    setIsLoading(true);
    setErrorMessage(null);

    // Trigger real Google popup with the newly saved client ID
    setTimeout(() => {
      triggerGoogleIdentityPopup({
        onSuccess: (user) => {
          setIsLoading(false);
          if (onLoginSuccess) onLoginSuccess(user);
          if (onClose) onClose();
        },
        onError: (msg) => {
          setIsLoading(false);
          setErrorMessage(msg);
        },
        onConfigNeeded: () => {
          setIsLoading(false);
          setShowGoogleConfig(true);
        },
      });
    }, 300);
  };

  const content = (
    <div className="w-full max-w-[440px] mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200/90 p-6 sm:p-8 relative text-left">
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
      <div className="space-y-1 mb-6">
        <div className="inline-block px-2 py-0.5 rounded bg-sky-100 text-[#0090DA] text-[11px] font-bold tracking-wider uppercase">
          HỆ THỐNG ĐIỀU HÀNH CSKH
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Đăng nhập hệ thống
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Đăng nhập bằng tài khoản nội bộ hoặc Google Account được phân quyền để tiếp tục.
        </p>
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

      {/* Error / Unauthorized Warning Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-900 text-left flex items-start gap-2.5 text-xs animate-fadeIn border border-rose-200">
          <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
          <div className="flex-1">
            <div className="font-bold text-rose-800">Đăng nhập không thành công</div>
            <div className="mt-0.5 leading-relaxed text-rose-700">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* 1. GOOGLE ACCOUNT SIGN-IN BUTTON */}
      <div className="mb-5 space-y-2">
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-70"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Đăng nhập với Google Account</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-medium">Hoặc đăng nhập mật khẩu</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* 2. USERNAME & PASSWORD FORM */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-left">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Tên đăng nhập / Email
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">badge</span>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Nhập email (vd: thuyettk42@gmail.com)..."
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full h-11 pl-9 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

        <div className="flex items-center justify-between text-xs pt-0.5 text-slate-500">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
            <span>Ghi nhớ phiên 60 phút</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Mật khẩu nội bộ: KiotViet#2026
          </span>
        </div>

        {/* Primary Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-[#006195] hover:bg-[#004b74] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-1 cursor-pointer disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Đăng nhập</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Modal Close option if not full page */}
      {!isFullPage && onClose && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      )}
      {/* Google OAuth Setup Dialog if Client ID is needed */}
      {showGoogleConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-left space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">key</span>
                <h3 className="font-bold text-slate-800 text-base">Cấu hình Google OAuth 2.0 (SSO)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleConfig(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Để mở cửa sổ xác thực Google SSO chính thức (<span className="font-mono text-slate-800">accounts.google.com</span>) trên domain{' '}
              <span className="font-semibold text-primary">cs-report-sage.vercel.app</span>, bạn cần cấu hình Google OAuth Client ID:
            </p>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-[#006195]">Các bước lấy Google Client ID:</div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                <li>Truy cập <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-primary underline">Google Cloud Console &gt; Credentials</a>.</li>
                <li>Tạo OAuth 2.0 Client ID (Application type: Web application).</li>
                <li>Thêm vào <b>Authorized JavaScript origins</b>:
                  <div className="font-mono bg-white p-1 rounded border border-sky-300 mt-0.5 select-all text-[11px]">https://cs-report-sage.vercel.app</div>
                </li>
                <li>Sao chép Client ID và dán vào bên dưới:</li>
              </ol>
            </div>

            <form onSubmit={handleSaveClientIdAndOpenGoogle} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Client ID:
                </label>
                <input
                  type="text"
                  required
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="vd: 123456789-xxxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGoogleConfig(false)}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Đăng nhập mật khẩu
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-primary hover:bg-[#004b74] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Lưu & Mở Google SSO
                </button>
              </div>
            </form>
          </div>
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
          <p className="text-[11px] text-slate-400">Quản trị danh sách tài khoản phân quyền được thiết lập bên trong hệ thống</p>
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
