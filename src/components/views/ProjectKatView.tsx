import React, { useState } from 'react';
import KatTicketReport from './KatTicketReport';

interface ProjectKatViewProps {
  onOpenExport?: () => void;
}

export const ProjectKatView: React.FC<ProjectKatViewProps> = ({ onOpenExport }) => {
  // State for filters
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'year'>('month');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [volumeView, setVolumeView] = useState<'service' | 'channel'>('service');
  const [agentTeamFilter, setAgentTeamFilter] = useState<'all' | 'inhouse' | 'outsource'>('all');
  const [agentTimeTab, setAgentTimeTab] = useState<'day' | 'shift'>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // State for business group filters (KVE / HKD)
  const [jiraGroupFilter, setJiraGroupFilter] = useState<'all' | 'kve' | 'hkd'>('all');
  const [caseGroupFilter, setCaseGroupFilter] = useState<'all' | 'kve' | 'hkd'>('all');

  // Google Sheet integration modal/state
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [katSheetUrl, setKatSheetUrl] = useState<string>(() => {
    return localStorage.getItem('kat_google_sheet_url') || 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
  });
  const [sheetSaveStatus, setSheetSaveStatus] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice('Đã đồng bộ dữ liệu vận hành KAT mới nhất từ hệ thống Live Sync!');
      setTimeout(() => setRefreshNotice(null), 3500);
    }, 700);
  };

  const handleSaveSheetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kat_google_sheet_url', katSheetUrl);
    setSheetSaveStatus('Đã lưu cấu hình liên kết Google Sheet KAT thành công!');
    setTimeout(() => {
      setSheetSaveStatus(null);
      setShowSheetModal(false);
    }, 1500);
  };

  // 30 Days trend data
  const dailyServiceData = [
    { day: '01', hddt: 360, cks: 210, thue: 140, khac: 50 },
    { day: '03', hddt: 410, cks: 230, thue: 155, khac: 60 },
    { day: '05', hddt: 380, cks: 220, thue: 145, khac: 45 },
    { day: '07', hddt: 490, cks: 260, thue: 170, khac: 70 },
    { day: '09', hddt: 520, cks: 280, thue: 180, khac: 65 },
    { day: '11', hddt: 560, cks: 300, thue: 195, khac: 75 },
    { day: '13', dayBold: true, hddt: 610, cks: 340, thue: 210, khac: 80 },
    { day: '15', hddt: 590, cks: 310, thue: 200, khac: 70 },
    { day: '17', hddt: 640, cks: 360, thue: 230, khac: 85 },
    { day: '20', dayHighlight: true, hddt: 710, cks: 440, thue: 310, khac: 95 },
    { day: '22', hddt: 630, cks: 380, thue: 250, khac: 85 },
    { day: '24', hddt: 570, cks: 320, thue: 220, khac: 75 },
    { day: '26', hddt: 540, cks: 290, thue: 190, khac: 70 },
    { day: '28', hddt: 590, cks: 310, thue: 210, khac: 80 },
    { day: 'Hôm nay', isToday: true, hddt: 612, cks: 318, thue: 241, khac: 77 },
  ];

  // Hourly volume distribution (8h to 18h)
  const hourlyData = [
    { hour: '8h', count: 48, intensity: 'low' },
    { hour: '9h', count: 75, intensity: 'medium-low' },
    { hour: '10h', count: 110, intensity: 'medium' },
    { hour: '11h', count: 125, intensity: 'medium' },
    { hour: '12h', count: 52, intensity: 'low' },
    { hour: '13h', count: 98, intensity: 'medium-low' },
    { hour: '14h', count: 172, intensity: 'peak', isPeak: true },
    { hour: '15h', count: 185, intensity: 'super-peak', isPeak: true },
    { hour: '16h', count: 168, intensity: 'peak', isPeak: true },
    { hour: '17h', count: 104, intensity: 'medium' },
    { hour: '18h', count: 62, intensity: 'low' },
  ];

  // Specialists Performance Ranking
  const allAgents = [
    { rank: 1, name: 'Hoàng Mai Linh', team: 'inhouse', aht: '6m45s', score: 68, delta: '+31% TB', status: 'good' },
    { rank: 2, name: 'Trần Văn Nam', team: 'inhouse', aht: '7m10s', score: 64, delta: '+23% TB', status: 'good' },
    { rank: 3, name: 'Lê Thị Thu Thảo', team: 'inhouse', aht: '7m20s', score: 61, delta: '+17% TB', status: 'good' },
    { rank: 4, name: 'Nguyễn Đức Hưng', team: 'outsource', aht: '8m05s', score: 58, delta: '+11% TB', status: 'good' },
    { rank: 5, name: 'Vũ Thị Cẩm Tú', team: 'inhouse', aht: '7m35s', score: 55, delta: '+5% TB', status: 'good' },
    { rank: 6, name: 'Đặng Quốc Anh', team: 'outsource', aht: '8m15s', score: 53, delta: '+2% TB', status: 'good' },
    { rank: 7, name: 'Phạm Minh Khoa', team: 'inhouse', aht: '7m50s', score: 50, delta: 'Đạt KPI', status: 'kpi' },
    { rank: 8, name: 'Bùi Hải Đăng', team: 'outsource', aht: '8m40s', score: 48, delta: 'Đạt KPI', status: 'kpi' },
    { rank: 9, name: 'Nguyễn Hồng Ngọc', team: 'outsource', aht: '8m55s', score: 44, delta: '-1 ca', status: 'warning' },
    { rank: 10, name: 'Đỗ Thanh Vân', team: 'outsource', aht: '9m15s', score: 39, delta: '-6 ca (Cần kèm)', status: 'danger' },
  ];

  const displayedAgents = allAgents.filter((agent) => {
    if (agentTeamFilter === 'inhouse') return agent.team === 'inhouse';
    if (agentTeamFilter === 'outsource') return agent.team === 'outsource';
    return true;
  });

  // Top Issues Table (Jira)
  const topIssues = [
    {
      id: 1,
      title: 'Không nhận USB Token khi ký số',
      jiraCode: 'KAT-3419 • Xung đột Win 11 PKI Token',
      group: 'KVE',
      category: 'Bug',
      catColor: 'bg-rose-50 text-rose-700 border-rose-200',
      service: 'CKS',
      createDate: '19/10/2026',
      daysOpen: 5,
      daysColor: 'bg-amber-100 text-amber-800',
      jiraStatus: '⚡ Đang vá hotfix (In Progress)',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 2,
      title: 'Lỗi kết nối cổng Thuế điện tử khi nộp tờ khai',
      jiraCode: 'KAT-3402 • Timeout API TCT cao điểm',
      group: 'HKD',
      category: 'Bug',
      catColor: 'bg-rose-50 text-rose-700 border-rose-200',
      service: 'Thuế - KT',
      createDate: '15/10/2026',
      daysOpen: 9,
      daysColor: 'bg-rose-100 text-rose-800',
      jiraStatus: 'Dev re-check retry mechanism',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 3,
      title: 'Hướng dẫn gia hạn chứng thư số còn hạn',
      jiraCode: 'KAT-3435 • Tài liệu quy trình cấp bù',
      group: 'KVE',
      category: 'Support',
      catColor: 'bg-sky-50 text-sky-700 border-sky-200',
      service: 'CKS',
      createDate: '22/10/2026',
      daysOpen: 2,
      daysColor: 'bg-emerald-100 text-emerald-800',
      jiraStatus: '✔ Ready for Release',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 4,
      title: 'Sai số liệu sổ sách kế toán HKD khi kết xuất báo cáo',
      jiraCode: 'KAT-3388 • Mẫu biểu TT88',
      group: 'HKD',
      category: 'Support',
      catColor: 'bg-sky-50 text-sky-700 border-sky-200',
      service: 'Thuế - KT',
      createDate: '12/10/2026',
      daysOpen: 12,
      daysColor: 'bg-rose-100 text-rose-800',
      jiraStatus: 'Chờ duyệt tài liệu nghiệp vụ',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 5,
      title: 'Sai lệch tổng tiền khi xuất HĐ từ đơn bán lẻ',
      jiraCode: 'KAT-3350 • Làm tròn thập phân chiết khấu',
      group: 'KVE',
      category: 'Bug',
      catColor: 'bg-rose-50 text-rose-700 border-rose-200',
      service: 'HĐĐT',
      createDate: '08/10/2026',
      daysOpen: 16,
      daysColor: 'bg-emerald-100 text-emerald-800',
      jiraStatus: '✔ Đã đóng (Bản 3.8.2)',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  const displayedIssues = topIssues.filter((item) => {
    if (jiraGroupFilter === 'kve') return item.group === 'KVE';
    if (jiraGroupFilter === 'hkd') return item.group === 'HKD';
    return true;
  });

  // Section 5: Đề xuất tính năng & Nghiệp vụ mới (Case) [Tháng này]
  const newFeatureCases = [
    {
      id: 1,
      title: 'Tự động ký số lô nhiều hóa đơn cuối ca bán hàng',
      sub: 'Tránh tình trạng nhân viên thu ngân phải nhập mã PIN từng hóa đơn lẻ',
      group: 'KVE',
      service: 'HĐĐT & CKS',
      shopCount: '48 shop',
      priority: 'Cao (P1)',
      priorityColor: 'bg-rose-50 text-rose-700 border-rose-200',
      evaluation: 'Đã đưa vào Backlog Sprint 42',
      evalColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 2,
      title: 'Cảnh báo hết hạn chứng thư số trước 30 ngày qua Zalo OA',
      sub: 'Gửi thông báo chủ động để chủ shop kịp gia hạn trước kỳ kê khai thuế',
      group: 'KVE',
      service: 'Chữ ký số (CKS)',
      shopCount: '35 shop',
      priority: 'Trung bình (P2)',
      priorityColor: 'bg-amber-50 text-amber-700 border-amber-200',
      evaluation: 'Đang thiết kế luồng ZNS',
      evalColor: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 3,
      title: 'Kết xuất dữ liệu tờ khai thuế GTGT mẫu chuẩn TT80',
      sub: 'Tự động tổng hợp doanh thu theo từng mức thuế suất 8% và 10% ra file XML',
      group: 'HKD',
      service: 'Thuế - KT',
      shopCount: '29 shop',
      priority: 'Cao (P1)',
      priorityColor: 'bg-rose-50 text-rose-700 border-rose-200',
      evaluation: 'Đang thẩm định cùng ban Pháp chế',
      evalColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 4,
      title: 'Tự động lập sổ kế toán HKD theo TT88',
      sub: 'Đồng bộ số liệu hóa đơn máy tính tiền và đơn hàng tự ghi sổ',
      group: 'HKD',
      service: 'Thuế - KT',
      shopCount: '21 shop',
      priority: 'Thấp (P3)',
      priorityColor: 'bg-slate-100 text-slate-700 border-slate-200',
      evaluation: 'Nghiên cứu Q4/2026',
      evalColor: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  ];

  const displayedCases = newFeatureCases.filter((fc) => {
    if (caseGroupFilter === 'kve') return fc.group === 'KVE';
    if (caseGroupFilter === 'hkd') return fc.group === 'HKD';
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-4 animate-fadeIn pb-8">
      {/* Toast Refresh Notice */}
      {refreshNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* Số liệu thật từ ticket CRM: thẻ chỉ số, sản lượng, tỷ trọng, kênh, theo giờ */}
      <KatTicketReport />

      {/* Các mục bên dưới vẫn là số mẫu – chưa có nguồn dữ liệu */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-2.5 text-xs flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">info</span>
        Các mục bên dưới (Jira, vấn đề nổi cộm, đề xuất tính năng, khiếu nại, hủy hợp đồng) đang là số mẫu, chưa có nguồn dữ liệu.
      </div>

      {/* ROW 4: TICKET JIRA CHUYỂN SP (4 COLS) & TOP VẤN ĐỀ NỔI CỘM (8 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Ticket chuyển SP (Jira) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Ticket chuyển SP (Jira) [Hiện tại]
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi phân loại và độ tuổi tồn đọng các ticket chuyển R&amp;D/Dev
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold border border-slate-200">
                  <button
                    onClick={() => setJiraGroupFilter('all')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      jiraGroupFilter === 'all' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setJiraGroupFilter('kve')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      jiraGroupFilter === 'kve' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    KVE
                  </button>
                  <button
                    onClick={() => setJiraGroupFilter('hkd')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      jiraGroupFilter === 'hkd' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HKD
                  </button>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-extrabold text-[11px] border border-sky-100">
                  Tổng: 87 ticket
                </span>
              </div>
            </div>

            {/* 3 Categories: Bug, Support, Case */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">BUG</span>
                <span className="text-xl font-extrabold text-rose-700">24</span>
                <span className="text-[10px] text-rose-500 block">Lỗi hệ thống</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">SUPPORT</span>
                <span className="text-xl font-extrabold text-sky-700">32</span>
                <span className="text-[10px] text-sky-500 block">Hỗ trợ kỹ thuật</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">CASE</span>
                <span className="text-xl font-extrabold text-amber-700">31</span>
                <span className="text-[10px] text-amber-500 block leading-tight">Đề xuất tính năng &amp; nghiệp vụ mới</span>
              </div>
            </div>

            {/* Sub-banner: Phân rã nghiệp vụ Jira: KVE: 58 • HKD: 29 */}
            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Phân rã nghiệp vụ Jira:</span>
              <span className="font-extrabold text-[#006195] tracking-wide">
                KVE: 58 • HKD: 29
              </span>
            </div>

            {/* Phân bổ tuổi ticket Jira */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Phân bổ tuổi ticket Jira</span>
                <span className="text-rose-600 font-bold text-[11px]">9 ticket &gt; 7 ngày</span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: '55%' }} className="bg-emerald-500" title="0-3 ngày: 31"></div>
                <div style={{ width: '28%' }} className="bg-sky-500" title="4-7 ngày: 16"></div>
                <div style={{ width: '11%' }} className="bg-amber-500" title="8-14 ngày: 6"></div>
                <div style={{ width: '6%' }} className="bg-rose-500" title=">14 ngày: 3"></div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>0-3 ngày: <b>31 ticket</b></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>4-7 ngày: <b>16 ticket</b></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>8-14 ngày: <b>6 ticket</b></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>&gt;14 ngày: <b className="text-rose-600">3 ticket</b></span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom SLA Callout */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
            <span className="text-slate-600">SLA xử lý Dev fix chuẩn: <b>&le; 5 ngày</b></span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
              Cần đôn đốc 9 ticket
            </span>
          </div>
        </div>

        {/* Right: Top vấn đề phát sinh nổi cộm (7 ngày gần nhất) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900">
                    Top vấn đề phát sinh nổi cộm [7 ngày]
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-[11px]">
                    Chỉ Bug &amp; Support
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Chi tiết ticket chuyển R&amp;D và Dev fix kèm thời gian tồn (KVE + HKD)
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200">
                  <button
                    onClick={() => setJiraGroupFilter('all')}
                    className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                      jiraGroupFilter === 'all' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setJiraGroupFilter('kve')}
                    className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                      jiraGroupFilter === 'kve' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    KVE
                  </button>
                  <button
                    onClick={() => setJiraGroupFilter('hkd')}
                    className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                      jiraGroupFilter === 'hkd' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HKD
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  Đồng bộ lúc 14:35
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="pb-2.5 font-bold">VẤN ĐỀ &amp; MÃ JIRA</th>
                    <th className="pb-2.5 font-bold text-center">NHÓM</th>
                    <th className="pb-2.5 font-bold text-center">LOẠI</th>
                    <th className="pb-2.5 font-bold text-center">DỊCH VỤ</th>
                    <th className="pb-2.5 font-bold text-center">NGÀY TẠO</th>
                    <th className="pb-2.5 font-bold text-center">SỐ NGÀY TỒN</th>
                    <th className="pb-2.5 font-bold text-right">TRẠNG THÁI JIRA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-3 max-w-[240px]">
                        <div className="font-bold text-slate-900 text-xs truncate">{item.title}</div>
                        <div className="text-[11px] text-sky-700 font-medium truncate">{item.jiraCode}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.group === 'KVE'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {item.group}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.catColor}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                        {item.service}
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">
                        {item.createDate}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${item.daysColor}`}>
                          {item.daysOpen} ngày
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.statusColor}`}>
                          <span>{item.jiraStatus}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: ĐỀ XUẤT TÍNH NĂNG & NGHIỆP VỤ MỚI (CASE) [THÁNG NÀY] (FULL WIDTH) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                Đề xuất tính năng &amp; Nghiệp vụ mới (Case) [Tháng này]
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                31 Case ghi nhận (KVE: 18 • HKD: 13)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Các kiến nghị bổ sung tính năng KAT nổi bật nhất được khách hàng và đối tác đề xuất
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {/* Filter pills */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200">
              <button
                onClick={() => setCaseGroupFilter('all')}
                className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                  caseGroupFilter === 'all' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setCaseGroupFilter('kve')}
                className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                  caseGroupFilter === 'kve' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                KVE
              </button>
              <button
                onClick={() => setCaseGroupFilter('hkd')}
                className={`px-2.5 py-1 rounded transition-all text-[11px] ${
                  caseGroupFilter === 'hkd' ? 'bg-[#004b74] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HKD
              </button>
            </div>

            <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
              4 Case trọng điểm đang đánh giá
            </span>
          </div>
        </div>

        {/* Feature Case Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="pb-2.5 font-bold">ĐỀ XUẤT TÍNH NĂNG</th>
                <th className="pb-2.5 font-bold text-center">NHÓM</th>
                <th className="pb-2.5 font-bold text-center">PHÂN HỆ / DỊCH VỤ</th>
                <th className="pb-2.5 font-bold text-center">SỐ GIAN HÀNG YÊU CẦU</th>
                <th className="pb-2.5 font-bold text-center">MỨC ĐỘ ƯU TIÊN</th>
                <th className="pb-2.5 font-bold text-right">ĐÁNH GIÁ R&amp;D / PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedCases.map((fc) => (
                <tr key={fc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pr-4 max-w-[340px]">
                    <div className="font-bold text-slate-900 text-xs">{fc.title}</div>
                    <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{fc.sub}</div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        fc.group === 'KVE'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {fc.group}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-slate-700">
                    {fc.service}
                  </td>
                  <td className="py-3 px-2 text-center font-extrabold text-[#006195]">
                    {fc.shopCount}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${fc.priorityColor}`}>
                      {fc.priority}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${fc.evalColor}`}>
                      {fc.evaluation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 6: THỐNG KÊ KHIẾU NẠI [THÁNG NÀY] (FULL WIDTH) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Thống kê khiếu nại [Tháng này]
              </h2>
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-[11px]">
                CSAT &amp; Chất lượng dịch vụ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tiến độ xử lý và nguyên nhân khiếu nại phát sinh dự án KAT
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
            Tổng: 152 khiếu nại
          </span>
        </div>

        {/* Progress bar container */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Phân bổ tiến độ tiếp nhận</span>
            <span className="font-bold text-emerald-600">Đã giải quyết: 86.8%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
            <div style={{ width: '2.6%' }} className="bg-sky-500" title="Mới: 4"></div>
            <div style={{ width: '5.2%' }} className="bg-amber-500" title="Đang xử lý: 8"></div>
            <div style={{ width: '3.9%' }} className="bg-purple-500" title="Chờ KH: 6"></div>
            <div style={{ width: '86.8%' }} className="bg-emerald-500" title="Đã đóng: 132"></div>
            <div style={{ width: '1.5%' }} className="bg-rose-500" title="Quá hạn: 2"></div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>Mới (4)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Đang xử lý (8)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Chờ KH (6)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đã đóng (132)</span>
            </span>
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Quá hạn (2)
            </span>
          </div>
        </div>

        {/* 2 Highlight SLA & CSAT Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: SLA xử lý khiếu nại */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Thời gian xử lý khiếu nại TB
                </div>
                <div className="text-[11px] text-slate-500">
                  Cam kết chất lượng SLA &le; 2.0 ngày
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-emerald-600">1.8 ngày</div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Đạt chuẩn SLA
              </span>
            </div>
          </div>

          {/* Card 2: CSAT */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Chỉ số hài lòng khách hàng (CSAT)
                </div>
                <div className="text-[11px] text-slate-500">
                  Dự án KAT Quý 3/2026
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold text-emerald-600">94.2%</div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Mục tiêu &ge; 90%
              </span>
            </div>
          </div>
        </div>

        {/* Top Lý do khiếu nại hàng đầu (Đã phân rã) */}
        <div className="space-y-3 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            TOP LÝ DO KHIẾU NẠI HÀNG ĐẦU (ĐÃ PHÂN RÃ)
          </div>

          <div className="space-y-3 text-xs">
            {/* Reason 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Chậm phản hồi khi nghẽn mạng Thuế &amp; CKS</span>
                <b className="text-slate-900 font-bold">38% (58 ca)</b>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Xử lý chưa triệt để lỗi USB Token</span>
                <b className="text-slate-900 font-bold">29% (44 ca)</b>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }}></div>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Tư vấn sai / chưa đúng nghiệp vụ hóa đơn, thuế</span>
                <b className="text-slate-900 font-bold">18% (27 ca)</b>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Thái độ phục vụ chưa chuẩn mực</span>
                <b className="text-slate-900 font-bold">12% (18 ca)</b>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 7: HỦY HỢP ĐỒNG KAT NĂM 2026 (CHURN RATE) [NĂM 2026] (FULL WIDTH) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cancel_presentation</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Hủy hợp đồng KAT năm 2026 (Churn Rate) [Năm 2026]
                </h2>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                  Tỷ lệ hủy: 2.3% (186 HĐ)
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs text-slate-500">
            +0.4% so với cùng kỳ 2025
          </span>
        </div>

        {/* 4 Summary Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-xs text-slate-600 block">Chuyển nhà cung cấp khác</span>
            <span className="text-base font-bold text-slate-900 block">34% (63 HĐ)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-xs text-slate-600 block">Ngừng kinh doanh / Giải thể</span>
            <span className="text-base font-bold text-slate-900 block">28% (52 HĐ)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-xs text-slate-600 block">Chi phí gia hạn cao</span>
            <span className="text-base font-bold text-slate-900 block">19% (35 HĐ)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
            <span className="text-xs text-slate-600 block">Chất lượng hỗ trợ chưa kịp thời / Khác</span>
            <span className="text-base font-bold text-slate-900 block">19% (36 HĐ)</span>
          </div>
        </div>
      </div>

      {/* FOOTER LIVE SYNC BAR */}
      <div className="pt-2 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Hệ thống KiotViet Care Hub • KAT Analytics Engine Live Sync</span>
        </div>
        <div>
          Thời gian kết xuất: 24/10/2026 14:35:00 • Mã vận hành: <b>KAT-OP-9014</b>
        </div>
      </div>

      {/* GOOGLE SHEET CONFIGURATION MODAL */}
      {showSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">table_chart</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Cấu hình Google Sheet báo cáo KAT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cập nhật link dữ liệu gốc và thiết lập đồng bộ tự động
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSheetUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Đường dẫn Google Sheet dữ liệu KAT:
                </label>
                <input
                  type="url"
                  required
                  value={katSheetUrl}
                  onChange={(e) => setKatSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Bạn có thể dán link Google Sheet bất cứ lúc nào, hệ thống sẽ tự động ghi nhớ và áp dụng khi thiết lập rule sau.
                </p>
              </div>

              {sheetSaveStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{sheetSaveStatus}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-600">info</span>
                  <span>Trạng thái kết nối:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Thiết kế báo cáo KAT đã được tạo sẵn theo đúng mẫu hiển thị. Khi bạn cập nhật sheet và rule tính toán, dữ liệu sẽ tự động map vào các chỉ số trên dashboard.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Lưu liên kết Google Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
