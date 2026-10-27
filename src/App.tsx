/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile } from './types';
import { getCurrentUser, signOut, refreshSession, isSessionExpired } from './services/authService';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { PortalSSOModal } from './components/common/PortalSSOModal';
import { ExportModal } from './components/common/ExportModal';
import { AdminAccessModal } from './components/common/AdminAccessModal';

import { OverviewView } from './components/views/OverviewView';
import { MultiChannelSyncView } from './components/views/MultiChannelSyncView';
import { CallCenterView } from './components/views/CallCenterView';
import { FreshchatView } from './components/views/FreshchatView';
import { TicketSupportView } from './components/views/TicketSupportView';
import { InhouseStaffView } from './components/views/InhouseStaffView';
import { OutsourcedStaffView } from './components/views/OutsourcedStaffView';
import KpiEvaluationView from './components/views/KpiEvaluationView';
import RetailIncidentView from './components/views/RetailIncidentView';
import ProjectFnbView from './components/views/ProjectFnbView';
import ProjectBookingEmployView from './components/views/ProjectBookingEmployView';
import SettingsReportView from './components/views/SettingsReportView';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('tong-quan');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSSOOpen, setIsSSOOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTitle, setExportTitle] = useState('Báo Cáo Tiếp Nhận Đa Kênh CSKH KiotViet');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  // Inactivity Session Tracker: 60 minutes
  // Extends session indefinitely on any user interaction (click, keydown, scroll, touch)
  useEffect(() => {
    if (!currentUser) return;

    // Refresh immediately when active
    refreshSession();

    let lastRefreshed = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle refresh calls to once every 15 seconds to optimize performance
      if (now - lastRefreshed > 15000) {
        lastRefreshed = now;
        refreshSession();
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((ev) => {
      window.addEventListener(ev, handleUserActivity, { passive: true });
    });

    // Check expiration every 5 seconds
    const checkInterval = setInterval(() => {
      if (isSessionExpired()) {
        signOut();
        setCurrentUserState(null);
        setSessionExpiredNotice('Phiên đăng nhập đã kết thúc sau 60 phút không có thao tác. Vui lòng đăng nhập lại để tiếp tục làm việc.');
      }
    }, 5000);

    return () => {
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, handleUserActivity);
      });
      clearInterval(checkInterval);
    };
  }, [currentUser]);

  const handleOpenExport = (title?: string) => {
    if (title) setExportTitle(title);
    setIsExportOpen(true);
  };

  const handleTriggerSync = () => {
    setSyncNotice('Đã đồng bộ thành công dữ liệu chốt ca T-1 (22/10/2026 23:59:59) từ Asterisk, Voice AI, CRM và BPO!');
    setTimeout(() => {
      setSyncNotice(null);
    }, 4000);
  };

  const handleSignOut = () => {
    signOut();
    setCurrentUserState(null);
    setSessionExpiredNotice(null);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUserState(user);
    setIsSSOOpen(false);
    setSessionExpiredNotice(null);
    setSyncNotice(`Chào mừng ${user.name} (${user.email}) đã đăng nhập vào KiotViet Care!`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // If user is not logged in, render the Portal 2.4 SSO authentication portal matching image_93b94bf6.png
  if (!currentUser) {
    return (
      <PortalSSOModal
        isOpen={true}
        isFullPage={true}
        sessionExpiredNotice={sessionExpiredNotice}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-slate-800 antialiased flex flex-col">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Fixed Top Header */}
        <Header
          currentTab={currentTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentUser={currentUser}
          onOpenPortalSSO={() => setIsSSOOpen(true)}
          onOpenExportModal={() => handleOpenExport()}
          onTriggerSync={handleTriggerSync}
          onOpenAdminModal={() => setIsAdminModalOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Global Sync Notification Banner */}
        {syncNotice && (
          <div className="fixed top-20 right-6 z-50 bg-secondary-container text-on-secondary-container px-4 py-3 rounded-xl shadow-lg border border-secondary/20 flex items-center gap-3 animate-fadeIn">
            <span className="material-symbols-outlined text-[20px] text-secondary">cloud_done</span>
            <span className="text-sm font-medium">{syncNotice}</span>
            <button
              onClick={() => setSyncNotice(null)}
              className="p-1 text-slate-500 hover:text-slate-800"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Dynamic Route View */}
        <main className="w-full pt-20 px-4 sm:px-6 pb-12 flex-1 max-w-[1680px] mx-auto">
          {currentTab === 'tong-quan' && (
            <OverviewView
              onNavigate={setCurrentTab}
              onOpenExport={() => handleOpenExport('Báo Cáo Tổng Quan Điều Hành CSKH')}
            />
          )}

          {currentTab === 'bao-cao-da-kenh' && (
            <MultiChannelSyncView
              onOpenExport={() => handleOpenExport('Báo Cáo Tiếp Nhận Đa Kênh')}
              currentUserEmail={currentUser.email}
            />
          )}

          {currentTab === 'call-center' && (
            <CallCenterView
              onOpenExport={() => handleOpenExport('Báo Cáo Vận Hành Hotline 1900 6522')}
            />
          )}

          {currentTab === 'chat-freshchat' && (
            <FreshchatView
              onOpenExport={() => handleOpenExport('Báo Cáo Freshchat Livechat & AI')}
            />
          )}

          {currentTab === 'ticket-ho-tro' && (
            <TicketSupportView
              onOpenExport={() => handleOpenExport('Báo Cáo Ticket & SLA 4h Hỗ Trợ')}
            />
          )}

          {currentTab === 'nhan-su-inhouse' && (
            <InhouseStaffView
              onOpenExport={() => handleOpenExport('Báo Cáo Định Biên Nhân Sự Inhouse')}
            />
          )}

          {currentTab === 'nhan-su-outsourced' && (
            <OutsourcedStaffView
              onOpenExport={() => handleOpenExport('Báo Cáo Hiệu Suất Nhân Sự Outsourced BPO')}
            />
          )}

          {currentTab === 'danh-gia-kpi' && (
            <KpiEvaluationView
              onOpenExport={() => handleOpenExport('Báo Cáo Đánh Giá & Theo Dõi KPI Nhân Sự')}
            />
          )}

          {currentTab === 'kiotviet-retail' && (
            <RetailIncidentView
              onOpenExport={() => handleOpenExport('Báo Cáo Quản Lý Sự Cố & Bug KiotViet Retail')}
            />
          )}

          {currentTab === 'kiotviet-fnb' && (
            <ProjectFnbView
              subType="fnb"
              onOpenExport={() => handleOpenExport('Báo Cáo Vận Hành KiotViet FnB')}
            />
          )}

          {currentTab === 'kat-fnb-bar' && (
            <ProjectFnbView
              subType="kat"
              onOpenExport={() => handleOpenExport('Báo Cáo Vận Hành KAT Bar & Pub')}
            />
          )}

          {currentTab === 'kiotviet-booking' && (
            <ProjectBookingEmployView
              subType="booking"
              onOpenExport={() => handleOpenExport('Báo Cáo Vận Hành KiotViet Booking')}
            />
          )}

          {currentTab === 'kiotviet-employ' && (
            <ProjectBookingEmployView
              subType="employ"
              onOpenExport={() => handleOpenExport('Báo Cáo Vận Hành KiotViet Employ')}
            />
          )}

          {currentTab === 'cau-hinh-bao-cao' && (
            <SettingsReportView
              onOpenExport={() => handleOpenExport('Cấu Hình Trọng Số KPI & Báo Cáo')}
            />
          )}
        </main>
      </div>

      {/* Portal 2.4 SSO Modal with Google Account & Whitelist check */}
      <PortalSSOModal
        isOpen={isSSOOpen}
        onClose={() => setIsSSOOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Access Whitelist & Supabase Configuration Modal */}
      <AdminAccessModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Export Report Dialog (Excel, PDF, CSV) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        reportTitle={exportTitle}
      />
    </div>
  );
}
