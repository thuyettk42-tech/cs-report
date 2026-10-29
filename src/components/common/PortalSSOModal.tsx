import React, { useState } from 'react';
import {
  loginWithWhitelistedEmail,
  triggerGoogleIdentityPopup,
  getGoogleClientId,
  saveGoogleClientId,
  getCurrentOrigin,
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
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [showOriginMismatchGuide, setShowOriginMismatchGuide] = useState(false);

  const currentOrigin = getCurrentOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
  const clientId = getGoogleClientId();

  if (!isOpen) return null;

  // Handle standard credentials login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
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
        setErrorMessage(result.message || 'Tài khoản không tồn tại trong danh sách Whitelist hoặc mật khẩu không chính xác.');
      }
    }, 300);
  };

  // Handle Google Account Sign-In (Real Google SSO Popup)
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(clientId);

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
        // If error looks like origin mismatch or idpiframe/popup failure
        if (
          msg.toLowerCase().includes('origin_mismatch') ||
          msg.toLowerCase().includes('không thể khởi tạo') ||
          msg.toLowerCase().includes('access_denied') ||
          msg.toLowerCase().includes('idpiframe')
        ) {
          setShowOriginMismatchGuide(true);
        }
        setErrorMessage(
          msg || 'Google không cho phép đăng nhập từ Origin hiện tại (Lỗi 400: origin_mismatch).'
        );
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
          setShowOriginMismatchGuide(true);
          setErrorMessage(msg);
        },
        onConfigNeeded: () => {
          setIsLoading(false);
          setShowGoogleConfig(true);
        },
      });
    }, 300);
  };

  const copyToClipboard = (text: string, type: 'origin' | 'clientId') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'origin') {
        setCopiedOrigin(true);
        setTimeout(() => setCopiedOrigin(false), 2000);
      } else {
        setCopiedClientId(true);
        setTimeout(() => setCopiedClientId(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const content = (
    <div className="w-full max-w-[480px] mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200/90 p-6 sm:p-7 relative text-left">
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

      {/* Headline & Welcome */}
      <div className="space-y-1 mb-5">
        <div className="inline-block px-2 py-0.5 rounded bg-sky-100 text-[#0090DA] text-[11px] font-bold tracking-wider uppercase">
          HỆ THỐNG ĐIỀU HÀNH CSKH KIOTVIET
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Đăng nhập hệ thống
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Báo cáo nội bộ dành riêng cho danh sách Quản lý được phân quyền (Whitelist).
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
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 text-rose-900 text-left flex flex-col gap-2 text-xs animate-fadeIn border border-rose-200">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-600 shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <div className="font-bold text-rose-800">Thông báo xác thực</div>
              <div className="mt-0.5 leading-relaxed text-rose-700">{errorMessage}</div>
            </div>
          </div>
          {errorMessage.toLowerCase().includes('origin_mismatch') && (
            <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => setShowOriginMismatchGuide(true)}
                className="text-[11px] font-medium text-amber-800 hover:text-amber-900 underline cursor-pointer"
              >
                Xem hướng dẫn khắc phục lỗi 400: origin_mismatch
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. GOOGLE ACCOUNT SIGN-IN BUTTON */}
      <div className="mb-5 space-y-1.5">
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-70"
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

        {/* Helper info */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => setShowOriginMismatchGuide(true)}
            className="text-amber-700 hover:text-amber-900 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] text-amber-600">help</span>
            Báo &ldquo;Lỗi 400: origin_mismatch&rdquo;?
          </button>
          <button
            type="button"
            onClick={() => setShowGoogleConfig(true)}
            className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[13px]">settings</span>
            Cấu hình Client ID
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex py-1 items-center mb-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">
          Hoặc đăng nhập bằng tên đăng nhập và mật khẩu
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* 2. USERNAME & PASSWORD FORM */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 text-left">
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
              placeholder="Nhập email được cấp quyền..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Nhập mật khẩu..."
              className="w-full h-10 pl-9 pr-10 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
            <span className="text-[11px]">Ghi nhớ phiên 60 phút</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Tự gia hạn khi thao tác
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-xl bg-[#006195] hover:bg-[#004b74] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs mt-1 cursor-pointer disabled:opacity-70"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Đăng nhập</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Modal Close option if not full page */}
      {!isFullPage && onClose && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      )}

      {/* MODAL: Hướng dẫn sửa Lỗi 400: origin_mismatch */}
      {showOriginMismatchGuide && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    Khắc phục &ldquo;Lỗi 400: origin_mismatch&rdquo;
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nguyên nhân &amp; Cách cấu hình Google Cloud Console
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginMismatchGuide(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-1.5">
              <div className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-sky-700">info</span>
                <span>Phương án đăng nhập thay thế:</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                Trong khi chờ cập nhật Origin trên Google Cloud Console, bạn có thể đăng nhập bằng <b>Tên đăng nhập / Email</b> và <b>Mật khẩu</b> ở biểu mẫu đăng nhập bên ngoài.
              </p>
            </div>

            {/* Why Origin Mismatch Happens */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-800">
                Tại sao Google báo Lỗi 400: origin_mismatch?
              </div>
              <p className="leading-relaxed">
                Google OAuth yêu cầu tên miền đang chạy ứng dụng phải được khai báo trong mục{' '}
                <b>&ldquo;Authorized JavaScript origins&rdquo;</b> của Client ID trong Google Cloud Console.
                Nếu tên miền hiện tại chưa được thêm, Google sẽ chặn mở cửa sổ SSO để chống giả mạo tên miền.
              </p>
            </div>

            {/* Origin to Copy */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Origin URL hiện tại cần thêm:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentOrigin, 'origin')}
                  className="text-primary hover:text-[#004b74] font-semibold text-[11px] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copiedOrigin ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedOrigin ? 'Đã sao chép!' : 'Sao chép URL'}</span>
                </button>
              </div>
              <div className="font-mono bg-white p-2 rounded-lg border border-slate-300 text-[11px] text-slate-900 select-all break-all">
                {currentOrigin}
              </div>
            </div>

            {/* Steps in Google Cloud */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-[#006195] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>Các bước thêm URL vào Google Cloud Console:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-700">
                <li>
                  Truy cập vào{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline font-semibold"
                  >
                    Google Cloud Console &gt; Credentials
                  </a>.
                </li>
                <li>
                  Bấm vào tên OAuth 2.0 Client ID của bạn (Client ID hiện tại:{' '}
                  <span className="font-mono text-slate-900 font-semibold">{clientId.slice(0, 16)}...apps.googleusercontent.com</span>).
                </li>
                <li>
                  Cuộn xuống phần <b>Authorized JavaScript origins (URI nguồn gốc JavaScript được ủy quyền)</b>.
                </li>
                <li>
                  Bấm <b>+ ADD URI</b> và dán URL vừa sao chép ở trên vào:
                  <div className="font-mono bg-white p-1 rounded border border-sky-300 mt-1 select-all text-[11px] text-slate-800">
                    {currentOrigin}
                  </div>
                </li>
                <li>
                  Bấm <b>SAVE (Lưu)</b>. <i>(Lưu ý: Google mất khoảng 1 - 3 phút để đồng bộ trên toàn cầu)</i>.
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOriginMismatchGuide(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Đã hiểu &amp; Đóng
              </button>
            </div>
          </div>
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
              Google OAuth Client ID hiện tại dùng để mở cửa sổ xác thực <span className="font-mono text-slate-800">accounts.google.com</span>.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Origin URL hiện tại của bạn:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentOrigin, 'origin')}
                  className="text-primary hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  {copiedOrigin ? 'Đã chép!' : 'Sao chép'}
                </button>
              </div>
              <div className="font-mono bg-white p-1.5 rounded border border-slate-300 text-[11px] select-all break-all">
                {currentOrigin}
              </div>
              <p className="text-[10px] text-slate-500">
                Hãy thêm URL này vào mục <b>Authorized JavaScript origins</b> trên Google Cloud Console để không bị Lỗi 400: origin_mismatch.
              </p>
            </div>

            <form onSubmit={handleSaveClientIdAndOpenGoogle} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Google Client ID:
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(clientIdInput, 'clientId')}
                    className="text-primary hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    {copiedClientId ? 'Đã chép ID!' : 'Sao chép ID'}
                  </button>
                </div>
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
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Lưu &amp; Mở Google SSO
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
