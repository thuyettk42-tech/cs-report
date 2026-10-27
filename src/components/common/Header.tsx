import React, { useState } from 'react';
import { NavigationTab, UserProfile } from '../../types';

interface HeaderProps {
  currentTab: NavigationTab;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  currentUser: UserProfile;
  onOpenPortalSSO: () => void;
  onOpenExportModal: () => void;
  onTriggerSync: () => void;
  onOpenAdminModal?: () => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
}

const TAB_BREADCRUMBS: Record<NavigationTab, { group: string; title: string }> = {
  'tong-quan': { group: 'Tổng quan', title: 'Hiệu suất Vận hành & Chỉ số KPI' },
  'bao-cao-da-kenh': { group: 'Báo Cáo Tổng Hợp', title: 'Báo Cáo Tiếp Nhận Đa Kênh (Google Sheets / Excel)' },
  'call-center': { group: 'Kênh Vận Hành', title: 'Call Center Hotline 1900 6522' },
  'chat-freshchat': { group: 'Kênh Vận Hành', title: 'Báo cáo Freshchat Livechat & AI' },
  'ticket-ho-tro': { group: 'Kênh Vận Hành', title: 'Vận hành Ticket & SLA Hỗ trợ' },
  'nhan-su-inhouse': { group: 'Lực Lượng Nhân Sự', title: 'Quản lý & Định biên Nhân sự Inhouse' },
  'nhan-su-outsourced': { group: 'Lực Lượng Nhân Sự', title: 'Hiệu suất & Quản lý Nhân sự Outsource' },
  'danh-gia-kpi': { group: 'Lực Lượng Nhân Sự', title: 'Đánh giá & Theo dõi KPI Nhân sự' },
  'kiotviet-retail': { group: 'Phân Hệ Dự Án', title: 'KiotViet Retail - Sự cố & Bug/Incident' },
  'kiotviet-fnb': { group: 'Phân Hệ Dự Án', title: 'KiotViet FnB - Vận hành Nhà hàng & Cafe' },
  'kat-fnb-bar': { group: 'Phân Hệ Dự Án', title: 'KAT - Vận hành Bar, Pub & TMĐT' },
  'kiotviet-booking': { group: 'Phân Hệ Dự Án', title: 'KiotViet Booking / Hotel' },
  'kiotviet-employ': { group: 'Phân Hệ Dự Án', title: 'KiotViet Employ - Nhân sự & Chấm công' },
  'cau-hinh-bao-cao': { group: 'Cấu Hình & Báo Cáo', title: 'Cấu hình Mục tiêu KPI & Hệ thống' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  isSidebarCollapsed,
  onToggleSidebar,
  currentUser,
  onOpenPortalSSO,
  onTriggerSync,
  onOpenAdminModal,
  onOpenSettings,
  onSignOut,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const breadcrumb = TAB_BREADCRUMBS[currentTab] || { group: 'Báo cáo', title: 'Chi tiết' };

  const handleSyncClick = () => {
    setIsSyncing(true);
    onTriggerSync();
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md shadow-xs z-40 px-4 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-200 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors shrink-0"
          title="Thu gọn / Mở rộng menu"
        >
          <span className="material-symbols-outlined text-[20px]">view_sidebar</span>
        </button>

        {/* Breadcrumb trail */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 min-w-0 truncate">
          <span className="hover:text-primary cursor-pointer truncate">CSKH</span>
          <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
          <span className="text-slate-600 truncate">{breadcrumb.group}</span>
          <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
          <span className="font-semibold text-slate-900 truncate">{breadcrumb.title}</span>
        </div>

        {/* Snapshot T-1 badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-primary border border-sky-200 text-xs font-semibold shrink-0">
          <span className="material-symbols-outlined text-[14px]">history</span>
          <span>Snapshot T-1 (Hôm qua)</span>
        </div>
      </div>

      {/* Middle & Right: Sync, Portal SSO, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sync Button */}
        <button
          onClick={handleSyncClick}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-2xs shrink-0"
          title="Đồng bộ dữ liệu mới nhất từ Asterisk, Freshchat và Jira"
        >
          <span className={`material-symbols-outlined text-[16px] text-primary ${isSyncing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span className="hidden md:inline">Đồng bộ dữ liệu</span>
        </button>

        {/* Portal 2.4 SSO Quick Launcher */}
        <button
          onClick={onOpenPortalSSO}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold border border-primary/20 transition-all shrink-0"
          title="Mở màn hình Đăng nhập Portal 2.4 SSO & Bộ công cụ test trạng thái"
        >
          <span className="material-symbols-outlined text-[16px]">vpn_key</span>
          <span className="hidden sm:inline">Portal SSO</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Thông báo vận hành"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Cảnh báo vận hành cần xử lý
                </span>
                <span className="text-[11px] text-brand font-medium">3 cảnh báo</span>
              </div>
              <div className="space-y-2 mt-2 text-xs">
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">warning</span>
                  <div>
                    <div className="font-bold text-slate-900">Ticket L2 KiotViet FnB vượt SLA 180p</div>
                    <div className="text-slate-600 text-[11px]">40 ticket quá hạn cần đôn đốc ca sáng nay.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">phone_callback</span>
                  <div>
                    <div className="font-bold text-slate-900">Tỷ lệ gọi lại nhỡ OS Partner: 63.6%</div>
                    <div className="text-slate-600 text-[11px]">Cần đối soát với giám sát ca trực BPO.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 flex items-start gap-2">
                  <span className="material-symbols-outlined text-brand text-[18px] shrink-0 mt-0.5">check_circle</span>
                  <div>
                    <div className="font-bold text-slate-900">Đối soát nghiệm thu Outsource T10</div>
                    <div className="text-slate-600 text-[11px]">Đã chốt đủ 15.7 Seat sẵn sàng ký biên bản.</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-brand font-semibold hover:underline"
                >
                  Đóng thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings & Raw Data Source Launcher (Góc phải bên trên) */}
        <button
          onClick={onOpenSettings}
          className="relative p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-primary transition-all group shrink-0"
          title="Cài đặt & File dữ liệu gốc báo cáo"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-45">
            settings
          </span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {currentUser.avatarText}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-400">{currentUser.role}</div>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600">
              arrow_drop_down
            </span>
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 text-xs animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.email}</div>
              </div>
              {/* 60m Inactivity Session indicator */}
              <div className="p-2.5 mx-1 my-1 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px]">
                <div className="flex items-center justify-between text-slate-700 font-semibold mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Phiên: 60 phút
                  </span>
                  <span className="text-primary font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-sky-200">
                    Tự động gia hạn
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Tự động duy trì không giới hạn khi có thao tác (click, phím, cuộn).
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[18px] text-sky-600">settings</span>
                <span>Cài đặt &amp; File dữ liệu gốc</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onOpenAdminModal) onOpenAdminModal();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[18px] text-emerald-600">admin_panel_settings</span>
                <span>Whitelist Admin &amp; Supabase</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenPortalSSO();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
                <span>Mở Portal SSO Login</span>
              </button>
              <div className="my-1 border-t border-slate-100"></div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    onOpenPortalSSO();
                  }
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
