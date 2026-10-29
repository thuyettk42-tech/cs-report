import React, { useState } from 'react';

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

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold uppercase tracking-wider text-[11px]">
              PHÂN HỆ KAT
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Line chuyên biệt
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">Kỳ chốt thuế Q3/2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo cáo vận hành dự án KAT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-4xl leading-relaxed">
            Theo dõi lưu lượng phục vụ Hóa đơn điện tử, Chữ ký số, Thuế - Kế toán; năng suất nhân sự, sự vụ, khiếu nại và hủy hợp đồng
          </p>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {/* Time Filter Pills */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === 'today' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === '7days' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === 'month' ? 'bg-[#006195] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeFilter === 'year' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Năm 2026
            </button>
          </div>

          {/* Service Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="appearance-none h-9 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
            >
              <option value="all">Tất cả loại dịch vụ (KAT)</option>
              <option value="hddt">Hóa đơn điện tử (HĐĐT)</option>
              <option value="cks">Chữ ký số (CKS)</option>
              <option value="thue">Thuế điện tử</option>
              <option value="khac">Khác (Tài khoản, API)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Export Button */}
          <button
            onClick={() => onOpenExport?.()}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">upload</span>
            <span>Xuất báo cáo</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-primary transition-all shadow-xs cursor-pointer shrink-0"
            title="Đồng bộ dữ liệu"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin text-primary' : ''}`}>
              refresh
            </span>
          </button>

          {/* Google Sheet Config Button */}
          <button
            onClick={() => setShowSheetModal(true)}
            className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Cấu hình Google Sheet liên kết nguồn dữ liệu KAT"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
            <span className="hidden md:inline">Google Sheet</span>
          </button>
        </div>
      </div>

      {/* TOP 6 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Tổng yêu cầu hôm nay */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TỔNG YÊU CẦU [HÔM NAY]
            </span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">headset</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                1,248
              </span>
              <span className="text-xs font-semibold text-slate-500">ca</span>
            </div>
          </div>
          <div className="space-y-0.5 text-[11px]">
            <div className="text-slate-400 truncate">Call: 540 | Chat: 412 | ...</div>
            <div className="text-emerald-600 font-bold flex items-center gap-0.5">
              <span className="text-[9px]">▲</span> +6.1% so với hôm qua
            </div>
          </div>
        </div>

        {/* Card 2: Tỷ lệ gọi nhỡ hôm nay */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TỶ LỆ GỌI NHỠ [HÔM NAY]
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">phone_missed</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                3.8%
              </span>
              <span className="text-[11px] text-slate-400 font-normal">21/540 cuộc</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
            <span className="text-slate-500">Mục tiêu &lt; 5.0%</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Đạt chuẩn
            </span>
          </div>
        </div>

        {/* Card 3: Phản hồi chat TB */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              PHẢN HỒI CHAT TB [HÔM NAY]
            </span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">chat</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                42s
              </span>
              <span className="text-xs font-semibold text-slate-500">TB</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
            <span className="text-slate-500 truncate">First response: 28s</span>
            <span className="text-emerald-600 font-bold shrink-0">Mục tiêu &lt; 60s</span>
          </div>
        </div>

        {/* Card 4: Ticket đúng SLA (4H) */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                TICKET ĐÚNG SLA (4H)
              </span>
              <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                96.5%
              </span>
              <span className="text-[11px] text-slate-400 font-normal">286/296</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
            <span className="text-slate-500">Chuẩn SLA: 95%</span>
            <span className="text-rose-600 font-bold">10 ticket quá hạn</span>
          </div>
        </div>

        {/* Card 5: Khiếu nại đang xử lý */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              KHIẾU NẠI ĐANG XỬ LÝ
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
                14
              </span>
              <span className="text-xs font-semibold text-slate-500">ca phát sinh</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
            <span className="text-slate-500">Đang điều tra</span>
            <span className="text-rose-600 font-bold">• 2 quá hạn</span>
          </div>
        </div>

        {/* Card 6: Ticket Jira mở (Bug+Sup) */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TICKET JIRA MỞ (BUG+SUP)
            </span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </div>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#006195] tracking-tight">
                56
              </span>
              <span className="text-xs font-semibold text-slate-500">ticket</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-50">
            <span className="text-slate-500 truncate">Bug: 24 | Support: 32</span>
            <span className="text-rose-600 font-bold shrink-0">9 ticket &gt; 7N</span>
          </div>
        </div>
      </div>

      {/* ROW 2: SẢN LƯỢNG PHỤC VỤ (8 COLS) & TỶ TRỌNG HÔM NAY (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 30-day Volume Trend + Hourly heat bar */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  Sản lượng phục vụ KAT [30 ngày]
                </h2>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-[11px]">
                  Xu hướng tháng
                </span>
              </div>

              {/* Toggles & Legend */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
                  <button
                    onClick={() => setVolumeView('service')}
                    className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                      volumeView === 'service' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Theo dịch vụ
                  </button>
                  <button
                    onClick={() => setVolumeView('channel')}
                    className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                      volumeView === 'channel' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Theo kênh (Call, Chat, Ticket)
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#004b74]"></span>
                    <span>HĐĐT</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#0090DA]"></span>
                    <span>CKS</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                    <span>Thuế - KT</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#94a3b8]"></span>
                    <span>Khác</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 -mt-2 mb-3">
              Số lượng ca hỗ trợ kỹ thuật và vận hành theo ngày trong tháng
            </p>

            {/* Stacked Bars Graphic with Y-axis */}
            <div className="pt-2 pb-2">
              <div className="flex">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between text-[10px] text-slate-400 pr-2 pb-6 text-right w-10 shrink-0">
                  <span>1,500</span>
                  <span>1,000</span>
                  <span>500</span>
                  <span>250</span>
                  <span>0</span>
                </div>

                {/* Bars Container */}
                <div className="flex-1 h-52 flex items-end justify-between gap-1 sm:gap-2 px-1 border-b border-l border-slate-200">
                  {dailyServiceData.map((d, i) => {
                    const total = d.hddt + d.cks + d.thue + d.khac;
                    const maxVal = 1500;
                    const hHddt = (d.hddt / maxVal) * 100;
                    const hCks = (d.cks / maxVal) * 100;
                    const hThue = (d.thue / maxVal) * 100;
                    const hKhac = (d.khac / maxVal) * 100;

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-2 z-20 bg-slate-900 text-white text-[11px] rounded-lg p-2 shadow-xl whitespace-nowrap text-left space-y-0.5">
                          <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                            Ngày {d.day} • Tổng: {total.toLocaleString()} ca
                          </div>
                          <div className="flex justify-between gap-3 text-[#38bdf8]">
                            <span>HĐĐT:</span> <b>{d.hddt}</b>
                          </div>
                          <div className="flex justify-between gap-3 text-[#60a5fa]">
                            <span>CKS:</span> <b>{d.cks}</b>
                          </div>
                          <div className="flex justify-between gap-3 text-[#4ade80]">
                            <span>Thuế - KT:</span> <b>{d.thue}</b>
                          </div>
                          <div className="flex justify-between gap-3 text-slate-300">
                            <span>Khác:</span> <b>{d.khac}</b>
                          </div>
                        </div>

                        {/* Top Indicator Pin for Today */}
                        {d.isToday && (
                          <div className="mb-1 text-emerald-600 text-[10px] font-bold flex flex-col items-center">
                            <span>●</span>
                          </div>
                        )}

                        {/* The Stacked Bar */}
                        <div className="w-full max-w-[18px] rounded-t flex flex-col overflow-hidden shadow-2xs hover:brightness-110 transition-all cursor-pointer">
                          <div style={{ height: `${hKhac}%` }} className="w-full bg-[#94a3b8]"></div>
                          <div style={{ height: `${hThue}%` }} className="w-full bg-[#10b981]"></div>
                          <div style={{ height: `${hCks}%` }} className="w-full bg-[#0090DA]"></div>
                          <div style={{ height: `${hHddt}%` }} className="w-full bg-[#004b74]"></div>
                        </div>

                        {/* X Axis Label */}
                        {d.dayHighlight ? (
                          <span className="mt-2 text-[10px] tracking-tight px-1 py-0.5 rounded bg-[#004b74] text-white font-bold">
                            {d.day}
                          </span>
                        ) : d.dayBold ? (
                          <span className="mt-2 text-[10px] tracking-tight font-bold text-slate-800 truncate">
                            {d.day}
                          </span>
                        ) : (
                          <span className={`mt-2 text-[10px] tracking-tight truncate ${d.isToday ? 'font-bold text-[#006195]' : 'text-slate-400'}`}>
                            {d.day}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hourly volume heat panel */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-sky-600">schedule</span>
                  Lưu lượng theo giờ hôm nay [8h - 18h]
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Đỉnh điểm: <b className="text-slate-800">14h - 16h (185 ca/h)</b>
                </span>
              </div>

              {/* 11 Hourly Bars */}
              <div className="h-10 flex items-end justify-between gap-1 pt-1 px-1">
                {hourlyData.map((h, idx) => {
                  const maxH = 185;
                  const barH = (h.count / maxH) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1 z-20 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap">
                        {h.hour}: {h.count} ca
                      </div>

                      <div
                        style={{ height: `${barH}%` }}
                        className={`w-full max-w-[28px] rounded-t transition-all ${
                          h.intensity === 'super-peak'
                            ? 'bg-[#0090DA]'
                            : h.intensity === 'peak'
                            ? 'bg-[#0284c7]'
                            : h.intensity === 'medium'
                            ? 'bg-sky-400/80'
                            : h.intensity === 'medium-low'
                            ? 'bg-sky-300/70'
                            : 'bg-slate-300'
                        }`}
                      ></div>
                      <span className={`text-[9px] mt-1 ${h.isPeak ? 'font-bold text-sky-800' : 'text-slate-400'}`}>
                        {h.hour}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footnote callout */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2 text-xs text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-sky-600 shrink-0 mt-0.5">
              location_on
            </span>
            <div className="leading-relaxed text-[11px]">
              <span className="font-semibold text-slate-800">Ghi chú:</span> Lượng yêu cầu Chữ ký số và Thuế - Kế toán tăng quanh ngày 18 - 22 do hạn nộp tờ khai (ngày 20). Trung bình tháng: 1,180 ca/ngày
            </div>
          </div>
        </div>

        {/* Right: Tỷ trọng hôm nay [Hôm nay] */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tỷ trọng hôm nay [Hôm nay]
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân rã sản lượng xử lý trong 24 giờ qua
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 font-extrabold text-xs border border-sky-100">
                1,248 ca
              </span>
            </div>

            {/* List breakdown */}
            <div className="space-y-4 pt-1">
              {/* Item 1: HDDT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004b74]"></span>
                    <span>Hóa đơn điện tử (HĐĐT)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">612</span>
                    <span className="text-slate-400 text-[11px]">(49%)</span>
                    <span className="text-emerald-600 font-bold text-[11px]">+5%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#004b74] rounded-full" style={{ width: '49%' }}></div>
                </div>
              </div>

              {/* Item 2: CKS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0090DA]"></span>
                    <span>Chữ ký số (CKS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">318</span>
                    <span className="text-slate-400 text-[11px]">(25%)</span>
                    <span className="text-emerald-600 font-bold text-[11px]">+11%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#0090DA] rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              {/* Item 3: Thue */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <span>Thuế - Kế toán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">241</span>
                    <span className="text-slate-400 text-[11px]">(19%)</span>
                    <span className="text-rose-600 font-bold text-[11px]">-3%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full" style={{ width: '19%' }}></div>
                </div>
              </div>

              {/* Item 4: Khac */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]"></span>
                    <span>Khác (TK, Gateway, Onboarding)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">77</span>
                    <span className="text-slate-400 text-[11px]">(7%)</span>
                    <span className="text-slate-500 font-medium text-[11px]">0%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#94a3b8] rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Review Callout */}
          <div className="mt-4 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/90 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-sky-700 shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="text-xs space-y-1">
              <span className="font-bold text-sky-950 block">Nhận định vận hành KAT:</span>
              <p className="text-sky-900 leading-relaxed text-[11px]">
                Đội ngũ HĐĐT giữ tải ổn định. Kênh Chữ ký số USB Token đang có dấu hiệu tăng do lỗi chứng thư mới gia hạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: NĂNG SUẤT NHÂN SỰ KAT [HÔM NAY] (FULL WIDTH) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Năng suất nhân sự KAT [Hôm nay]
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                24 chuyên viên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xếp hạng năng lực xử lý ticket và cuộc gọi của đội ngũ CSKH dự án KAT
            </p>
          </div>

          {/* Filters & Toggles */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Team filter pills */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
              <button
                onClick={() => setAgentTeamFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  agentTeamFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tất cả (24)
              </button>
              <button
                onClick={() => setAgentTeamFilter('inhouse')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  agentTeamFilter === 'inhouse' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Inhouse (16)
              </button>
              <button
                onClick={() => setAgentTeamFilter('outsource')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  agentTeamFilter === 'outsource' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Outsource (8)
              </button>
            </div>

            {/* Time toggle pills */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
              <button
                onClick={() => setAgentTimeTab('day')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  agentTimeTab === 'day' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Theo ngày
              </button>
              <button
                onClick={() => setAgentTimeTab('shift')}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                  agentTimeTab === 'shift' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Theo ca làm
              </button>
            </div>
          </div>
        </div>

        {/* 3 Summary Stat Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Box 1: Inhouse */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              <span className="font-semibold text-slate-700">Inhouse (16 nhân sự)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Năng suất TB: <b className="text-slate-900">54.5 ca</b></span>
              <span className="px-2 py-0.5 rounded bg-sky-100/70 text-sky-800 font-semibold text-[11px]">
                AHT TB: <b>7m 15s</b>
              </span>
            </div>
          </div>

          {/* Box 2: Outsource */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-slate-700">Outsource (8 nhân sự)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Năng suất TB: <b className="text-slate-900">47.0 ca</b></span>
              <span className="px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 font-semibold text-[11px]">
                AHT TB: <b>8m 30s</b>
              </span>
            </div>
          </div>

          {/* Box 3: Total Team */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="font-semibold text-slate-700">Toàn Team (24 nhân sự)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Năng suất TB: <b className="text-slate-900">52.0 ca</b></span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-semibold text-[11px]">
                AHT Tổng: <b>7m 40s</b>
              </span>
            </div>
          </div>
        </div>

        {/* Target Benchmark Indicators Header */}
        <div className="flex items-center justify-end gap-6 text-xs px-2 text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-[#0090DA]"></span>
            <span className="text-[11px] font-bold text-sky-700">Mức TB toàn team: 52 ca</span>
            <span className="px-1 rounded bg-[#0090DA] text-white font-bold text-[10px]">TB:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-amber-500"></span>
            <span className="text-[11px] font-semibold text-amber-700">Chỉ tiêu tối thiểu: 45 ca</span>
            <span className="px-1 rounded bg-amber-500 text-white font-bold text-[10px]">Target:</span>
          </div>
        </div>

        {/* 10 Specialists Ranking List */}
        <div className="space-y-2.5 pt-1">
          {displayedAgents.map((agent) => {
            const barWidth = Math.min(100, (agent.score / 80) * 100);
            const isDanger = agent.status === 'danger';
            const isWarning = agent.status === 'warning';

            return (
              <div key={agent.rank} className="flex items-center gap-3 text-xs">
                {/* Agent Name + Inhouse/Outsource tag */}
                <div className="w-48 sm:w-56 truncate flex items-center gap-2 font-medium text-slate-800 shrink-0">
                  <span className="text-slate-400 font-bold text-[11px]">#{agent.rank}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span className="truncate">{agent.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                      agent.team === 'inhouse'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {agent.team === 'inhouse' ? 'Inhouse' : 'Outsource'}
                  </span>
                </div>

                {/* AHT indicator */}
                <div className="w-16 text-[11px] text-slate-500 shrink-0">
                  AHT: <span className="font-semibold">{agent.aht}</span>
                </div>

                {/* Progress bar container with target vertical guidelines */}
                <div className="flex-1 relative h-6 bg-slate-50 rounded-lg overflow-hidden flex items-center">
                  {/* Guideline 45 ca (~56.25%) */}
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-400/80 z-10"
                    style={{ left: '56.25%' }}
                  ></div>

                  {/* Guideline 52 ca (~65%) */}
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-[#0090DA]/90 z-10"
                    style={{ left: '65%' }}
                  ></div>

                  {/* The actual progress bar */}
                  <div
                    className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[11px] font-bold text-white shadow-2xs ${
                      isDanger
                        ? 'bg-rose-600'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-[#0284c7]'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  >
                    <span>{agent.score}</span>
                  </div>
                </div>

                {/* Delta Badge */}
                <div className="w-24 sm:w-28 text-right shrink-0">
                  <span
                    className={`text-[11px] font-bold ${
                      isDanger
                        ? 'text-rose-600'
                        : isWarning
                        ? 'text-rose-600'
                        : agent.status === 'kpi'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {agent.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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
