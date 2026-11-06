import React, { useState, useEffect } from 'react';
import {
  TICKET_MONTHLY_KPI_DATA,
  TICKET_DAILY_DATA,
  TICKET_SOURCES_DATA,
  TICKET_CATEGORIES_DATA,
  TICKET_JOBS_SOFTWARE,
  TICKET_JOBS_TECHNICAL,
  TICKET_JOBS_HDDT,
} from '../../data/ticketData';

interface DataSourceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tabKey: any) => void;
  initialDataset?: 'multichannel' | 'ticket';
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
  initialDataset = 'ticket',
}) => {
  const [selectedDataset, setSelectedDataset] = useState<'ticket' | 'multichannel'>(initialDataset);
  const [activeTab, setActiveTab] = useState<'raw-file' | 'mapping' | 'connection'>('raw-file');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [ticketFilterSection, setTicketFilterSection] = useState<'all' | 'monthly' | 'daily' | 'sources' | 'jobs'>('all');

  // Google sheet URLs
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [ticketSheetUrl, setTicketSheetUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    const savedMultichannel = localStorage.getItem('kiotviet_multichannel_sheet_url') || '';
    const savedTicket = localStorage.getItem('kiotviet_ticket_sheet_url') || '';
    setGoogleSheetUrl(savedMultichannel);
    setTicketSheetUrl(savedTicket);
  }, []);

  if (!isOpen) return null;

  // Filter raw data rows for multichannel
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
    if (selectedDataset === 'ticket') {
      const link = document.createElement('a');
      link.href = '/assets/aistudio/CSKH_04_Ticket_d384a4c8';
      link.download = 'CSKH_04_Ticket_Raw_Dataset.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement('a');
      link.href = '/assets/aistudio/B_ng_t_ng_h_p_d__li_u_kh_i_t_ng___i_b61b86bf';
      link.download = 'Bao_cao_tong_hop_du_lieu_khoi_tong_dai_2026.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDataset === 'ticket') {
      localStorage.setItem('kiotviet_ticket_sheet_url', ticketSheetUrl);
      setSaveSuccess('Đã lưu cấu hình Google Sheet cho Report Ticket Hỗ Trợ (CSKH_04_Ticket) thành công!');
    } else {
      localStorage.setItem('kiotviet_multichannel_sheet_url', googleSheetUrl);
      setSaveSuccess('Đã lưu cấu hình Google Sheet cho Báo Cáo Đa Kênh Tổng Đài thành công!');
    }
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#004b74] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <span className="material-symbols-outlined text-[24px] text-sky-400">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Cài Đặt &amp; File Dữ Liệu Gốc
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#20C65A]/20 text-[#20C65A] border border-[#20C65A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C65A] animate-pulse"></span>
                  Đã kết nối dữ liệu
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {selectedDataset === 'ticket'
                  ? 'Kênh Vận Hành · Report Ticket Hỗ Trợ (CSKH_04_Ticket) • KPI SLA, Nguồn tạo & Phân loại'
                  : 'Bảng tổng hợp dữ liệu khối tổng đài • Người phụ trách: Yến, Lâm, Thuyết (Manager CS)'}
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

        {/* DATASET SELECTOR BANNER */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Chọn báo cáo cấu hình:</span>
            <div className="inline-flex rounded-xl p-1 bg-white border border-slate-300 shadow-2xs gap-1">
              <button
                onClick={() => setSelectedDataset('ticket')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedDataset === 'ticket'
                    ? 'bg-[#006195] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                <span>Report Ticket Hỗ Trợ (CSKH_04)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200 text-sky-950">Mới</span>
              </button>

              <button
                onClick={() => setSelectedDataset('multichannel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedDataset === 'multichannel'
                    ? 'bg-[#006195] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>Báo Cáo Đa Kênh Tổng Đài</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadRawFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Tải về tệp dữ liệu CSV gốc đính kèm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Tải file CSV ({selectedDataset === 'ticket' ? 'CSKH_04_Ticket' : 'Khối tổng đài'})</span>
            </button>
          </div>
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
              <span>Dữ Liệu Gốc ({selectedDataset === 'ticket' ? 'CSKH_04_Ticket' : 'Bảng tính Đa kênh'})</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 text-[#006195] font-mono font-bold">
                {selectedDataset === 'ticket' ? '25.187 tickets' : `${RAW_DATA_ROWS.length} chỉ số`}
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
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                Đã chuẩn hóa
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
              <span>Liên Kết Google Sheets ({selectedDataset === 'ticket' ? 'Ticket CSKH_04' : 'Đa kênh'})</span>
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
          
          {/* ============================================================== */}
          {/* SECTION A: TICKET REPORT DATASET MODE                         */}
          {/* ============================================================== */}
          {selectedDataset === 'ticket' ? (
            <div>
              {/* TAB 1: RAW TICKET DATA */}
              {activeTab === 'raw-file' && (
                <div className="space-y-4">
                  {/* File Info Card */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-[#006195]">confirmation_number</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">
                            CSKH_04_Ticket (Dữ liệu gốc Ticket &amp; SLA Xử Lý)
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-50 text-[#006195] font-semibold border border-sky-200">
                            CSV Dataset &amp; Google Sheet
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Đang kết nối: Kênh Vận Hành · Ticket Hỗ Trợ
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                          <span>• Tổng sản lượng Tháng 10: <b className="text-slate-800">25.187 tickets tạo</b> (16.702 xử lý)</span>
                          <span>• Phân loại: <b className="text-slate-800">9 Nguồn tạo &amp; 3 Danh mục (52 loại việc)</b></span>
                          <span>• Chu kỳ dữ liệu: <b className="text-slate-800">Tháng 1 đến Tháng 10/2026</b></span>
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
                            onNavigateToTab('ticket-ho-tro');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          <span>Xem Báo Cáo Ticket Hỗ Trợ</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Sub-section pills */}
                  <div className="flex items-center gap-2 flex-wrap bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-semibold text-slate-600">Phân vùng sheet:</span>
                    <button
                      onClick={() => setTicketFilterSection('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ticketFilterSection === 'all'
                          ? 'bg-[#006195] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả chỉ số (Toàn bảng)
                    </button>
                    <button
                      onClick={() => setTicketFilterSection('monthly')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ticketFilterSection === 'monthly'
                          ? 'bg-[#006195] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      1. Chỉ số SLA 10 Tháng (T1 - T10)
                    </button>
                    <button
                      onClick={() => setTicketFilterSection('daily')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ticketFilterSection === 'daily'
                          ? 'bg-[#006195] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      2. Sản lượng 31 Ngày Tháng 10
                    </button>
                    <button
                      onClick={() => setTicketFilterSection('sources')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ticketFilterSection === 'sources'
                          ? 'bg-[#006195] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      3. Nguồn Tạo Ticket (9 Nguồn)
                    </button>
                    <button
                      onClick={() => setTicketFilterSection('jobs')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        ticketFilterSection === 'jobs'
                          ? 'bg-[#006195] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      4. Phân Nhóm 52 Loại Công Việc
                    </button>
                  </div>

                  {/* 1. Monthly SLA Table */}
                  {(ticketFilterSection === 'all' || ticketFilterSection === 'monthly') && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[18px]">calendar_month</span>
                          <span className="font-bold text-xs text-slate-800">
                            Chỉ Số Vận Hành &amp; SLA Tháng 1 Đến Tháng 10/2026 (Nguồn: CSKH_04_Ticket)
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">Đạt chuẩn 90,36% (T10)</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3 whitespace-nowrap">Chỉ số đo lường</th>
                              {TICKET_MONTHLY_KPI_DATA.map((m) => (
                                <th key={m.month} className="py-2.5 px-2.5 text-right whitespace-nowrap">
                                  {m.label}
                                </th>
                              ))}
                              <th className="py-2.5 px-3 whitespace-nowrap">Mục tiêu chuẩn</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            <tr className="hover:bg-sky-50/40">
                              <td className="py-2 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                                Tỉ lệ đạt KPI tháng (%)
                              </td>
                              {TICKET_MONTHLY_KPI_DATA.map((m) => (
                                <td
                                  key={m.month}
                                  className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                                    m.month === 10 ? 'text-rose-600 bg-rose-50/30' : 'text-slate-800'
                                  }`}
                                >
                                  {m.kpiRate}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-sans text-emerald-700 font-bold text-[11px]">≥ 100%</td>
                            </tr>
                            <tr className="hover:bg-sky-50/40">
                              <td className="py-2 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                                Xử lý trong 4 giờ (%)
                              </td>
                              {TICKET_MONTHLY_KPI_DATA.map((m) => (
                                <td
                                  key={m.month}
                                  className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                                    m.month === 10 ? 'text-amber-700 bg-amber-50/30' : 'text-slate-800'
                                  }`}
                                >
                                  {m.sla4h}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-sans text-emerald-700 font-bold text-[11px]">≥ 98.5%</td>
                            </tr>
                            <tr className="hover:bg-sky-50/40">
                              <td className="py-2 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                                Assign trong 45 phút (%)
                              </td>
                              {TICKET_MONTHLY_KPI_DATA.map((m) => (
                                <td
                                  key={m.month}
                                  className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                                    m.month === 10 ? 'text-rose-600 bg-rose-50/30' : 'text-slate-700'
                                  }`}
                                >
                                  {m.assign45p}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-sans text-emerald-700 font-bold text-[11px]">≥ 80.0%</td>
                            </tr>
                            <tr className="hover:bg-sky-50/40">
                              <td className="py-2 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap">
                                Thời gian xử lý trung bình
                              </td>
                              {TICKET_MONTHLY_KPI_DATA.map((m) => (
                                <td
                                  key={m.month}
                                  className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                                    m.month === 10 ? 'text-amber-700 bg-amber-50/30' : 'text-slate-500'
                                  }`}
                                >
                                  {m.avgProcTime}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-sans text-emerald-700 font-bold text-[11px]">≤ 180 phút</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 2. Daily breakdown preview */}
                  {(ticketFilterSection === 'all' || ticketFilterSection === 'daily') && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[18px]">show_chart</span>
                          <span className="font-bold text-xs text-slate-800">
                            Sản Lượng &amp; Tiến Độ Theo 31 Ngày Tháng 10/2026 (Đã sửa 56 lỗi dấu chấm hàng nghìn)
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold">Tổng 31 ngày: 25.187 tickets</span>
                      </div>
                      <div className="overflow-x-auto max-h-[360px]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Ngày</th>
                              <th className="py-2 px-2.5">Thứ</th>
                              <th className="py-2 px-2.5 text-right">TK Tạo</th>
                              <th className="py-2 px-2.5 text-right">TK Xử lý</th>
                              <th className="py-2 px-2.5 text-right">Tỉ lệ xử lý</th>
                              <th className="py-2 px-2.5 text-right">Assign 45p</th>
                              <th className="py-2 px-2.5 text-right">TB Assign</th>
                              <th className="py-2 px-2.5 text-right">SLA 4h</th>
                              <th className="py-2 px-2.5 text-right">TB Xử lý</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {TICKET_DAILY_DATA.map((row) => (
                              <tr
                                key={row.dayNum}
                                className={row.isWeekend ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-sky-50/30'}
                              >
                                <td className="py-1.5 px-3 font-semibold text-slate-900">{row.dateStr}</td>
                                <td className={`py-1.5 px-2.5 font-sans ${row.isWeekend ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                                  {row.dayOfWeek}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                                  {row.tkCreated.toLocaleString('vi-VN')}
                                </td>
                                <td className="py-1.5 px-2.5 text-right text-emerald-700 font-bold">
                                  {row.tkProcessed.toLocaleString('vi-VN')}
                                </td>
                                <td className="py-1.5 px-2.5 text-right text-slate-700">{row.processRatio}%</td>
                                <td className="py-1.5 px-2.5 text-right text-slate-700">{row.assign45p}%</td>
                                <td className="py-1.5 px-2.5 text-right text-slate-500">{row.avgAssignMin}p</td>
                                <td className="py-1.5 px-2.5 text-right font-semibold text-emerald-700">{row.sla4h}%</td>
                                <td className="py-1.5 px-2.5 text-right text-slate-500">{row.avgProcessMin}p</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. Ticket Sources and 4. Categories */}
                  {(ticketFilterSection === 'all' || ticketFilterSection === 'sources' || ticketFilterSection === 'jobs') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sources */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#006195] text-[18px]">hub</span>
                            <span className="font-bold text-xs text-slate-800">
                              9 Kênh Nguồn Tạo Ticket (Tháng 10/2026)
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">25.182 tickets</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {TICKET_SOURCES_DATA.map((src) => (
                            <div key={src.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }}></span>
                                <span className="font-medium text-slate-800">{src.name}</span>
                              </div>
                              <div className="flex items-center gap-3 font-mono">
                                <span className="font-bold text-slate-900">{src.count.toLocaleString('vi-VN')}</span>
                                <span className="text-slate-500 w-12 text-right">{src.t10Share}%</span>
                                <span className={`text-[11px] font-bold w-14 text-right ${src.deltaPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {src.deltaPercent >= 0 ? `+${src.deltaPercent}%` : `${src.deltaPercent}%`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Categories & Top Jobs */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-[18px]">category</span>
                            <span className="font-bold text-xs text-slate-800">
                              3 Nhóm Danh Mục Ticket (T10)
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-700">25.171 tickets</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {TICKET_CATEGORIES_DATA.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                <span className="font-medium text-slate-800">{cat.name}</span>
                              </div>
                              <div className="flex items-center gap-3 font-mono">
                                <span className="font-bold text-slate-900">{cat.t10Count.toLocaleString('vi-VN')}</span>
                                <span className="text-slate-500 w-12 text-right">{cat.t10Share}%</span>
                                <span className={`text-[11px] font-bold w-14 text-right ${cat.deltaShare >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {cat.deltaShare >= 0 ? `+${cat.deltaShare}p` : `${cat.deltaShare}p`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[11px] font-semibold text-slate-600 mb-2">
                            Top Loại Việc Chi Tiết (Nghiệp Vụ Phần Mềm):
                          </div>
                          <div className="space-y-1 text-[11px]">
                            {TICKET_JOBS_SOFTWARE.slice(0, 4).map((j) => (
                              <div key={j.id} className="flex items-center justify-between text-slate-600">
                                <span>#{j.id}. {j.name}</span>
                                <span className="font-mono font-bold text-slate-800">{j.t10.toLocaleString('vi-VN')} ({j.shareT10}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TICKET MAPPING SCHEME */}
              {activeTab === 'mapping' && (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700">
                    <div className="font-bold text-[#006195] text-sm mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">schema</span>
                      <span>Sơ Đồ Ánh Xạ Sheet CSKH_04_Ticket Vào Giao Diện Báo Cáo</span>
                    </div>
                    <p className="leading-relaxed">
                      Tất cả các thành phần trong báo cáo Ticket hỗ trợ (Kênh vận hành) đều được ánh xạ tự động từ file <b>CSKH_04_Ticket</b> theo chuẩn hiển thị trong thiết kế desktop 1440px.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Map 1 */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[20px]">looks_one</span>
                          <h4 className="font-bold text-slate-900 text-sm">1. 5 Thẻ KPI Đầu Trang</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          T10 Hoàn tất
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ánh xạ từ dòng tổng kết Tháng 10: Tỉ lệ đạt KPI (90,36%), Xử lý trong 4h (95,81%), Assign trong 45p (68,09%), Thời gian xử lý TB (217p) và Sản lượng ticket tạo/xử lý (25.187 / 16.702).
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sheet: <b>Ticket_Thang</b></span>
                        <span className="font-mono text-emerald-700 font-semibold">5/5 KPI</span>
                      </div>
                    </div>

                    {/* Map 2 */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[20px]">looks_two</span>
                          <h4 className="font-bold text-slate-900 text-sm">2. Biểu Đồ Xu Hướng 10 Tháng</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          T1 - T10
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ánh xạ chuỗi thời gian 10 tháng: Đường màu xanh biển biểu thị Tỉ lệ xử lý 4 giờ (ngưỡng 98,5%), đường màu cam biểu thị Tỉ lệ đạt KPI tháng (ngưỡng 100%). Kèm bảng dữ liệu 10 tháng bên dưới.
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sheet: <b>Ticket_Thang (Dòng 1 - 10)</b></span>
                        <span className="font-mono text-emerald-700 font-semibold">10/10 tháng</span>
                      </div>
                    </div>

                    {/* Map 3 */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[20px]">looks_3</span>
                          <h4 className="font-bold text-slate-900 text-sm">3. Diễn Biến 31 Ngày Tháng 10</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đã khử lỗi dấu chấm
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Biểu đồ cột chồng Sản lượng tạo &amp; xử lý kèm đường Tỉ lệ SLA 4h (chuẩn 98,5%). Hệ thống tự động khử lỗi định dạng phân tách hàng nghìn cho 56 ô số liệu (ví dụ 1.207 thành 1,207 tickets).
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sheet: <b>Ticket_Theo Ngay</b></span>
                        <span className="font-mono text-emerald-700 font-semibold">31/31 ngày</span>
                      </div>
                    </div>

                    {/* Map 4 */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[20px]">looks_4</span>
                          <h4 className="font-bold text-slate-900 text-sm">4. 9 Nguồn &amp; 3 Phân Nhóm 52 Loại Việc</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đầy đủ 52 việc
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Ánh xạ cơ cấu nguồn tạo (Outsourcing 24,3%, Sale 21,8%, DVKH 16,8%, ElevenLabs 14,8%...) và bảng xếp hạng chi tiết 52 loại việc với 3 tab: Hỗ trợ phần mềm, Hỗ trợ kỹ thuật, HĐĐT - CKS.
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sheet: <b>Ticket_Theo Nguon &amp; Theo Loai TK</b></span>
                        <span className="font-mono text-emerald-700 font-semibold">52 loại việc</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TICKET GOOGLE SHEETS CONNECTION */}
              {activeTab === 'connection' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <form onSubmit={handleSaveConnection} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#006195]">link</span>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Liên Kết Google Sheets Trực Tuyến — Report Ticket Hỗ Trợ (CSKH_04_Ticket)
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Đường dẫn Google Sheets nguồn cho Report Ticket
                      </label>
                      <input
                        type="url"
                        value={ticketSheetUrl}
                        onChange={(e) => setTicketSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0090DA]/20"
                      />
                      <p className="text-[11px] text-slate-400">
                        Dán liên kết Google Sheets chứa các tab: Ticket_Thang, Ticket_Theo Ngay, Ticket_Theo Nguon, Ticket_Theo Loai TK. Hệ thống sẽ tự động đồng bộ và tính toán chỉ số.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-800">Tệp dữ liệu cục bộ chuẩn hóa:</div>
                      <div className="font-mono text-[11px] text-slate-500 break-all">
                        /public/assets/aistudio/CSKH_04_Ticket_d384a4c8
                      </div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        ✓ Đang kết nối trực tiếp vào Report Ticket Hỗ Trợ trong mục Kênh Vận Hành.
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Tự động ghi nhớ liên kết vào trình duyệt.
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#006195] hover:bg-[#004b74] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Lưu Cấu Hình Google Sheet Ticket
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* SECTION B: MULTICHANNEL REPORT DATASET MODE                     */
            /* ============================================================== */
            <div>
              {/* TAB 1: RAW MULTICHANNEL TABLE */}
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
                            Đang áp dụng: Báo Cáo Tiếp Nhận Đa Kênh
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

              {/* TAB 2: MULTICHANNEL MAPPING */}
              {activeTab === 'mapping' && (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700">
                    <div className="font-bold text-[#006195] text-sm mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      <span>Cơ chế ánh xạ dữ liệu Đa Kênh (Sheet Mapping)</span>
                    </div>
                    <p className="leading-relaxed">
                      Dưới đây là danh sách phân hệ báo cáo đa kênh hiện tại kết nối từ file tổng hợp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-emerald-500/40 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[20px]">hub</span>
                          <h4 className="font-bold text-slate-900 text-sm">1. Báo Cáo Tiếp Nhận Đa Kênh</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đã kết nối
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Dữ liệu nguồn: Toàn bộ bảng <b>Bảng tổng hợp dữ liệu khối tổng đài</b> (Call, Freshchat, Fanpage, CRM Ticket, Email, Chất lượng SLA).
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006195] text-[20px]">call</span>
                          <h4 className="font-bold text-slate-900 text-sm">2. Call Center Hotline 1900 6522</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Đã liên kết
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Phần bóc tách chi tiết: Sản lượng theo ca, hàng đợi Asterisk, tỷ lệ cuộc gọi nhỡ và thời lượng phục vụ trung bình (AHT).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MULTICHANNEL GOOGLE SHEETS */}
              {activeTab === 'connection' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <form onSubmit={handleSaveConnection} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="material-symbols-outlined text-primary">link</span>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Liên kết trực tuyến Google Sheets / Microsoft Excel (Báo Cáo Đa Kênh)
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
                        Lưu Cấu Hình Đa Kênh
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500">
            {selectedDataset === 'ticket'
              ? 'Dữ liệu Report Ticket hỗ trợ & SLA 4h (CSKH_04_Ticket) • KiotViet CSKH 2026'
              : 'Dữ liệu tổng hợp khối tổng đài • Bản quyền KiotViet CSKH 2026'}
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
