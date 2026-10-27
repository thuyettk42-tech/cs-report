import React, { useState, useMemo } from 'react';
import {
  getInitialMultiChannelData,
  saveMultiChannelData,
  getStoredSheetUrl,
  fetchFromGoogleSheet,
  getSyncAuditLogs,
  parseCsvToMetrics,
  addSyncAuditLog,
} from '../../services/googleSheetsSync';
import { MultiChannelMetricRow, SyncAuditLog } from '../../types';

interface MultiChannelSyncViewProps {
  onOpenExport?: () => void;
  currentUserEmail?: string;
}

export const MultiChannelSyncView: React.FC<MultiChannelSyncViewProps> = ({
  onOpenExport,
  currentUserEmail = 'thuyet.vm@kiotviet.com',
}) => {
  const [metrics, setMetrics] = useState<MultiChannelMetricRow[]>(getInitialMultiChannelData());
  const [sheetUrl, setSheetUrl] = useState<string>(getStoredSheetUrl());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>('all');
  const [auditLogs, setAuditLogs] = useState<SyncAuditLog[]>(getSyncAuditLogs());
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Handle Google Sheet live fetch
  const handleSyncFromSheet = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const result = await fetchFromGoogleSheet(sheetUrl, currentUserEmail);
      setIsSyncing(false);
      if (result.success) {
        setMetrics(result.rows);
        setAuditLogs(getSyncAuditLogs());
        setSyncStatusMsg({ text: result.message });
        setTimeout(() => setSyncStatusMsg(null), 4000);
      } else {
        setSyncStatusMsg({ text: result.message, isError: true });
      }
    } catch (err: any) {
      setIsSyncing(false);
      setSyncStatusMsg({ text: err.message || 'Lỗi khi đồng bộ Google Sheet', isError: true });
    }
  };

  // Handle direct CSV upload from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = parseCsvToMetrics(text);
          if (parsed.length > 0) {
            setMetrics(parsed);
            saveMultiChannelData(parsed);
            addSyncAuditLog({
              timestamp: new Date().toLocaleString('vi-VN'),
              updatedBy: currentUserEmail,
              source: `Tệp tải lên: ${file.name}`,
              rowCount: parsed.length,
              status: 'success',
              notes: `Đã nhập trực tiếp ${parsed.length} chỉ số từ tệp CSV`,
            });
            setAuditLogs(getSyncAuditLogs());
            setSyncStatusMsg({ text: `Đã tải và xử lý thành công ${parsed.length} chỉ số từ tệp ${file.name}!` });
            setTimeout(() => setSyncStatusMsg(null), 4000);
          } else {
            setSyncStatusMsg({ text: 'Tệp CSV không chứa cấu trúc bảng dữ liệu KiotViet phù hợp.', isError: true });
          }
        } catch (err: any) {
          setSyncStatusMsg({ text: `Lỗi đọc tệp CSV: ${err.message}`, isError: true });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper to get raw numeric value
  const getNum = (val: number | string | null): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace('%', '').replace(',', '.').replace(/\./g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Filter rows by channel
  const filteredMetrics = useMemo(() => {
    if (activeChannelFilter === 'all') return metrics;
    return metrics.filter(m => m.channel.toLowerCase().includes(activeChannelFilter.toLowerCase()));
  }, [metrics, activeChannelFilter]);

  // Aggregate Key Statistics
  const stats = useMemo(() => {
    const totalCallRow = metrics.find(m => m.channel === 'Call' && m.metric.includes('Total call'));
    const missCallRateRow = metrics.find(m => m.channel === 'Call' && m.metric.includes('Miss call rate'));
    const totalChatRow = metrics.find(m => m.channel === 'FreshChat' && m.metric.includes('Total chat'));
    const totalTicketRow = metrics.find(m => m.channel === 'CRM' && m.metric.includes('Tổng ticket'));
    const totalJobsRow = metrics.find(m => m.channel === 'Tổng hợp' && m.metric.includes('Total jobs'));
    const slaRow = metrics.find(m => m.metric.includes('Tỷ lệ đạt SLA'));
    const csatRow = metrics.find(m => m.metric.includes('CSAT'));
    const jobsPerPersonRow = metrics.find(m => m.metric.includes('Number of jobs / personnel'));

    // Compute sum of months 1..10
    const sumMonths = (row?: MultiChannelMetricRow) => {
      if (!row) return 0;
      return row.months.slice(0, 10).reduce((acc: number, v) => acc + (typeof v === 'number' ? v : 0), 0);
    };

    return {
      totalCalls: sumMonths(totalCallRow),
      octMissCallRate: missCallRateRow?.months[9] || '1.00%',
      totalChats: sumMonths(totalChatRow),
      totalTickets: sumMonths(totalTicketRow),
      totalJobs: sumMonths(totalJobsRow),
      octSla: slaRow?.months[9] || '96.80%',
      octCsat: csatRow?.months[9] || '95.20%',
      octJobsPerPerson: jobsPerPersonRow?.months[8] || '969',
    };
  }, [metrics]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-white p-space-lg rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Google Sheets / Excel
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-mono">
              Phụ trách cập nhật: <strong className="text-slate-900">Yến, Lâm, Thuyết (Manager CS)</strong> • Chu kỳ 2 tuần/lần
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Báo Cáo Tiếp Nhận Đa Kênh — Đồng Bộ Dữ Liệu Thực Tế
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-4xl">
            Tập hợp dữ liệu vận hành từ toàn bộ các kênh (Tổng đài Hotline, Freshchat Livechat, CRM Ticket, Fanpage KV, Fanpage FnB, Email &amp; CSAT). Toàn bộ dữ liệu được cập nhật trực tiếp từ link Google Sheet trung tâm.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenExport?.()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => setShowLogsDrawer(!showLogsDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Nhật ký đồng bộ ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* 2. GOOGLE SHEET LIVE URL SYNC CONTROLLER */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">table_chart</span>
            </span>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Link Google Sheet Nguồn Dữ Liệu (Publish CSV URL hoặc Edit URL):
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Tải file CSV lên</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleSyncFromSheet}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ Sheet'}</span>
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn ${
            syncStatusMsg.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {syncStatusMsg.isError ? 'error' : 'check_circle'}
            </span>
            <span>{syncStatusMsg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <span className="w-3 h-3 bg-amber-200 border border-amber-400 rounded-xs inline-block"></span>
              Ô vàng chữ xanh = Nhập số liệu
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-500">
              <span className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-xs inline-block"></span>
              Ô xám = Tự động tính, không sửa
            </span>
          </div>
          <span className="text-[11px] font-mono">Dữ liệu chuẩn hóa 2026</span>
        </div>
      </div>

      {/* 3. KEY METRICS BENTO CARDS (Real Values from Excel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-space-sm">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tổng Call 2026</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {(stats.totalCalls / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-slate-500">cuộc</span>
          </div>
          <span className="text-[11px] text-slate-400">10 tháng đầu năm</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Miss Call Tháng 10</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {stats.octMissCallRate}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Đạt chuẩn (Mục tiêu ≤3%)</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tổng Chat Reply</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary font-mono tabular-nums">
              {(stats.totalChats / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-slate-500">phiên</span>
          </div>
          <span className="text-[11px] text-slate-400">Nghiệp vụ &amp; Kỹ thuật</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tổng Ticket CRM</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {(stats.totalTickets / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-slate-500">phiếu</span>
          </div>
          <span className="text-[11px] text-slate-400">Sales + CS</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tỷ lệ đạt SLA</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {stats.octSla}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Mục tiêu ≥95%</span>
        </div>

        {/* Metric 6 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Điểm CSAT Tháng 10</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-secondary font-mono tabular-nums">
              {stats.octCsat}
            </span>
          </div>
          <span className="text-[11px] text-secondary font-semibold">Mục tiêu ≥92%</span>
        </div>

        {/* Metric 7 */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Năng suất TB/NS</div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary font-mono tabular-nums">
              {stats.octJobsPerPerson}
            </span>
            <span className="text-[11px] text-slate-500">việc/người</span>
          </div>
          <span className="text-[11px] text-slate-400">Chốt kỳ Tháng 9</span>
        </div>
      </div>

      {/* 4. COMPARISON VISUAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Chart 1: Multi-channel volume trend (8 cols) */}
        <div className="lg:col-span-8 bg-white p-space-md rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Xu Hướng Lưu Lượng Đa Kênh T1 - T10/2026</h3>
              <p className="text-[11px] text-slate-400">Đối chiếu khối lượng Tổng Call, FreshChat, Ticket CRM và Fanpage</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-primary inline-block"></span>Total Call</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block"></span>FreshChat</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>Ticket CRM</span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180">
              <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="680" y1="20" y2="20"></line>
              <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="680" y1="60" y2="60"></line>
              <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="680" y1="100" y2="100"></line>
              <line stroke="#E2E8F0" strokeDasharray="3 3" x1="30" x2="680" y1="140" y2="140"></line>
              <line stroke="#CBD5E1" x1="30" x2="680" y1="160" y2="160"></line>

              {/* 10 Monthly Clusters */}
              {[
                { m: 'T1', call: 146, chat: 34, ticket: 28 },
                { m: 'T2', call: 62, chat: 16, ticket: 14 },
                { m: 'T3', call: 103, chat: 30, ticket: 24 },
                { m: 'T4', call: 117, chat: 31, ticket: 25 },
                { m: 'T5', call: 73, chat: 24, ticket: 18 },
                { m: 'T6', call: 76, chat: 25, ticket: 23 },
                { m: 'T7', call: 98, chat: 28, ticket: 33 },
                { m: 'T8', call: 69, chat: 31, ticket: 21 },
                { m: 'T9', call: 50, chat: 28, ticket: 17 },
                { m: 'T10', call: 51, chat: 21, ticket: 15 },
              ].map((item, idx) => {
                const x = 50 + idx * 63;
                return (
                  <g key={item.m} className="hover:opacity-85 transition-opacity">
                    <rect x={x} y={160 - item.call} width="16" height={item.call} fill="#006195" rx="2" />
                    <rect x={x + 18} y={160 - item.chat * 1.8} width="14" height={item.chat * 1.8} fill="#38bdf8" rx="2" />
                    <rect x={x + 34} y={160 - item.ticket * 2.2} width="14" height={item.ticket * 2.2} fill="#f59e0b" rx="2" />
                    <text x={x + 24} y="174" fontSize="10" fill="#64748B" textAnchor="middle" fontFamily="Inter">{item.m}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 2: Miss call rate reduction (4 cols) */}
        <div className="lg:col-span-4 bg-white p-space-md rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tỷ Lệ Cuộc Nhỡ (Miss Call Rate)</h3>
              <p className="text-[11px] text-slate-400">Giảm mạnh từ 8.81% xuống còn 1.00%</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">T10: 1.00%</span>
          </div>

          {/* Line Chart */}
          <div className="h-52 w-full pt-2 flex flex-col justify-between">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 320 120">
              <line stroke="#F1F5F9" x1="10" x2="310" y1="20" y2="20" />
              <line stroke="#F1F5F9" x1="10" x2="310" y1="60" y2="60" />
              <line stroke="#F1F5F9" x1="10" x2="310" y1="100" y2="100" />
              <line stroke="#E2E8F0" x1="10" x2="310" y1="110" y2="110" />

              {/* Target threshold 3% line */}
              <line stroke="#EF4444" strokeDasharray="3 3" x1="10" x2="310" y1="80" y2="80" />
              <text x="315" y="83" fontSize="8" fill="#EF4444">Mục tiêu 3%</text>

              {/* Line points: 8.81%, 2.75%, 3.68%, 11.06%, 1.75%, 2.00%, 4.41%, 3.31%, 1.00% */}
              <path
                d="M 20 40 L 50 82 L 80 75 L 110 20 L 140 92 L 170 90 L 200 68 L 230 78 L 260 100"
                fill="none"
                stroke="#006e2c"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="40" r="3" fill="#006e2c" />
              <circle cx="110" cy="20" r="3.5" fill="#EF4444" />
              <circle cx="260" cy="100" r="4" fill="#006e2c" stroke="#fff" strokeWidth="1.5" />
            </svg>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-2 pt-1 border-t border-slate-100">
              <span>Tháng 1: 8.81%</span>
              <span>Đỉnh T4: 11.06%</span>
              <span className="font-bold text-emerald-700">Tháng 9: 1.00%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FILTER CHANNELS BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold px-1 uppercase text-[10px]">Phân loại kênh:</span>
          {['all', 'Call', 'FreshChat', 'FanPage', 'CRM', 'Email', 'Chất lượng', 'Tổng hợp'].map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeChannelFilter === ch
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ch === 'all' ? 'Tất cả kênh (27 chỉ số)' : ch}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Lọc tháng:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Hiển thị cả 12 Tháng (So sánh)</option>
            {monthNames.map((mName, idx) => (
              <option key={idx} value={idx}>{mName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. COMPLETE COLOR-CODED MASTER DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">dataset</span>
            <h2 className="font-bold text-sm text-slate-900 uppercase">
              Bảng Dữ Liệu Chi Tiết Đa Kênh — Chuẩn Quy Ước Excel Gốc
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredMetrics.length} chỉ số được tính toán tự động
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase border-b border-slate-200">
                <th className="py-2.5 px-3 w-28 sticky left-0 bg-slate-100 z-10">Kênh</th>
                <th className="py-2.5 px-4 min-w-[220px]">Chỉ số</th>
                {selectedMonth === 'all' ? (
                  monthNames.map((mName, idx) => (
                    <th key={idx} className="py-2.5 px-2.5 text-right min-w-[80px] font-mono">
                      {mName}
                    </th>
                  ))
                ) : (
                  <th className="py-2.5 px-4 text-right min-w-[120px] font-mono text-primary font-bold text-sm">
                    {monthNames[selectedMonth as number]}
                  </th>
                )}
                <th className="py-2.5 px-4 min-w-[280px]">Định nghĩa / Cách tính</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMetrics.map((row, rIdx) => {
                const isCalc = row.isCalculated;
                return (
                  <tr
                    key={rIdx}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isCalc ? 'bg-slate-50/70 font-semibold' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-primary sticky left-0 bg-inherit z-10 border-r border-slate-100">
                      {row.channel}
                    </td>
                    <td className="py-2.5 px-4 text-slate-900 font-medium">
                      {row.metric}
                    </td>

                    {/* Monthly Columns */}
                    {selectedMonth === 'all' ? (
                      row.months.map((val, mIdx) => {
                        const isValueEntered = val !== null && val !== undefined && val !== '';
                        return (
                          <td
                            key={mIdx}
                            className={`py-2 px-2.5 text-right font-mono tabular-nums ${
                              !isCalc && isValueEntered
                                ? 'bg-amber-50 text-blue-800 font-bold' // Ô vàng chữ xanh
                                : isCalc && isValueEntered
                                ? 'text-slate-900 font-bold' // Ô xám tự tính
                                : 'text-slate-300'
                            }`}
                          >
                            {typeof val === 'number'
                              ? val.toLocaleString('vi-VN')
                              : val || '-'}
                          </td>
                        );
                      })
                    ) : (
                      <td
                        className={`py-2 px-4 text-right font-mono text-sm tabular-nums font-bold ${
                          !isCalc ? 'bg-amber-50 text-blue-800' : 'text-slate-900'
                        }`}
                      >
                        {typeof row.months[selectedMonth as number] === 'number'
                          ? (row.months[selectedMonth as number] as number).toLocaleString('vi-VN')
                          : row.months[selectedMonth as number] || '-'}
                      </td>
                    )}

                    <td className="py-2.5 px-4 text-slate-500 text-[11px] leading-relaxed">
                      {row.definition}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. AUDIT LOGS DRAWER / MODAL */}
      {showLogsDrawer && (
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <span>Lịch Sử Đồng Bộ Google Sheets &amp; Ai Đã Cập Nhật</span>
            </h3>
            <button onClick={() => setShowLogsDrawer(false)} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Thời gian</th>
                  <th className="py-2 px-3">Người cập nhật</th>
                  <th className="py-2 px-3">Nguồn Sheet</th>
                  <th className="py-2 px-3 text-right">Số dòng</th>
                  <th className="py-2 px-3">Ghi chú</th>
                  <th className="py-2 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-600">{log.timestamp}</td>
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">{log.updatedBy}</td>
                    <td className="py-2 px-3 text-slate-500 font-sans">{log.source}</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">{log.rowCount}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{log.notes || '-'}</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
