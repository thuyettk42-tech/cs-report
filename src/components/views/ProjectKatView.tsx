import React, { useState } from 'react';

interface ProjectKatViewProps {
  onOpenExport?: () => void;
}

export const ProjectKatView: React.FC<ProjectKatViewProps> = ({ onOpenExport }) => {
  // State for filters
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'year'>('month');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [agentTab, setAgentTab] = useState<'day' | 'shift'>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

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

  // 30 Days trend data matching screenshot
  const dailyServiceData = [
    { day: '01', hddt: 360, cks: 210, thue: 140, khac: 50 },
    { day: '03', hddt: 410, cks: 230, thue: 155, khac: 60 },
    { day: '05', hddt: 380, cks: 220, thue: 145, khac: 45 },
    { day: '07', hddt: 490, cks: 260, thue: 170, khac: 70 },
    { day: '09', hddt: 520, cks: 280, thue: 180, khac: 65 },
    { day: '11', hddt: 560, cks: 300, thue: 195, khac: 75 },
    { day: '13', hddt: 610, cks: 340, thue: 210, khac: 80 },
    { day: '15', hddt: 590, cks: 310, thue: 200, khac: 70 },
    { day: '17', hddt: 640, cks: 360, thue: 230, khac: 85 },
    { day: '19', hddt: 670, cks: 420, thue: 280, khac: 90 },
    { day: '20', dayHighlight: true, hddt: 710, cks: 440, thue: 310, khac: 95 },
    { day: '22', hddt: 630, cks: 380, thue: 250, khac: 85 },
    { day: '24', hddt: 570, cks: 320, thue: 220, khac: 75 },
    { day: '26', hddt: 540, cks: 290, thue: 190, khac: 70 },
    { day: '28', hddt: 590, cks: 310, thue: 210, khac: 80 },
    { day: 'Hôm nay', isToday: true, hddt: 612, cks: 318, thue: 241, khac: 77 },
  ];

  // Specialists Performance Ranking
  const agentRanking = [
    { rank: 1, name: 'Hoàng Mai Linh', score: 68, delta: '+31% TB', status: 'good' },
    { rank: 2, name: 'Trần Văn Nam', score: 64, delta: '+23% TB', status: 'good' },
    { rank: 3, name: 'Lê Thị Thu Thảo', score: 61, delta: '+17% TB', status: 'good' },
    { rank: 4, name: 'Nguyễn Đức Hưng', score: 58, delta: '+11% TB', status: 'good' },
    { rank: 5, name: 'Vũ Thị Cẩm Tú', score: 55, delta: '+5% TB', status: 'good' },
    { rank: 6, name: 'Đặng Quốc Anh', score: 53, delta: '+2% TB', status: 'good' },
    { rank: 7, name: 'Phạm Minh Khoa', score: 50, delta: 'Đạt KPI', status: 'kpi' },
    { rank: 8, name: 'Bùi Hải Đăng', score: 48, delta: 'Đạt KPI', status: 'kpi' },
    { rank: 9, name: 'Nguyễn Hồng Ngọc', score: 44, delta: '-1 ca', status: 'warning' },
    { rank: 10, name: 'Đỗ Thanh Vân', score: 39, delta: '-6 ca (Cần kèm)', status: 'danger' },
  ];

  // Top Issues Table
  const topIssues = [
    {
      id: 1,
      title: 'Không nhận USB Token khi ký số',
      desc: 'Trình điều khiển PKI Token xung đột Windows 11',
      category: 'Bug',
      catColor: 'bg-rose-100 text-rose-700 border-rose-200',
      service: 'CKS',
      count7d: 146,
      trendType: 'up-red',
      status: 'Đang vá hotfix',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 2,
      title: 'Hóa đơn bị CQT từ chối cấp mã',
      desc: 'Lỗi mã định danh MST người mua / sai quy cách',
      category: 'Case',
      catColor: 'bg-amber-100 text-amber-700 border-amber-200',
      service: 'HĐĐT',
      count7d: 128,
      trendType: 'flat-grey',
      status: 'Đã phối hợp Thuế',
      statusColor: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      id: 3,
      title: 'Lỗi kết nối cổng Thuế điện tử khi nộp tờ khai',
      desc: 'Timeout API hệ thống TCT thời điểm cao điểm',
      category: 'Bug',
      catColor: 'bg-rose-100 text-rose-700 border-rose-200',
      service: 'Thuế',
      count7d: 97,
      trendType: 'down-green',
      status: 'Đang khắc phục',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 4,
      title: 'Hướng dẫn gia hạn chứng thư số',
      desc: 'Quy trình cấp bù thời hạn chữ ký số còn hạn',
      category: 'Support',
      catColor: 'bg-sky-100 text-sky-700 border-sky-200',
      service: 'CKS',
      count7d: 92,
      trendType: 'up-orange',
      status: 'Đã có tài liệu HD',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 5,
      title: 'Điều chỉnh / thay thế hóa đơn sai thông tin',
      desc: 'Lập biên bản điều chỉnh theo Nghị định 123',
      category: 'Support',
      catColor: 'bg-sky-100 text-sky-700 border-sky-200',
      service: 'HĐĐT',
      count7d: 85,
      trendType: 'flat-grey',
      status: 'Đang hướng dẫn',
      statusColor: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      id: 6,
      title: 'Sai lệch tổng tiền khi xuất HĐ từ đơn bán lẻ',
      desc: 'Làm tròn số thập phân chiết khấu dòng sản phẩm',
      category: 'Bug',
      catColor: 'bg-rose-100 text-rose-700 border-rose-200',
      service: 'HĐĐT',
      count7d: 41,
      trendType: 'down-green',
      status: 'Đã xử lý bản 3.8.2',
      statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      hasCheck: true,
    },
  ];

  // Churn data (T1 to T10)
  const churnMonthly = [
    { month: 'T1', count2026: 14, count2025: 12 },
    { month: 'T2', count2026: 19, count2025: 15 },
    { month: 'T3', count2026: 21, count2025: 18 },
    { month: 'T4', count2026: 16, count2025: 14 },
    { month: 'T5', count2026: 17, count2025: 16 },
    { month: 'T6', count2026: 22, count2025: 19 },
    { month: 'T7', count2026: 18, count2025: 17 },
    { month: 'T8', count2026: 20, count2025: 18 },
    { month: 'T9', count2026: 24, count2025: 20 },
    { month: 'T10', count2026: 15, count2025: 13 },
  ];

  return (
    <div className="flex flex-col w-full space-y-5 animate-fadeIn">
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
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Line chuyên biệt
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-medium">Kỳ chốt thuế Q1/2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Báo cáo vận hành dự án KAT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-4xl leading-relaxed">
            Theo dõi lượng phục vụ Hóa đơn điện tử, Chữ ký số, Thuế, năng suất nhân sự, sự vụ, khiếu nại và hủy hợp đồng
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

          {/* Google Sheet Link / Config Button */}
          <button
            onClick={() => setShowSheetModal(true)}
            className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Cấu hình Google Sheet liên kết nguồn dữ liệu KAT"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
            <span className="hidden md:inline">Google Sheet KAT</span>
          </button>
        </div>
      </div>

      {/* TOP 5 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Tổng phục vụ hôm nay */}
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              TỔNG PHỤC VỤ HÔM NAY
            </span>
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                1,248
              </span>
              <span className="text-xs font-semibold text-slate-500">ca</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <span className="text-[10px]">▲</span> +6.1%
            </span>
            <span>Đạt 108% định mức ngày</span>
          </div>
        </div>

        {/* Card 2: Năng suất TB / Nhân sự */}
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              NĂNG SUẤT TB / NHÂN SỰ
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                52
              </span>
              <span className="text-xs font-semibold text-slate-500">ca/ngày</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Mục tiêu: ≥ 45</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Vượt chuẩn 115%
            </span>
          </div>
        </div>

        {/* Card 3: Sự vụ đang mở */}
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              SỰ VỤ ĐANG MỞ
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                87
              </span>
              <span className="text-xs font-semibold text-slate-500">vụ đang giải quyết</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-rose-600 font-bold">Bug: 12</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600 font-bold">Case: 31</span>
            <span className="text-slate-300">•</span>
            <span className="text-sky-600 font-bold">Guide: 44</span>
          </div>
        </div>

        {/* Card 4: Khiếu nại đang xử lý */}
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              KHIẾU NẠI ĐANG XỬ LÝ
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-amber-600">
                14
              </span>
              <span className="text-xs font-semibold text-slate-500">ca phát sinh</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>SLA chuẩn: 92%</span>
            <span className="text-slate-300">•</span>
            <span className="text-rose-600 font-bold">• 2 quá hạn</span>
          </div>
        </div>

        {/* Card 5: Hủy hợp đồng 2026 */}
        <div className="bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              HỦY HỢP ĐỒNG 2026
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cancel_presentation</span>
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-rose-600">
                186
              </span>
              <span className="text-xs font-semibold text-slate-500">HĐ hủy</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Tỷ lệ hủy: 2.3%</span>
            <span className="text-rose-600 font-bold">+0.4% so 2025</span>
          </div>
        </div>
      </div>

      {/* ROW 1: SẢN LƯỢNG PHỤC VỤ (65%) & TỶ TRỌNG LOẠI DỊCH VỤ (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Stacked Bar Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sản lượng phục vụ theo phân loại dịch vụ (30 ngày gần nhất)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Số lượng ca hỗ trợ kỹ thuật và vận hành theo ngày trong tháng
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#004b74]"></span>
                  <span>HĐĐT</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0090DA]"></span>
                  <span>CKS</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                  <span>Thuế điện tử</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#94a3b8]"></span>
                  <span>Khác</span>
                </span>
              </div>
            </div>

            {/* Stacked Bars Graphic */}
            <div className="pt-4 pb-2">
              <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 px-1 border-b border-slate-200">
                {dailyServiceData.map((d, i) => {
                  const total = d.hddt + d.cks + d.thue + d.khac;
                  // Max total ~1500 -> normalize height in percentage
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
                          <span>Thuế:</span> <b>{d.thue}</b>
                        </div>
                        <div className="flex justify-between gap-3 text-slate-300">
                          <span>Khác:</span> <b>{d.khac}</b>
                        </div>
                      </div>

                      {/* Peak Pin for Day 20 or Today */}
                      {d.isToday && (
                        <div className="mb-1 text-slate-700 text-[10px] font-bold flex flex-col items-center">
                          <span>●</span>
                        </div>
                      )}

                      {/* The Stacked Bar */}
                      <div className="w-full max-w-[20px] rounded-t flex flex-col overflow-hidden shadow-2xs hover:brightness-110 transition-all cursor-pointer">
                        <div style={{ height: `${hKhac}%` }} className="w-full bg-[#94a3b8]"></div>
                        <div style={{ height: `${hThue}%` }} className="w-full bg-[#10b981]"></div>
                        <div style={{ height: `${hCks}%` }} className="w-full bg-[#0090DA]"></div>
                        <div style={{ height: `${hHddt}%` }} className="w-full bg-[#004b74]"></div>
                      </div>

                      {/* X Axis Label */}
                      <span className={`mt-2 text-[10px] tracking-tight truncate ${d.isToday ? 'font-bold text-sky-700' : 'text-slate-400'}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footnote callout */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
            <span className="material-symbols-outlined text-[18px] text-sky-600 shrink-0 mt-0.5">
              info
            </span>
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-800">Ghi chú:</span> Lượng yêu cầu Chữ ký số và Thuế tăng vọt 34% vào các mốc ngày 18 - 22 do thời hạn nộp tờ khai quý. Trung bình tháng: 1,180 ca/ngày
            </div>
          </div>
        </div>

        {/* Right: Tỷ trọng hôm nay theo loại dịch vụ */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tỷ trọng hôm nay theo loại dịch vụ
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
                    <span className="text-slate-400 text-[11px]">(26%)</span>
                    <span className="text-emerald-600 font-bold text-[11px]">+11%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#0090DA] rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>

              {/* Item 3: Thue */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <span>Thuế điện tử</span>
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
                    <span>Khác (Tài khoản, API kết nối)</span>
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
          <div className="mt-5 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/90 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-sky-700 shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="text-xs space-y-1">
              <span className="font-bold text-sky-950 block">Nhận định vận hành KAT:</span>
              <p className="text-sky-900 leading-relaxed">
                Đội ngũ HĐĐT giữ tải ổn định. Kênh Chữ ký số USB Token đang có dấu hiệu tăng do lỗi chứng thư mới gia hạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: NĂNG SUẤT NHÂN SỰ KAT (FULL WIDTH) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Năng suất nhân sự KAT
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                24 chuyên viên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Xếp hạng năng lực xử lý ticket và cuộc gọi của đội ngũ CSKH dự án KAT
            </p>
          </div>

          {/* KPI metrics & Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200">
              AHT: <b>7m 40s</b> (-25s)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              FCR: <b>81.5%</b> (≥80%)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              TB ca/giờ: <b>6.5 ca/h</b>
            </span>

            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
              <button
                onClick={() => setAgentTab('day')}
                className={`px-3 py-1 rounded-md transition-all ${
                  agentTab === 'day' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Theo ngày
              </button>
              <button
                onClick={() => setAgentTab('shift')}
                className={`px-3 py-1 rounded-md transition-all ${
                  agentTab === 'shift' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                Theo ca làm
              </button>
            </div>
          </div>
        </div>

        {/* Target Benchmark Indicators Header */}
        <div className="flex items-center justify-end gap-6 text-xs px-2 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-[#0090DA]"></span>
            <span className="text-[11px] font-bold text-sky-700">Mức TB toàn team: 52 ca</span>
            <span className="px-1 rounded bg-[#0090DA] text-white font-bold text-[10px]">TB:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-amber-500"></span>
            <span className="text-[11px] font-semibold text-amber-700">Chỉ tiêu tối thiểu: 45 ca</span>
          </div>
        </div>

        {/* 10 Specialists Ranking List */}
        <div className="space-y-3 pt-1">
          {agentRanking.map((agent) => {
            // max scale 80 ca
            const barWidth = Math.min(100, (agent.score / 80) * 100);
            const isDanger = agent.status === 'danger';
            const isWarning = agent.status === 'warning';

            return (
              <div key={agent.rank} className="flex items-center gap-3 text-xs">
                {/* Agent Name */}
                <div className="w-36 sm:w-44 truncate flex items-center gap-2 font-medium text-slate-800 shrink-0">
                  <span className="text-slate-400 font-bold text-[11px]">#{agent.rank}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  <span className="truncate">{agent.name}</span>
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
                        : 'bg-[#004b74]'
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
                        ? 'text-amber-600'
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

      {/* ROW 3: PHÂN LOẠI SỰ VỤ KAT (35%) & TOP VẤN ĐỀ NỔI CỘM (65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Donut Chart Sự Vụ */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Phân loại sự vụ KAT
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cơ cấu 87 sự vụ phát sinh đang theo dõi xử lý
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                Theo tính chất
              </span>
            </div>

            {/* Custom SVG Donut */}
            <div className="flex items-center justify-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {/* Segment 1: Bug (12 vụ = 28% of 87) -> stroke-dasharray ~ 70.3 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="14"
                    strokeDasharray="70.3 251.2"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Case (31 vụ = 35%) -> stroke-dasharray ~ 87.9 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="14"
                    strokeDasharray="87.9 251.2"
                    strokeDashoffset="-70.3"
                  />
                  {/* Segment 3: Support (44 vụ = 37%) -> stroke-dasharray ~ 93 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0090DA"
                    strokeWidth="14"
                    strokeDasharray="93 251.2"
                    strokeDashoffset="-158.2"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    87
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    SỰ VỤ MỞ
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-700">Lỗi hệ thống (Bug)</span>
                </div>
                <div>
                  <b className="text-rose-600">12 vụ</b> <span className="text-slate-400">(28%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700">Sự vụ nghiệp vụ (Case)</span>
                </div>
                <div>
                  <b className="text-amber-600">31 vụ</b> <span className="text-slate-400">(35%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0090DA]"></span>
                  <span className="text-slate-700">Hướng dẫn sử dụng (Support)</span>
                </div>
                <div>
                  <b className="text-sky-600">44 vụ</b> <span className="text-slate-400">(37%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Tỷ lệ Bug/Tổng ca: <b className="text-slate-800">1.4%</b> (Chuẩn an toàn &lt; 2%)
          </div>
        </div>

        {/* Right: Top vấn đề phát sinh nổi cộm (Table) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Top vấn đề phát sinh nổi cộm (7 ngày gần nhất)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi tần suất phát sinh sự vụ kỹ thuật để điều phối R&amp;D và Dev fix
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Đồng bộ lúc 14:35
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="pb-2.5 font-bold">VẤN ĐỀ &amp; MÔ TẢ</th>
                    <th className="pb-2.5 font-bold">PHÂN LOẠI</th>
                    <th className="pb-2.5 font-bold">DỊCH VỤ</th>
                    <th className="pb-2.5 font-bold text-center">LƯỢT 7N</th>
                    <th className="pb-2.5 font-bold text-center">XU HƯỚNG</th>
                    <th className="pb-2.5 font-bold text-right">TRẠNG THÁI &amp; XỬ LÝ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-3 max-w-[280px]">
                        <div className="font-bold text-slate-900 text-xs truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.catColor}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 font-semibold text-slate-700">
                        {item.service}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900">
                        {item.count7d}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {/* Mini Sparkline SVG */}
                        <div className="w-14 h-4 mx-auto flex items-center justify-center">
                          {item.trendType === 'up-red' && (
                            <svg className="w-full h-full text-rose-500" viewBox="0 0 50 16">
                              <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,14 15,11 30,8 48,2" />
                            </svg>
                          )}
                          {item.trendType === 'flat-grey' && (
                            <svg className="w-full h-full text-slate-400" viewBox="0 0 50 16">
                              <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,8 15,7 30,9 48,8" />
                            </svg>
                          )}
                          {item.trendType === 'down-green' && (
                            <svg className="w-full h-full text-emerald-500" viewBox="0 0 50 16">
                              <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,3 15,5 30,11 48,14" />
                            </svg>
                          )}
                          {item.trendType === 'up-orange' && (
                            <svg className="w-full h-full text-amber-500" viewBox="0 0 50 16">
                              <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,13 15,10 30,7 48,3" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.statusColor}`}>
                          {item.hasCheck && <span>✓</span>}
                          <span>{item.status}</span>
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

      {/* ROW 4: THỐNG KÊ KHIẾU NẠI (50%) & HỦY HỢP ĐỒNG 2026 (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Thống kê khiếu nại */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Thống kê tình trạng khiếu nại (Complaints &amp; CSAT)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tiến độ và nguyên nhân khiếu nại phát sinh trong tháng
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 font-bold text-xs border border-sky-100">
                Tổng: 152 khiếu nại
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Phân bổ tiến độ tiếp nhận</span>
                <span className="font-bold text-emerald-600">Đã giải quyết: 86.8%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: '2.6%' }} className="bg-sky-500" title="Mới: 4"></div>
                <div style={{ width: '5.2%' }} className="bg-amber-500" title="Đang xử lý: 8"></div>
                <div style={{ width: '3.9%' }} className="bg-purple-500" title="Chờ KH: 6"></div>
                <div style={{ width: '88.3%' }} className="bg-emerald-500" title="Đã đóng: 132"></div>
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
                <span className="text-rose-600 font-bold">• Quá hạn (2)</span>
              </div>
            </div>

            {/* SLA Indicator Card */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Thời gian xử lý khiếu nại TB
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Cam kết chất lượng SLA ≤ 2.0 ngày
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-slate-900">1.8 ngày</div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Đạt chuẩn SLA
                </span>
              </div>
            </div>

            {/* Top Lý do khiếu nại */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOP LÝ DO KHIẾU NẠI HÀNG ĐẦU
              </div>
              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Chậm phản hồi khi nghẽn mạng Thuế</span>
                    <b className="text-slate-900">38%</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Xử lý chưa triệt để lỗi USB Token</span>
                    <b className="text-slate-900">29%</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '29%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Thái độ hỗ trợ chưa rõ ràng nghiệp vụ hóa đơn</span>
                    <b className="text-slate-900">18%</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Lỗi sản phẩm lặp lại sau cập nhật</span>
                    <b className="text-slate-900">15%</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hủy hợp đồng 2026 (Churn Rate) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Hủy hợp đồng 2026 (Churn Rate)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diễn biến theo tháng và cơ cấu nguyên nhân rời bỏ dịch vụ
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100">
                Tỷ lệ hủy: 2.3%
              </span>
            </div>

            {/* Monthly Churn Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Số HĐ hủy theo tháng (T1 đến T10/2026)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span>
                    <span>2026 (186 HĐ)</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-3 border-t-2 border-slate-300"></span>
                    <span>2025 (Cùng kỳ)</span>
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-32 pt-2 flex items-end justify-between gap-1 sm:gap-2 px-1 border-b border-slate-200">
                {churnMonthly.map((m, idx) => {
                  const maxH = 26;
                  const h2026 = (m.count2026 / maxH) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1 z-20 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap">
                        {m.month}: {m.count2026} HĐ
                      </div>

                      <span className="text-[10px] font-bold text-slate-700 mb-1">
                        {m.count2026}
                      </span>
                      <div
                        style={{ height: `${h2026}%` }}
                        className="w-full max-w-[18px] bg-rose-500/80 hover:bg-rose-600 rounded-t transition-all"
                      ></div>
                      <span className="text-[10px] text-slate-400 mt-1.5">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Lý do hủy hợp đồng */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOP LÝ DO KHÁCH HÀNG HỦY DỊCH VỤ
              </div>
              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Chuyển sang nhà cung cấp khác</span>
                    <b className="text-slate-900">34% (63 HĐ)</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Ngừng kinh doanh / Giải thể cửa hàng</span>
                    <b className="text-slate-900">28% (52 HĐ)</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Chi phí gia hạn / Giá gói dịch vụ cao</span>
                    <b className="text-slate-900">19% (35 HĐ)</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '19%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Chất lượng hỗ trợ kỹ thuật chưa kịp thời</span>
                    <b className="text-slate-900">12% (22 HĐ)</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Lý do khác</span>
                    <b className="text-slate-900">7% (14 HĐ)</b>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER LIVE SYNC BAR */}
      <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200">
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
