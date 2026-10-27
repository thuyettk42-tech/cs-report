import React, { useState } from 'react';

interface DataSourceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tabKey: any) => void;
}

// Raw dataset rows extracted from the attached file "Bảng tổng hợp dữ liệu khối tổng đài"
export const RAW_DATA_ROWS = [
  { channel: 'Call', metric: 'Call in', m1: '133.882', m2: '61.099', m3: '99.977', m4: '104.475', m5: '72.671', m6: '75.074', m7: '93.785', m8: '67.534', m9: '52.742', m10: '48.751', m11: '', m12: '', note: 'Tổng cuộc gọi khách hàng gọi vào tổng đài' },
  { channel: 'Call', metric: 'Miss call', m1: '12.935', m2: '1.727', m3: '3.822', m4: '13.003', m5: '1.297', m6: '1.531', m7: '4.345', m8: '2.313', m9: '547', m10: '1.190', m11: '', m12: '', note: 'Cuộc gọi nhỡ chưa kịp tiếp nhận' },
  { channel: 'Call', metric: 'Deduction', m1: '0', m2: '13', m3: '69', m4: '89', m5: '0', m6: '129', m7: '299', m8: '96', m9: '0', m10: '0', m11: '', m12: '', note: 'Cuộc gọi loại trừ (spam, gọi nhầm…)' },
  { channel: 'Call', metric: 'Total call', m1: '146.817', m2: '62.839', m3: '103.868', m4: '117.567', m5: '73.968', m6: '76.734', m7: '98.429', m8: '69.943', m9: '53.289', m10: '49.941', m11: '', m12: '', note: 'Call in + Miss call + Deduction' },
  { channel: 'Call', metric: 'Miss call rate', m1: '8,81%', m2: '2,75%', m3: '3,68%', m4: '11,06%', m5: '1,75%', m6: '2,00%', m7: '4,41%', m8: '3,31%', m9: '1,03%', m10: '2,38%', m11: '', m12: '', note: 'Miss call / Total call — mục tiêu ≤ 3%' },
  { channel: 'FreshChat', metric: 'Total software business chat', m1: '21.784', m2: '9.789', m3: '18.855', m4: '20.442', m5: '15.170', m6: '15.816', m7: '18.387', m8: '22.109', m9: '20.818', m10: '19.454', m11: '', m12: '', note: 'Phiên chat nghiệp vụ phần mềm' },
  { channel: 'FreshChat', metric: 'Total technicality chat', m1: '12.645', m2: '7.064', m3: '11.553', m4: '11.482', m5: '9.060', m6: '10.101', m7: '10.501', m8: '9.648', m9: '7.838', m10: '7.086', m11: '', m12: '', note: 'Phiên chat kỹ thuật' },
  { channel: 'FreshChat', metric: 'Total chat', m1: '34.429', m2: '16.853', m3: '30.408', m4: '31.924', m5: '24.230', m6: '25.917', m7: '28.888', m8: '31.757', m9: '28.656', m10: '26.540', m11: '', m12: '', note: 'Chat nghiệp vụ + chat kỹ thuật' },
  { channel: 'FreshChat', metric: 'First chat response rate (minute)', m1: '87,09%', m2: '86,17%', m3: '87,65%', m4: '85,96%', m5: '90,49%', m6: '85,53%', m7: '85,84%', m8: '77,60%', m9: '77,98%', m10: '85,84%', m11: '', m12: '', note: 'Tỷ lệ phiên được phản hồi trong phút đầu — mục tiêu ≥ 85%' },
  { channel: 'FreshChat', metric: 'Average response time in chat (Sec)', m1: '183,34', m2: '44,21', m3: '52,94', m4: '59,00', m5: '38,00', m6: '41,00', m7: '47,67', m8: '43,18', m9: '43,26', m10: '44,37', m11: '', m12: '', note: 'Thời gian phản hồi trung bình (giây) — mục tiêu ≤ 45s' },
  { channel: 'FanPage KV', metric: 'Interactive', m1: '19.334', m2: '14.924', m3: '15.521', m4: '12.673', m5: '12.881', m6: '10.858', m7: '10.650', m8: '9.722', m9: '9.585', m10: '6.441', m11: '', m12: '', note: 'Lượt tương tác Fanpage KiotViet' },
  { channel: 'FanPage KV', metric: 'Lead', m1: '13.006', m2: '8.561', m3: '12.538', m4: '10.774', m5: '11.133', m6: '9.447', m7: '9.470', m8: '8.453', m9: '8.348', m10: '5.629', m11: '', m12: '', note: 'Lead thu được' },
  { channel: 'FanPage KV', metric: 'Lead conversion rate', m1: '84,75%', m2: '83,49%', m3: '84,20%', m4: '85,02%', m5: '86,43%', m6: '87,00%', m7: '88,92%', m8: '86,95%', m9: '87,09%', m10: '87,39%', m11: '', m12: '', note: 'Lead / Interactive' },
  { channel: 'Fanpage FnB', metric: 'Interactive', m1: '4.092', m2: '2.838', m3: '3.592', m4: '2.447', m5: '2.182', m6: '2.161', m7: '1.495', m8: '1.382', m9: '1.429', m10: '785', m11: '', m12: '', note: 'Lượt tương tác Fanpage FnB' },
  { channel: 'Fanpage FnB', metric: 'Lead', m1: '3.360', m2: '2.335', m3: '3.025', m4: '1.966', m5: '1.837', m6: '1.883', m7: '1.316', m8: '1.204', m9: '1.226', m10: '662', m11: '', m12: '', note: 'Lead thu được' },
  { channel: 'Fanpage FnB', metric: 'Lead conversion rate', m1: '82,11%', m2: '77,48%', m3: '84,21%', m4: '80,34%', m5: '84,19%', m6: '87,14%', m7: '88,03%', m8: '87,12%', m9: '85,79%', m10: '84,33%', m11: '', m12: '', note: 'Lead / Interactive' },
  { channel: 'CRM', metric: 'Ticket Sales', m1: '12.005', m2: '6.445', m3: '12.250', m4: '11.270', m5: '8.457', m6: '9.676', m7: '11.551', m8: '9.275', m9: '8.677', m10: '', m11: '', m12: '', note: 'Ticket nhóm Sales' },
  { channel: 'CRM', metric: 'Ticket Customer service', m1: '16.598', m2: '8.479', m3: '12.511', m4: '14.313', m5: '9.922', m6: '14.269', m7: '21.853', m8: '12.419', m9: '9.029', m10: '', m11: '', m12: '', note: 'Ticket nhóm Customer service' },
  { channel: 'CRM', metric: 'Tổng ticket', m1: '28.603', m2: '14.924', m3: '24.761', m4: '25.583', m5: '18.379', m6: '23.945', m7: '33.404', m8: '21.694', m9: '17.706', m10: '', m11: '', m12: '', note: 'Ticket Sales + Ticket Customer service' },
  { channel: 'Email', metric: 'Total', m1: '395', m2: '246', m3: '407', m4: '553', m5: '510', m6: '564', m7: '696', m8: '630', m9: '687', m10: '', m11: '', m12: '', note: 'Email tiếp nhận' },
  { channel: 'Chất lượng', metric: 'Tỷ lệ đạt SLA', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '95,60%', m9: '96,80%', m10: '', m11: '', m12: '', note: 'Yêu cầu xử lý đúng hạn cam kết — mục tiêu ≥ 95%' },
  { channel: 'Chất lượng', metric: 'FCR (xử lý ngay lần đầu)', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '85,20%', m9: '86,40%', m10: '', m11: '', m12: '', note: 'Giải quyết dứt điểm trong 1 lần tương tác — mục tiêu ≥ 83%' },
  { channel: 'Chất lượng', metric: 'Backlog ticket quá 48h', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '215', m9: '175', m10: '', m11: '', m12: '', note: 'Ticket quá 48h chưa đóng tại cuối kỳ — mục tiêu ≤ 250' },
  { channel: 'Chất lượng', metric: 'CSAT', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', m7: '', m8: '94,60%', m9: '95,20%', m10: '', m11: '', m12: '', note: 'Điểm hài lòng sau cuộc gọi/chat — mục tiêu ≥ 92%' },
  { channel: 'Tổng hợp', metric: 'Total jobs to handle', m1: '217.072', m2: '104.132', m3: '165.977', m4: '176.345', m5: '122.228', m6: '125.781', m7: '151.410', m8: '122.613', m9: '99.843', m10: '', m11: '', m12: '', note: 'Tổng việc xử lý (Call + Chat + Fanpage + Ticket + Email)' },
  { channel: 'Tổng hợp', metric: 'Total employees by month', m1: '113', m2: '111', m3: '111', m4: '112', m5: '110', m6: '109', m7: '102', m8: '104', m9: '103', m10: '', m11: '', m12: '', note: 'Nhân sự trực trong tháng' },
  { channel: 'Tổng hợp', metric: 'Number of jobs / personnel', m1: '1.921', m2: '938', m3: '1.495', m4: '1.575', m5: '1.111', m6: '1.154', m7: '1.484', m8: '1.179', m9: '969', m10: '', m11: '', m12: '', note: 'Tổng việc / nhân sự' },
];

export const DataSourceSettingsModal: React.FC<DataSourceSettingsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'raw-file' | 'mapping' | 'connection'>('raw-file');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter raw data rows
  const filteredRows = RAW_DATA_ROWS.filter((r) => {
    const matchChannel = selectedChannel === 'all' || r.channel === selectedChannel;
    const matchSearch =
      r.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.channel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchChannel && matchSearch;
  });

  const channels = ['all', ...Array.from(new Set(RAW_DATA_ROWS.map((r) => r.channel)))];

  // Download raw file handler
  const handleDownloadRawFile = () => {
    const link = document.createElement('a');
    link.href = '/assets/aistudio/B_ng_t_ng_h_p_d__li_u_kh_i_t_ng___i_b61b86bf';
    link.download = 'Bao_cao_tong_hop_du_lieu_khoi_tong_dai_2026.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('Đã lưu cấu hình liên kết nguồn dữ liệu trực tiếp!');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#004b74] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-[24px] text-sky-400">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Cài Đặt &amp; File Dữ Liệu Gốc
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#20C65A]/20 text-[#20C65A] border border-[#20C65A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C65A] animate-pulse"></span>
                  Đã kết nối
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Bảng tổng hợp dữ liệu khối tổng đài • Người phụ trách: Yến, Lâm, Thuyết (Manager CS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* TOP TABS NAVIGATION */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('raw-file')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                activeTab === 'raw-file'
                  ? 'border-[#0090DA] text-[#006195] bg-white shadow-2xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">table_chart</span>
              <span>File Dữ Liệu Gốc (CSV / Bảng Tính)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 text-[#006195] font-mono">
                {RAW_DATA_ROWS.length} chỉ số
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mapping')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                activeTab === 'mapping'
                  ? 'border-[#0090DA] text-[#006195] bg-white shadow-2xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">schema</span>
              <span>Sơ Đồ Mapping Sheet &amp; Report</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-mono">
                Sẵn sàng cấu hình
              </span>
            </button>

            <button
              onClick={() => setActiveTab('connection')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                activeTab === 'connection'
                  ? 'border-[#0090DA] text-[#006195] bg-white shadow-2xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              <span>Liên Kết Google Sheets &amp; API</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleDownloadRawFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Tải về tệp dữ liệu CSV gốc đính kèm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Tải file gốc (.CSV)</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {saveSuccess && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{saveSuccess}</span>
            </div>
            <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: RAW DATA TABLE VIEWER */}
          {activeTab === 'raw-file' && (
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px] text-emerald-600">description</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        Bảng tổng hợp dữ liệu khối tổng đài (2026)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-semibold">
                        CSV Dataset
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-sky-50 text-[#006195] font-semibold border border-sky-100">
                        Đang áp dụng cho Dashboard
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                      <span>• Chu kỳ cập nhật: <b>2 tuần/lần</b></span>
                      <span>• Phụ trách: <b>Yến, Lâm, Thuyết (Manager CS)</b></span>
                      <span>• Phạm vi: <b>12 Tháng năm 2026</b></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadRawFile}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_open</span>
                    <span>Xuất CSV</span>
                  </button>
                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('bao-cao-da-kenh');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Xem Báo Cáo Đa Kênh</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Controls (Search & Filter) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-600 shrink-0">Lọc kênh:</span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {channels.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setSelectedChannel(ch)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          selectedChannel === ch
                            ? 'bg-[#006195] text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {ch === 'all' ? 'Tất cả kênh' : ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm chỉ số hoặc định nghĩa..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* RAW DATA GRID */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-10 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200 bg-slate-100">Kênh</th>
                        <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200 bg-slate-100 min-w-[200px]">Chỉ số</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 1</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 2</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 3</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 4</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 5</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 6</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 7</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 8</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 9</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 10</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 11</th>
                        <th className="py-2.5 px-2.5 text-right whitespace-nowrap border-r border-slate-200 bg-slate-100">Tháng 12</th>
                        <th className="py-2.5 px-3 whitespace-nowrap min-w-[260px] bg-slate-100">Định nghĩa / Cách tính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {filteredRows.map((row, index) => {
                        const isHeaderChannel = index === 0 || filteredRows[index - 1]?.channel !== row.channel;
                        return (
                          <tr key={index} className="hover:bg-sky-50/50 transition-colors">
                            <td className="py-2 px-3 font-sans font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                              {isHeaderChannel ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-200/80 text-slate-800 font-bold">
                                  {row.channel}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[11px] pl-2">↳</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans font-medium text-slate-900 border-r border-slate-200 whitespace-nowrap">
                              {row.metric}
                            </td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m1 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m2 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m3 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m4 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m5 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m6 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m7 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m8 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-700 border-r border-slate-100 tabular-nums">{row.m9 || '—'}</td>
                            <td className="py-2 px-2.5 text-right font-bold text-[#006195] border-r border-slate-100 tabular-nums">{row.m10 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-400 border-r border-slate-100 tabular-nums">{row.m11 || '—'}</td>
                            <td className="py-2 px-2.5 text-right text-slate-400 border-r border-slate-100 tabular-nums">{row.m12 || '—'}</td>
                            <td className="py-2 px-3 font-sans text-slate-500 text-[11px] leading-snug">
                              {row.note}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Hiển thị <b>{filteredRows.length}</b> / {RAW_DATA_ROWS.length} hàng dữ liệu</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ô số liệu Tháng 10 là dữ liệu mới nhất được nạp tự động vào hệ thống.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHEET & REPORT MAPPING */}
          {activeTab === 'mapping' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700">
                <div className="font-bold text-[#006195] text-sm mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>Cơ chế ánh xạ dữ liệu (Sheet Mapping)</span>
                </div>
                <p className="leading-relaxed">
                  Như bạn đã yêu cầu: <i>"chi tiết thì vào từng report tôi sẽ mô tả sheet nào tương ứng số liệu nào sau"</i>. Dưới đây là danh sách phân hệ báo cáo hiện tại. Khi bạn gửi mô tả cho từng sheet (ví dụ: "Sheet Call Center lấy cột A-G"), hệ thống sẽ liên kết và cập nhật biểu đồ tương ứng!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item 1 */}
                <div className="bg-white p-4 rounded-xl border-2 border-emerald-500/40 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">hub</span>
                      <h4 className="font-bold text-slate-900 text-sm">1. Báo Cáo Tiếp Nhận Đa Kênh</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đã kết nối dữ liệu gốc
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dữ liệu nguồn: Toàn bộ bảng <b>Bảng tổng hợp dữ liệu khối tổng đài</b> (Call, Freshchat, Fanpage, CRM Ticket, Email, Chất lượng SLA).
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 1 (Tiếp nhận đa kênh)</b></span>
                    <span className="font-mono text-emerald-700 font-semibold">27/27 chỉ số</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0090DA] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006195] text-[20px]">call</span>
                      <h4 className="font-bold text-slate-900 text-sm">2. Call Center Hotline 1900 6522</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ mô tả chi tiết sheet
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phần bóc tách chi tiết: Sản lượng theo ca, hàng đợi Asterisk, tỷ lệ cuộc gọi nhỡ và thời lượng phục vụ trung bình (AHT).
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 2 (Call Center)</b></span>
                    <span className="text-amber-700 font-semibold">Sẵn sàng nhận mô tả</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0090DA] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006195] text-[20px]">chat</span>
                      <h4 className="font-bold text-slate-900 text-sm">3. Freshchat Livechat &amp; AI</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ mô tả chi tiết sheet
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phần bóc tách: Phiên chat nghiệp vụ vs kỹ thuật, thời gian phản hồi tin đầu tiên (FRT), tỷ lệ giữ chân và trợ lý ảo AI bot.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 3 (Freshchat)</b></span>
                    <span className="text-amber-700 font-semibold">Sẵn sàng nhận mô tả</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0090DA] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006195] text-[20px]">confirmation_number</span>
                      <h4 className="font-bold text-slate-900 text-sm">4. Ticket SLA &amp; Hỗ Trợ Kỹ Thuật</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ mô tả chi tiết sheet
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phần bóc tách: Ticket Sales, Ticket CS, tỷ lệ tuân thủ SLA 4h, backlog tồn đọng quá 48h và phân tích nguyên nhân lỗi.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 4 (Ticket CRM)</b></span>
                    <span className="text-amber-700 font-semibold">Sẵn sàng nhận mô tả</span>
                  </div>
                </div>

                {/* Item 5 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0090DA] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006195] text-[20px]">badge</span>
                      <h4 className="font-bold text-slate-900 text-sm">5. Lực Lượng Nhân Sự Inhouse &amp; Outsource</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ mô tả chi tiết sheet
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phần bóc tách: Định biên nhân sự theo tháng, năng suất việc/người, đối soát chi phí nghiệm thu đối tác BPO.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 5 (Nhân sự &amp; Năng suất)</b></span>
                    <span className="text-amber-700 font-semibold">Sẵn sàng nhận mô tả</span>
                  </div>
                </div>

                {/* Item 6 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-[#0090DA] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006195] text-[20px]">domain</span>
                      <h4 className="font-bold text-slate-900 text-sm">6. Phân Hệ Dự Án (Retail, FnB, Kat, Booking, Employ)</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Chờ mô tả chi tiết sheet
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phần bóc tách: Bug sự cố Retail, vận hành nhà hàng FnB, Bar KAT, Booking khách sạn và Chấm công Employ.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sheet tương ứng: <b>Sheet 6 (Phân hệ dự án)</b></span>
                    <span className="text-amber-700 font-semibold">Sẵn sàng nhận mô tả</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONNECTION (GOOGLE SHEETS & API) */}
          {activeTab === 'connection' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <form onSubmit={handleSaveConnection} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="material-symbols-outlined text-primary">link</span>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Liên kết trực tuyến Google Sheets / Microsoft Excel
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Đường dẫn Google Sheets gốc (Chế độ Xem hoặc Chỉnh sửa)
                  </label>
                  <input
                    type="url"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                  />
                  <p className="text-[11px] text-slate-400">
                    Hệ thống có thể đọc trực tiếp các tab/sheet từ Google Sheets nếu được cấp quyền Chia sẻ liên kết.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Tệp dữ liệu cục bộ hiện hành:</div>
                  <div className="font-mono text-[11px] text-slate-500 break-all">
                    /public/assets/aistudio/B_ng_t_ng_h_p_d__li_u_kh_i_t_ng___i_b61b86bf
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    ✓ Đang hoạt động ổn định và sẵn sàng đồng bộ sang các phân hệ.
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Lưu cấu hình liên kết
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500">
            Dữ liệu tổng hợp khối tổng đài • Bản quyền KiotViet CSKH 2026
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
