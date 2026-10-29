import React from 'react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      label: 'TỔNG QUAN',
      items: [
        { id: 'tong-quan' as NavigationTab, label: 'Tổng quan điều hành', icon: 'grid_view' },
        { id: 'bao-cao-da-kenh' as NavigationTab, label: 'Báo Cáo Đa Kênh (Sheet)', icon: 'table_chart' },
      ],
    },
    {
      label: 'KÊNH VẬN HÀNH',
      items: [
        { id: 'call-center' as NavigationTab, label: 'Call Center', icon: 'headset_mic' },
        { id: 'chat-freshchat' as NavigationTab, label: 'Chat (Freshchat)', icon: 'chat' },
        { id: 'ticket-ho-tro' as NavigationTab, label: 'Ticket Hỗ trợ', icon: 'confirmation_number' },
      ],
    },
    {
      label: 'LỰC LƯỢNG NHÂN SỰ',
      items: [
        { id: 'nhan-su-inhouse' as NavigationTab, label: 'Nhân sự Inhouse', icon: 'badge' },
        { id: 'nhan-su-outsourced' as NavigationTab, label: 'Nhân sự Outsourced', icon: 'groups_3' },
        { id: 'danh-gia-kpi' as NavigationTab, label: 'Đánh giá KPI', icon: 'insights' },
      ],
    },
    {
      label: 'PHÂN HỆ DỰ ÁN',
      items: [
        { id: 'kat-fnb-bar' as NavigationTab, label: 'KAT', icon: 'local_bar', badge: 'Active' },
        { id: 'kiotviet-retail' as NavigationTab, label: 'KiotViet Retail', icon: 'storefront' },
        { id: 'kiotviet-fnb' as NavigationTab, label: 'KiotViet FnB', icon: 'restaurant' },
        { id: 'kiotviet-booking' as NavigationTab, label: 'KiotViet Booking', icon: 'calendar_month' },
        { id: 'kiotviet-employ' as NavigationTab, label: 'KiotViet Employ', icon: 'assignment_ind' },
      ],
    },
    {
      label: 'CẤU HÌNH & BÁO CÁO',
      items: [
        { id: 'cau-hinh-bao-cao' as NavigationTab, label: 'Cấu hình & Báo cáo', icon: 'monitoring' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white shadow-sm z-50 flex flex-col justify-between border-r border-slate-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/assets/aistudio/_ZNS__Color_Logo_ecc542c2.png"
              alt="KiotViet Logo"
              className="h-7 sm:h-8 w-auto max-w-[135px] object-contain shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-primary tracking-tight truncate leading-tight">
                  Care Enterprise
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Customer Care Hub
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'chevron_right' : 'menu_open'}
            </span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="overflow-y-auto max-h-[calc(100vh-8.5rem)] px-2 py-3 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sec.label}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-primary text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                                isActive
                                  ? 'bg-emerald-400 text-slate-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status & Version */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <div
          className={`flex items-center justify-between text-xs text-slate-500 ${
            isCollapsed ? 'flex-col gap-1 text-center' : ''
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {!isCollapsed && <span className="text-[11px] font-medium text-slate-600">Hệ thống hoạt động</span>}
          </div>
          <span className="font-mono text-[10px] text-slate-400">v3.8.2</span>
        </div>
      </div>
    </aside>
  );
};
