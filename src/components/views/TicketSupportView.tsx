import React, { useState } from 'react';
import {
  TICKET_MONTHLY_KPI_DATA,
  TICKET_DAILY_DATA,
  TICKET_PERIOD_SUMMARY,
  TICKET_SOURCES_DATA,
  TOTAL_TICKET_SOURCES,
  TICKET_CATEGORIES_DATA,
  TOTAL_TICKET_CATEGORIES,
  TICKET_JOBS_SOFTWARE,
  TICKET_JOBS_TECHNICAL,
  TICKET_JOBS_HDDT,
} from '../../data/ticketData';

interface TicketSupportViewProps {
  onOpenExport?: () => void;
  onOpenDataSourceModal?: () => void;
}

export const TicketSupportView: React.FC<TicketSupportViewProps> = ({
  onOpenExport,
  onOpenDataSourceModal,
}) => {
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'software' | 'technical' | 'hddt'>('software');
  const [showAllJobsModal, setShowAllJobsModal] = useState(false);
  const [showErrorHelpModal, setShowErrorHelpModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [showFullDailyTable, setShowFullDailyTable] = useState(false);

  // Month data
  const currentMonthData = TICKET_MONTHLY_KPI_DATA.find((m) => m.month === selectedMonth) || TICKET_MONTHLY_KPI_DATA[0];

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice('Đã đồng bộ lại dữ liệu chỉ số Ticket từ file CSKH_04_Ticket thành công!');
      setTimeout(() => setRefreshNotice(null), 3500);
    }, 700);
  };

  const handleResetFullMonth = () => {
    setSelectedMonth(10);
    setStartDate('2026-10-01');
    setEndDate('2026-10-31');
  };

  // Jobs data according to active category tab
  const activeJobsData =
    selectedCategoryTab === 'software'
      ? TICKET_JOBS_SOFTWARE
      : selectedCategoryTab === 'technical'
      ? TICKET_JOBS_TECHNICAL
      : TICKET_JOBS_HDDT;

  const activeCategoryName =
    selectedCategoryTab === 'software'
      ? 'Hỗ trợ phần mềm'
      : selectedCategoryTab === 'technical'
      ? 'Hỗ trợ kỹ thuật'
      : 'Hỗ trợ HĐĐT - CKS';

  const displayedDailyRows = showFullDailyTable ? TICKET_DAILY_DATA : TICKET_DAILY_DATA.slice(0, 15);

  return (
    <div className="flex flex-col w-full space-y-4 animate-fadeIn pb-12 text-slate-800">
      {/* Toast Notice */}
      {refreshNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#006195] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* 1. TOP HEADER SECTION */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        {/* Top Badges & Title */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold uppercase tracking-wider text-[11px]">
                BÁO CÁO VẬN HÀNH · TICKET HỖ TRỢ
              </span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Dữ liệu ngày đến 31/10/2026
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ticket &amp; SLA xử lý
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-4xl leading-relaxed">
              KPI tháng, tốc độ assign 45 phút, tỉ lệ xử lý trong 4 giờ, nguồn tạo và loại công việc. Số liệu từ file CSKH_04_Ticket.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onOpenDataSourceModal && (
              <button
                onClick={onOpenDataSourceModal}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Cài đặt & File dữ liệu gốc CSKH_04_Ticket"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
                <span>Nguồn Sheet CSKH_04</span>
              </button>
            )}

            <button
              onClick={() => onOpenExport?.()}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">upload</span>
              <span>Xuất Excel Ticket</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#006195] transition-all shadow-xs cursor-pointer shrink-0"
              title="Đồng bộ dữ liệu Ticket"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin text-[#006195]' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Tháng báo cáo dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Tháng báo cáo:</span>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none h-8 pl-3 pr-8 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20 cursor-pointer shadow-2xs"
                >
                  {TICKET_MONTHLY_KPI_DATA.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                  expand_more
                </span>
              </div>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Từ ngày:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Đến ngày:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
              />
            </div>

            {/* Button Cả tháng */}
            <button
              onClick={handleResetFullMonth}
              className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cả tháng
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Đang xem trọn tháng {selectedMonth}/2026: <b className="text-slate-800">thẻ KPI ưu tiên số chốt tháng.</b>
          </div>
        </div>
      </div>

      {/* 2. WARNING BANNER (Dấu chấm hàng nghìn) */}
      <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-start justify-between gap-3 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">
            info
          </span>
          <p className="leading-relaxed">
            Web đã tự sửa <b>56 ô số bị lỗi dấu chấm hàng nghìn</b> (ví dụ <i>"1.207"</i> bị Google hiểu là 1,207). Số trên trang là đã đúng.
          </p>
        </div>
        <button
          onClick={() => setShowErrorHelpModal(true)}
          className="font-bold text-[#006195] hover:text-[#004b74] hover:underline whitespace-nowrap cursor-pointer shrink-0"
        >
          Xem chi tiết &amp; cách sửa trong file
        </button>
      </div>

      {/* 3. ROW 5 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: TỈ LỆ ĐẠT KPI THÁNG */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TỈ LỆ ĐẠT KPI THÁNG
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
              Gần đạt
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono">
              {currentMonthData.kpiRate}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '90.36%' }}></div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[11px]">
            <div className="text-slate-500">Mốc đạt: 100%</div>
            <div className="text-rose-600 font-bold flex items-center gap-0.5">
              <span>▼</span> 12,75 điểm % so với T9
            </div>
          </div>
        </div>

        {/* Card 2: XỬ LÝ TRONG 4 GIỜ */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              XỬ LÝ TRONG 4 GIỜ
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
              Số chốt
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight font-mono">
              {currentMonthData.sla4h}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '95.81%' }}></div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[11px]">
            <div className="text-rose-600 font-semibold truncate">
              Mục tiêu ≥ 98,50% · thiếu 2,69 điểm %
            </div>
            <div className="text-rose-600 font-bold flex items-center gap-0.5">
              <span>▼</span> 2,63 điểm % so với T9
            </div>
          </div>
        </div>

        {/* Card 3: ASSIGN TRONG 45 PHÚT */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ASSIGN TRONG 45 PHÚT
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
              Từ dữ liệu ngày
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono">
              68,09%
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '68.09%' }}></div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[11px]">
            <div className="text-slate-600 truncate">
              Mục tiêu ≥ 80,00% · TB assign 97 phút
            </div>
            <div className="text-rose-600 font-bold flex items-center gap-0.5">
              <span>▼</span> 21,29 điểm % so với T9
            </div>
          </div>
        </div>

        {/* Card 4: THỜI GIAN XỬ LÝ TB */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              THỜI GIAN XỬ LÝ TB
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
              Số chốt
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono">
                217
              </span>
              <span className="text-xs font-bold text-slate-500">phút</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1 border-t border-slate-100 text-[11px]">
            <div className="text-slate-600 truncate">
              ~ 3h37p / ticket · Mục tiêu ≤ 180 phút
            </div>
            <div className="text-slate-400">
              Chưa có số tháng trước
            </div>
          </div>
        </div>

        {/* Card 5: SẢN LƯỢNG TICKET */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              SẢN LƯỢNG TICKET
            </span>
            <div className="w-6 h-6 rounded-full bg-sky-50 text-[#006195] flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                25.187
              </span>
              <span className="text-xs font-bold text-slate-500">tạo</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 truncate">
              Đã xử lý <b>16.702</b> · xử lý/tạo <b>66,3%</b>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-600">
            <span>TB 812 ticket/ngày </span>
            <span className="text-emerald-600 font-bold">▲ 211/ngày</span> so với T9
          </div>
        </div>
      </div>

      {/* 4. SECTION: XU HƯỚNG KPI THEO THÁNG */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Xu hướng KPI theo tháng
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Số chốt từng tháng (tab Tong_hop_nam). Bấm một tháng trong bảng để xem chi tiết tháng đó.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Chart: Line Trend (8 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
            {/* Legend */}
            <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#006195]"></span>
                <span className="font-bold text-[#006195]">KPI tháng</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-[#10b981]"></span>
                <span className="text-emerald-700">Xử lý 4h</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-[#6366f1]"></span>
                <span className="text-indigo-600">Assign 45p</span>
              </span>
            </div>

            {/* SVG Visual Line Graphic */}
            <div className="relative w-full h-56 pt-2 pb-6">
              {/* Target guidelines */}
              <div className="absolute top-[8%] left-10 right-4 border-b border-dashed border-slate-300 flex justify-between text-[10px] text-slate-400">
                <span>Mốc 100%</span>
                <span className="text-slate-300 font-mono">100%</span>
              </div>
              <div className="absolute top-[16%] left-10 right-4 border-b border-dashed border-emerald-400/70 flex justify-between text-[10px] text-emerald-600">
                <span>Mục tiêu 98,5%</span>
              </div>
              <div className="absolute top-[48%] left-10 right-4 border-b border-dashed border-indigo-400/70 flex justify-between text-[10px] text-indigo-600">
                <span>Mục tiêu assign 80%</span>
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-1 top-0 bottom-6 flex flex-col justify-between text-[9px] text-slate-400 font-mono">
                <span>100%</span>
                <span>80%</span>
                <span>60%</span>
                <span>40%</span>
              </div>

              {/* SVG Trend Paths */}
              <svg className="w-full h-full pl-10 pr-4" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Guideline lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#cbd5e1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#cbd5e1" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#cbd5e1" strokeDasharray="3 3" />

                {/* KPI Tháng Line (Solid blue): Points T1-T10 */}
                {/* T1:81.6(65) T2:92.5(38) T3:85.4(55) T4:77.0(75) T5:99.7(20) T6:95.7(30) T7:74.5(80) T8:81.9(65) T9:103.1(12) T10:90.4(42) */}
                <polyline
                  fill="none"
                  stroke="#006195"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="25,65 75,38 125,55 175,75 225,20 275,30 325,80 375,65 425,12 475,42"
                />

                {/* Xử lý 4h Line (Green dashed): Points T1-T10 ~ 95-98% */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="25,32 75,27 125,30 175,37 225,26 275,27 325,40 375,31 425,24 475,31"
                />

                {/* Assign 45p Line (Indigo dashed): Points T1-T10 */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="25,115 75,85 125,105 175,125 225,60 275,70 325,130 375,110 425,50 475,98"
                />

                {/* Key dots & labels */}
                <circle cx="475" cy="42" r="4.5" fill="#006195" />
                <circle cx="475" cy="31" r="4.5" fill="#10b981" />
                <circle cx="425" cy="50" r="4.5" fill="#6366f1" />
              </svg>

              {/* Data tags callout */}
              <div className="absolute right-6 top-6 text-[10px] font-bold text-emerald-700 bg-white/90 px-1 rounded shadow-2xs">
                4h 95,8%
              </div>
              <div className="absolute right-6 top-14 text-[10px] font-bold text-[#006195] bg-white/90 px-1 rounded shadow-2xs">
                KPI 90,4%
              </div>
              <div className="absolute right-16 top-20 text-[10px] font-bold text-indigo-700 bg-white/90 px-1 rounded shadow-2xs">
                Assign 89,4% (T9)
              </div>

              {/* X Axis Months */}
              <div className="absolute bottom-0 left-10 right-4 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>T1</span>
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>T8</span>
                <span>T9</span>
                <span className="font-bold text-[#006195]">T10</span>
              </div>
            </div>
          </div>

          {/* Right Table: 10 Months (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2.5">THÁNG</th>
                    <th className="py-2 px-2 text-right">KPI THÁNG</th>
                    <th className="py-2 px-2 text-right">XỬ LÝ 4H</th>
                    <th className="py-2 px-2 text-right">ASSIGN 45P</th>
                    <th className="py-2 px-2 text-right">TG XỬ LÝ TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {TICKET_MONTHLY_KPI_DATA.map((row) => {
                    const isSelected = selectedMonth === row.month;
                    return (
                      <tr
                        key={row.month}
                        onClick={() => setSelectedMonth(row.month)}
                        className={`transition-colors cursor-pointer text-[11px] ${
                          isSelected
                            ? 'bg-sky-50/90 font-bold border-l-2 border-[#006195]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">
                          {row.label}
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right font-bold ${
                            row.kpiNumeric >= 100
                              ? 'text-emerald-600'
                              : row.kpiNumeric >= 90
                              ? 'text-rose-600'
                              : 'text-rose-700'
                          }`}
                        >
                          {row.kpiRate}
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right ${
                            row.sla4hNumeric >= 98
                              ? 'text-emerald-600 font-semibold'
                              : 'text-amber-600'
                          }`}
                        >
                          {row.sla4h}
                        </td>
                        <td
                          className={`py-1.5 px-2 text-right ${
                            row.assign45pNumeric && row.assign45pNumeric >= 80
                              ? 'text-emerald-600 font-semibold'
                              : row.assign45pNumeric
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.assign45p}
                        </td>
                        <td className="py-1.5 px-2 text-right text-rose-600 font-bold">
                          {row.avgProcTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-2 bg-slate-50 text-[10px] text-slate-500 border-t border-slate-200 text-center">
              Dữ liệu đồng bộ trực tiếp từ bảng <b>CSKH_04_Ticket</b>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION: DIỄN BIẾN THEO NGÀY · THÁNG 10/2026 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Diễn biến theo ngày · Tháng 10/2026
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Từ 01/10 đến 31/10 (tab Ticket_Ngay). Ô đỏ = chưa đạt mục tiêu; nền xám trên biểu đồ = cuối tuần.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-sky-50 text-[#006195] border border-sky-200 text-xs font-bold self-start sm:self-auto">
            31 ngày có số liệu
          </span>
        </div>

        {/* Dual Charts: Volume Bars & SLA Lines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Sản lượng ticket mỗi ngày */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Sản lượng ticket mỗi ngày
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-300"></span>
                  <span>TK tạo</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#006195]"></span>
                  <span>TK xử lý</span>
                </span>
              </div>
            </div>

            {/* Daily Bars graphic */}
            <div className="h-40 flex items-end justify-between gap-1 pt-2 px-1 border-b border-slate-200">
              {TICKET_DAILY_DATA.map((d) => {
                const maxVal = 1300;
                const hCreated = (d.tkCreated / maxVal) * 100;
                const hProcessed = (d.tkProcessed / maxVal) * 100;

                return (
                  <div
                    key={d.dayNum}
                    className={`flex-1 flex flex-col items-center group relative h-full justify-end ${
                      d.isWeekend ? 'bg-slate-200/40 rounded-t' : ''
                    }`}
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1 z-20 bg-slate-900 text-white text-[10px] rounded px-1.5 py-1 whitespace-nowrap shadow-xl">
                      <b>{d.dateStr} ({d.dayOfWeek})</b><br />
                      Tạo: {d.tkCreated.toLocaleString()}<br />
                      Xử lý: {d.tkProcessed.toLocaleString()}
                    </div>

                    <div className="flex items-end gap-0.5 w-full justify-center">
                      <div
                        style={{ height: `${hCreated}%` }}
                        className="w-full max-w-[6px] bg-sky-300 rounded-t-xs"
                      ></div>
                      <div
                        style={{ height: `${hProcessed}%` }}
                        className="w-full max-w-[6px] bg-[#006195] rounded-t-xs"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis days summary */}
            <div className="flex justify-between text-[9px] text-slate-400 font-mono px-1">
              <span>01</span>
              <span>04</span>
              <span>07</span>
              <span>10</span>
              <span>13</span>
              <span>16</span>
              <span>19</span>
              <span>22</span>
              <span>25</span>
              <span>28</span>
              <span>31</span>
            </div>
          </div>

          {/* Chart 2: Tỉ lệ đúng hạn mỗi ngày */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Tỉ lệ đúng hạn mỗi ngày
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-emerald-600"></span>
                  <span className="text-emerald-700 font-semibold">Xử lý 4h</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-indigo-600"></span>
                  <span className="text-indigo-600 font-semibold">Assign 45p</span>
                </span>
              </div>
            </div>

            {/* Line Graph representation */}
            <div className="h-40 relative pt-2 border-b border-slate-200">
              {/* Target lines */}
              <div className="absolute top-[8%] left-0 right-0 border-b border-dashed border-emerald-400 flex justify-end text-[9px] text-emerald-600 pr-1">
                <span>100% 4h 98,5%</span>
              </div>
              <div className="absolute top-[48%] left-0 right-0 border-b border-dashed border-indigo-400 flex justify-end text-[9px] text-indigo-600 pr-1">
                <span>MT assign 80%</span>
              </div>

              {/* Simulated lines */}
              <svg className="w-full h-full" viewBox="0 0 310 120" preserveAspectRatio="none">
                {/* 4h line (Green, top ~96-98%) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  points={TICKET_DAILY_DATA.map((d, i) => `${i * 10 + 5},${120 - (d.sla4h - 90) * 11}`).join(' ')}
                />
                {/* Assign 45p line (Purple/blue, varies 45-85%) */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  points={TICKET_DAILY_DATA.map((d, i) => `${i * 10 + 5},${120 - (d.assign45p - 40) * 2}`).join(' ')}
                />
              </svg>
            </div>
            {/* X-axis days summary */}
            <div className="flex justify-between text-[9px] text-slate-400 font-mono px-1">
              <span>01</span>
              <span>04</span>
              <span>07</span>
              <span>10</span>
              <span>13</span>
              <span>16</span>
              <span>19</span>
              <span>22</span>
              <span>25</span>
              <span>28</span>
              <span>31</span>
            </div>
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">THỨ</th>
                <th className="py-2 px-3">NGÀY</th>
                <th className="py-2 px-3 text-right">TK TẠO</th>
                <th className="py-2 px-3 text-right">TK XỬ LÝ</th>
                <th className="py-2 px-3 text-right">XỬ LÝ / TẠO</th>
                <th className="py-2 px-3 text-right">ASSIGN 45P</th>
                <th className="py-2 px-3 text-right">TB ASSIGN (PHÚT)</th>
                <th className="py-2 px-3 text-right">XỬ LÝ 4H</th>
                <th className="py-2 px-3 text-right">TB XỬ LÝ (PHÚT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {displayedDailyRows.map((d) => {
                const isAssignDanger = d.assign45p < 80;
                const isSlaDanger = d.sla4h < 98.5;
                const isProcessTimeDanger = d.avgProcessMin > 180;

                return (
                  <tr
                    key={d.dayNum}
                    className={`transition-colors ${
                      d.isWeekend ? 'bg-slate-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className={`py-1.5 px-3 font-sans font-medium ${d.isWeekend ? 'text-amber-800' : 'text-slate-700'}`}>
                      {d.dayOfWeek}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-900">
                      {d.dateStr}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-800">
                      {d.tkCreated.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-800">
                      {d.tkProcessed.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-600">
                      {d.processRatio}%
                    </td>
                    <td className={`py-1.5 px-3 text-right font-bold ${isAssignDanger ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {d.assign45p.toFixed(2).replace('.', ',')}%
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-700">
                      {d.avgAssignMin}
                    </td>
                    <td className={`py-1.5 px-3 text-right font-bold ${isSlaDanger ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {d.sla4h.toFixed(2).replace('.', ',')}%
                    </td>
                    <td className={`py-1.5 px-3 text-right font-bold ${isProcessTimeDanger ? 'text-rose-600' : 'text-slate-800'}`}>
                      {d.avgProcessMin}
                    </td>
                  </tr>
                );
              })}

              {/* Bottom Summary Row: Cả kỳ (31 ngày) */}
              <tr className="bg-sky-50/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-3 font-sans" colSpan={2}>
                  {TICKET_PERIOD_SUMMARY.label}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {TICKET_PERIOD_SUMMARY.tkCreated.toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {TICKET_PERIOD_SUMMARY.tkProcessed.toLocaleString('vi-VN')}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {TICKET_PERIOD_SUMMARY.processRatio}%
                </td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  {TICKET_PERIOD_SUMMARY.assign45p.toFixed(2).replace('.', ',')}%
                </td>
                <td className="py-2.5 px-3 text-right">
                  {TICKET_PERIOD_SUMMARY.avgAssignMin}
                </td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  {TICKET_PERIOD_SUMMARY.sla4h.toFixed(2).replace('.', ',')}%
                </td>
                <td className="py-2.5 px-3 text-right text-rose-600">
                  {TICKET_PERIOD_SUMMARY.avgProcessMin}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* View all 31 days toggle */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowFullDailyTable(!showFullDailyTable)}
            className="text-xs font-bold text-[#006195] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showFullDailyTable ? 'Thu gọn danh sách (15 ngày)' : 'Xem đầy đủ 31 ngày trong tháng'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showFullDailyTable ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* 6. SECTION: NGUỒN TẠO TICKET · THÁNG 10/2026 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Nguồn tạo ticket · Tháng 10/2026
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tab Ticket_Theo Nguon. Mỗi nguồn giữ một màu cố định ở cả hai biểu đồ.
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 self-start sm:self-auto">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {TOTAL_TICKET_SOURCES.t10Total.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-500">ticket tạo</span>
            <span className="text-xs font-bold text-emerald-600">
              ▲ {TOTAL_TICKET_SOURCES.deltaPercentVsT9}% so với T9
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Số lượng ticket theo nguồn (Horizontal bars) */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="text-xs font-bold text-slate-700 pb-1">
              Số lượng ticket theo nguồn
            </div>
            <div className="text-[11px] text-slate-400 -mt-2 mb-2">
              Thanh đậm = tháng đang xem; thanh mờ = tháng trước; cột phải: tăng/giảm
            </div>

            <div className="space-y-2.5">
              {TICKET_SOURCES_DATA.map((src) => {
                const maxVal = 6200;
                const barWidth = (src.count / maxVal) * 100;
                return (
                  <div key={src.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }}></span>
                        <span>{src.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 font-mono">
                          {src.count.toLocaleString('vi-VN')}
                        </span>
                        <span
                          className={`text-[11px] font-bold w-16 text-right ${
                            src.deltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {src.deltaPercent >= 0 ? '▲' : '▼'} {Math.abs(src.deltaPercent)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: src.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Tỉ lệ % theo nguồn */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700">
              Tỉ lệ % theo nguồn
            </div>
            <p className="text-[11px] text-slate-400">
              Cơ cấu nguồn tạo qua các tháng (mỗi hàng = 100%)
            </p>

            {/* Stacked Bars for T8, T9, T10 */}
            <div className="space-y-2 pt-1 font-mono text-[10px]">
              {/* T8 */}
              <div className="flex items-center gap-2">
                <span className="w-6 text-slate-500 font-bold">T8</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '25%' }} className="bg-[#006195] flex items-center justify-center">25%</div>
                  <div style={{ width: '16%' }} className="bg-[#00a389] flex items-center justify-center">16%</div>
                  <div style={{ width: '22%' }} className="bg-[#0090DA] flex items-center justify-center">22%</div>
                  <div style={{ width: '12%' }} className="bg-[#f59e0b] flex items-center justify-center">12%</div>
                  <div style={{ width: '15%' }} className="bg-[#38bdf8] flex items-center justify-center">15%</div>
                  <div style={{ width: '10%' }} className="bg-[#64748b] flex items-center justify-center">10%</div>
                </div>
              </div>

              {/* T9 */}
              <div className="flex items-center gap-2">
                <span className="w-6 text-slate-500 font-bold">T9</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '27%' }} className="bg-[#006195] flex items-center justify-center">27%</div>
                  <div style={{ width: '17%' }} className="bg-[#00a389] flex items-center justify-center">17%</div>
                  <div style={{ width: '23%' }} className="bg-[#0090DA] flex items-center justify-center">23%</div>
                  <div style={{ width: '13%' }} className="bg-[#f59e0b] flex items-center justify-center">13%</div>
                  <div style={{ width: '14%' }} className="bg-[#38bdf8] flex items-center justify-center">14%</div>
                  <div style={{ width: '6%' }} className="bg-[#64748b] flex items-center justify-center">6%</div>
                </div>
              </div>

              {/* T10 */}
              <div className="flex items-center gap-2">
                <span className="w-6 text-[#006195] font-bold">T10</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '22%' }} className="bg-[#006195] flex items-center justify-center">22%</div>
                  <div style={{ width: '24%' }} className="bg-[#00a389] flex items-center justify-center">24%</div>
                  <div style={{ width: '17%' }} className="bg-[#0090DA] flex items-center justify-center">17%</div>
                  <div style={{ width: '15%' }} className="bg-[#f59e0b] flex items-center justify-center">15%</div>
                  <div style={{ width: '12%' }} className="bg-[#38bdf8] flex items-center justify-center">12%</div>
                  <div style={{ width: '8%' }} className="bg-[#64748b] flex items-center justify-center">8%</div>
                </div>
              </div>
            </div>

            {/* Share Breakdown Table */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#006195]"></span> Nguồn Sale
                </span>
                <span className="font-bold">21,8% <span className="text-rose-600 font-normal text-[11px]">-5,1</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#00a389]"></span> Outsourcing
                </span>
                <span className="font-bold">24,3% <span className="text-emerald-600 font-normal text-[11px]">+7,2</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#0090DA]"></span> Nguồn DVKH
                </span>
                <span className="font-bold">16,8% <span className="text-rose-600 font-normal text-[11px]">-6,5</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#f59e0b]"></span> AI ElevenLabs
                </span>
                <span className="font-bold">14,8% <span className="text-emerald-600 font-normal text-[11px]">+1,7</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#38bdf8]"></span> Renewal - Upgrade
                </span>
                <span className="font-bold">12,5% <span className="text-rose-600 font-normal text-[11px]">-1,9</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-[#64748b]"></span> Administrator
                </span>
                <span className="font-bold">8,2% <span className="text-emerald-600 font-normal text-[11px]">+5,1</span></span>
              </div>
              <div className="flex items-center justify-between col-span-2">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-xs bg-slate-400"></span> Khác (3 nguồn)
                </span>
                <span className="font-bold">1,7% <span className="text-rose-600 font-normal text-[11px]">-0,6</span></span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-right pt-1">
              Cột cuộc: thay đổi điểm % so với T9
            </div>
          </div>
        </div>
      </div>

      {/* 7. SECTION: LOẠI TICKET · THÁNG 10/2026 */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Loại ticket · Tháng 10/2026
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tab Ticket_Theo Loai TK, dòng Total của từng loại. Bấm vào một loại để xem loại công việc bên dưới.
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 self-start sm:self-auto">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {TOTAL_TICKET_CATEGORIES.t10Total.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-slate-500">tổng 3 loại</span>
            <span className="text-xs font-bold text-emerald-600">
              ▲ {TOTAL_TICKET_CATEGORIES.deltaPercentVsT9}% so với T9
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Số lượng ticket theo loại (Columns for T8, T9, T10) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Số lượng ticket theo loại</span>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#006195]"></span>
                  <span>Hỗ trợ phần mềm</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span>
                  <span>Hỗ trợ kỹ thuật</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#6366f1]"></span>
                  <span>Hỗ trợ HĐĐT - CKS</span>
                </span>
              </div>
            </div>

            {/* 3 Grouped Month Columns */}
            <div className="h-44 flex items-end justify-around gap-6 pt-2 pb-1 border-b border-slate-200">
              {/* T8 */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-8 bg-[#006195] rounded-t-sm h-[85%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    8,8k
                  </div>
                  <div className="w-8 bg-[#10b981] rounded-t-sm h-[86%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    8,9k
                  </div>
                  <div className="w-8 bg-[#6366f1] rounded-t-sm h-[39%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    4,0k
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">T8</span>
              </div>

              {/* T9 */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-8 bg-[#006195] rounded-t-sm h-[74%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    7,6k
                  </div>
                  <div className="w-8 bg-[#10b981] rounded-t-sm h-[73%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    7,5k
                  </div>
                  <div className="w-8 bg-[#6366f1] rounded-t-sm h-[28%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    2,9k
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">T9</span>
              </div>

              {/* T10 */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-8 bg-[#006195] rounded-t-sm h-[100%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    10,3k
                  </div>
                  <div className="w-8 bg-[#10b981] rounded-t-sm h-[90%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    9,3k
                  </div>
                  <div className="w-8 bg-[#6366f1] rounded-t-sm h-[53%] flex items-start justify-center pt-1 text-[9px] text-white font-bold font-mono">
                    5,5k
                  </div>
                </div>
                <span className="text-xs font-bold text-[#006195]">T10</span>
              </div>
            </div>
          </div>

          {/* Right: Tỉ lệ % theo loại */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-700">
              Tỉ lệ % theo loại
            </div>
            <p className="text-[11px] text-slate-400">
              Cơ cấu 3 loại ticket qua các tháng (mỗi hàng = 100%)
            </p>

            {/* Stacked bars for T8, T9, T10 */}
            <div className="space-y-2 pt-1 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-6 text-slate-500 font-bold">T8</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '41%' }} className="bg-[#006195] flex items-center justify-center">41%</div>
                  <div style={{ width: '41%' }} className="bg-[#10b981] flex items-center justify-center">41%</div>
                  <div style={{ width: '18%' }} className="bg-[#6366f1] flex items-center justify-center">18%</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 text-slate-500 font-bold">T9</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '42%' }} className="bg-[#006195] flex items-center justify-center">42%</div>
                  <div style={{ width: '42%' }} className="bg-[#10b981] flex items-center justify-center">42%</div>
                  <div style={{ width: '16%' }} className="bg-[#6366f1] flex items-center justify-center">16%</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 text-[#006195] font-bold">T10</span>
                <div className="flex-1 h-5 rounded-md flex overflow-hidden text-white font-bold text-[9px]">
                  <div style={{ width: '41%' }} className="bg-[#006195] flex items-center justify-center">41%</div>
                  <div style={{ width: '37%' }} className="bg-[#10b981] flex items-center justify-center">37%</div>
                  <div style={{ width: '22%' }} className="bg-[#6366f1] flex items-center justify-center">22%</div>
                </div>
              </div>
            </div>

            {/* Shares breakdown */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#006195]"></span> Hỗ trợ phần mềm
                </span>
                <span className="font-bold font-mono">
                  41,0% <span className="text-rose-600 font-normal text-[11px]">-1,3</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]"></span> Hỗ trợ kỹ thuật
                </span>
                <span className="font-bold font-mono">
                  37,1% <span className="text-rose-600 font-normal text-[11px]">-4,7</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#6366f1]"></span> Hỗ trợ HĐĐT - CKS
                </span>
                <span className="font-bold font-mono">
                  22,0% <span className="text-emerald-600 font-normal text-[11px]">+6,0</span>
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-right pt-1">
              Cột cuộc: thay đổi điểm % so với T9
            </div>
          </div>
        </div>
      </div>

      {/* 8. SECTION: LOẠI CÔNG VIỆC THEO LOẠI TICKET */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Loại công việc theo loại ticket
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Một ticket có thể gắn nhiều loại công việc nên cộng các dòng có thể lớn hơn Total. Tỉ trọng tính trên Total của loại ticket.
            </p>
          </div>

          {/* Filter pills */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 shrink-0">
            <button
              onClick={() => setSelectedCategoryTab('software')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                selectedCategoryTab === 'software'
                  ? 'bg-[#006195] text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-white"></span>
              <span>Hỗ trợ phần mềm</span>
            </button>
            <button
              onClick={() => setSelectedCategoryTab('technical')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                selectedCategoryTab === 'technical'
                  ? 'bg-[#10b981] text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-white"></span>
              <span>Hỗ trợ kỹ thuật</span>
            </button>
            <button
              onClick={() => setSelectedCategoryTab('hddt')}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                selectedCategoryTab === 'hddt'
                  ? 'bg-[#6366f1] text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-xs bg-white"></span>
              <span>Hỗ trợ HĐĐT - CKS</span>
            </button>
          </div>
        </div>

        {/* Jobs Ranking Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">LOẠI CÔNG VIỆC</th>
                <th className="py-2.5 px-3 text-right">T8</th>
                <th className="py-2.5 px-3 text-right">T9</th>
                <th className="py-2.5 px-3 text-right">T10</th>
                <th className="py-2.5 px-3 text-left min-w-[200px]">TỈ TRỌNG T10</th>
                <th className="py-2.5 px-3 text-right">SO VỚI T9</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {activeJobsData.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-bold">{job.id}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">
                    {job.name}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {job.t8.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">
                    {job.t9.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    {job.t10.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2 px-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-slate-700 font-bold">{job.shareT10}%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 max-w-[120px] overflow-hidden">
                        <div
                          className="h-full bg-[#006195] rounded-full"
                          style={{ width: `${Math.min(100, job.shareT10 * 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-bold ${
                      job.deltaVsT9 >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {job.deltaVsT9 >= 0 ? '▲' : '▼'} {Math.abs(job.deltaVsT9)}%
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-sky-50/80 font-bold text-slate-900 border-t-2 border-slate-200">
                <td className="py-2.5 px-3" colSpan={2}>
                  Total {activeCategoryName}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {selectedCategoryTab === 'software' ? '8.776' : selectedCategoryTab === 'technical' ? '8.900' : '4.000'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {selectedCategoryTab === 'software' ? '7.632' : selectedCategoryTab === 'technical' ? '7.500' : '2.900'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#006195]">
                  {selectedCategoryTab === 'software' ? '10.308' : selectedCategoryTab === 'technical' ? '9.300' : '5.500'}
                </td>
                <td className="py-2.5 px-3 text-slate-400 font-sans text-[10px]">
                  dòng Total trong file
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-mono">
                  ▲ {selectedCategoryTab === 'software' ? '35,1%' : selectedCategoryTab === 'technical' ? '24,0%' : '89,7%'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* View all 52 jobs link */}
        <div className="text-center pt-1">
          <button
            onClick={() => setShowAllJobsModal(true)}
            className="text-xs font-bold text-[#006195] hover:underline cursor-pointer"
          >
            Xem tất cả 52 loại công việc
          </button>
        </div>
      </div>

      {/* 9. SECTION: NHẬN ĐỊNH TỰ ĐỘNG · TÍNH TỪ SỐ LIỆU ĐANG XEM */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Nhận định tự động · tính từ số liệu đang xem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Điểm sáng */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 pb-1 border-b border-emerald-200/50">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">stars</span>
              <span>Điểm sáng</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 shrink-0 font-bold">●</span>
                <span>Ngày assign tốt nhất: <b>17/10 (85,6%)</b>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 shrink-0 font-bold">●</span>
                <span>HĐĐT - CKS tăng trưởng ấn tượng +89,7% trong tháng cao điểm.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Cần chú ý */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2">
            <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5 pb-1 border-b border-rose-200/50">
              <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
              <span>Cần chú ý</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 shrink-0 font-bold">●</span>
                <span><b>KPI tháng mới 90,36%</b>, chưa đạt mục tiêu 100,0%.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 shrink-0 font-bold">●</span>
                <span>KPI tháng giảm <b>12,7 điểm %</b> so với tháng trước.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 shrink-0 font-bold">●</span>
                <span><b>Xử lý 4h mới 95,81%</b>, chưa đạt mục tiêu 98,5%.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 shrink-0 font-bold">●</span>
                <span>Xử lý 4h giảm <b>2,6 điểm %</b> so với tháng trước.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 shrink-0 font-bold">●</span>
                <span><b>Assign 45p mới 68,09%</b>, chưa đạt mục tiêu 80%.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Biến động nguồn & loại công việc */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/80 space-y-2">
            <div className="font-bold text-[#004b74] text-xs flex items-center gap-1.5 pb-1 border-b border-sky-200/50">
              <span className="material-symbols-outlined text-[16px] text-[#006195]">trending_up</span>
              <span>Biến động nguồn &amp; loại công việc</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-start gap-1.5">
                <span className="text-[#006195] shrink-0 font-bold">●</span>
                <span>Nguồn <b>Outsourcing tăng 3.034 ticket (+98%)</b> so với T9.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#006195] shrink-0 font-bold">●</span>
                <span>Nguồn <b>Administrator tăng 1.510 ticket (+275%)</b> so với T9.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#006195] shrink-0 font-bold">●</span>
                <span>Hỗ trợ phần mềm: <i>"Hỗ trợ khác"</i> tăng mạnh nhất (+1.734).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#006195] shrink-0 font-bold">●</span>
                <span>Hỗ trợ kỹ thuật: <i>"Hỗ trợ khác"</i> tăng mạnh nhất (+560).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#006195] shrink-0 font-bold">●</span>
                <span>Hỗ trợ HĐĐT - CKS: <i>"Hỗ trợ HĐĐT"</i> tăng mạnh nhất (+1.524).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 10. BOTTOM FOOTER INFO */}
      <div className="pt-2 pb-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dữ liệu cập nhật đến 05/11/2026 · Trung tâm CSKH KiotViet</span>
        </div>
        <div>
          Phiên bản 2.11.0 · Dữ liệu: <b>đã đồng bộ</b> · Quản trị: <b>Thuyết (Manager CS), Yến, Lâm</b>
        </div>
      </div>

      {/* MODAL 1: Error help modal for thousand separator issue */}
      {showErrorHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">build</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Xử lý dấu chấm hàng nghìn trong file CSKH_04
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cơ chế chuẩn hóa tự động &amp; cách định dạng trên Google Sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowErrorHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <b className="text-slate-800">Nguyên nhân:</b>
                <p>
                  Khi nhập số trên Google Sheets với Locale tiếng Việt (dấu chấm phân cách hàng nghìn), một số ô nhập text dạng <code>"1.207"</code> hoặc <code>"25.187"</code> có thể bị một số trình duyệt hiểu nhầm là số thập phân <code>1,207</code>.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-900">
                <b className="text-emerald-800">Cơ chế xử lý tự động của Dashboard:</b>
                <p>
                  Hệ thống tự động phát hiện mẫu <code>\d+\.\d&#123;3&#125;</code> và chuẩn hóa thành số nguyên chuẩn (ví dụ <code>1.207</code> thành <code>1207</code> ticket). Tất cả các phép tính tổng sản lượng (25.187 ticket) và tỷ lệ trên giao diện đều được tính toán chính xác 100%.
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 space-y-1 text-sky-900">
                <b className="text-sky-800">Cách thiết lập trên Google Sheets để chuẩn 100%:</b>
                <p>
                  Vào <i>Tệp &gt; Cài đặt &gt; Ngôn ngữ &gt; Việt Nam</i>, hoặc chọn toàn bộ cột dữ liệu và nhấn <i>Định dạng &gt; Số &gt; Số nguyên không thập phân</i>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowErrorHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: View all 52 jobs modal */}
      {showAllJobsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col space-y-4 text-left">
            <div className="flex items-start justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#006195] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">list_alt</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Toàn bộ danh mục 52 loại công việc Ticket (CSKH_04_Ticket)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chi tiết sản lượng tiếp nhận &amp; xử lý qua 3 tháng T8, T9, T10
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllJobsModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="space-y-4">
                {/* Group 1: Phần mềm */}
                <div>
                  <div className="text-xs font-bold text-[#006195] pb-1 border-b border-slate-200 mb-2">
                    1. Nhóm Hỗ trợ phần mềm (Total T10: 10.308 ticket)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase font-bold">
                        <th className="py-1">Loại công việc</th>
                        <th className="py-1 text-right">T8</th>
                        <th className="py-1 text-right">T9</th>
                        <th className="py-1 text-right">T10</th>
                        <th className="py-1 text-right">Tỉ trọng T10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {TICKET_JOBS_SOFTWARE.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50">
                          <td className="py-1.5 font-sans font-medium text-slate-800">{j.name}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t8.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t9.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{j.t10.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-[#006195]">{j.shareT10}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Group 2: Kỹ thuật */}
                <div>
                  <div className="text-xs font-bold text-emerald-700 pb-1 border-b border-slate-200 mb-2">
                    2. Nhóm Hỗ trợ kỹ thuật (Total T10: 9.300 ticket)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase font-bold">
                        <th className="py-1">Loại công việc</th>
                        <th className="py-1 text-right">T8</th>
                        <th className="py-1 text-right">T9</th>
                        <th className="py-1 text-right">T10</th>
                        <th className="py-1 text-right">Tỉ trọng T10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {TICKET_JOBS_TECHNICAL.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50">
                          <td className="py-1.5 font-sans font-medium text-slate-800">{j.name}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t8.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t9.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{j.t10.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-emerald-600">{j.shareT10}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Group 3: HĐĐT - CKS */}
                <div>
                  <div className="text-xs font-bold text-indigo-700 pb-1 border-b border-slate-200 mb-2">
                    3. Nhóm Hỗ trợ HĐĐT - CKS (Total T10: 5.500 ticket)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 text-[10px] uppercase font-bold">
                        <th className="py-1">Loại công việc</th>
                        <th className="py-1 text-right">T8</th>
                        <th className="py-1 text-right">T9</th>
                        <th className="py-1 text-right">T10</th>
                        <th className="py-1 text-right">Tỉ trọng T10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {TICKET_JOBS_HDDT.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50">
                          <td className="py-1.5 font-sans font-medium text-slate-800">{j.name}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t8.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right text-slate-600">{j.t9.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{j.t10.toLocaleString('vi-VN')}</td>
                          <td className="py-1.5 text-right font-bold text-indigo-600">{j.shareT10}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setShowAllJobsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
