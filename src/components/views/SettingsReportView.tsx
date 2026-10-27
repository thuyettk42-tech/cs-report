import { useState } from 'react';

interface SettingsReportViewProps {
  onOpenExport?: () => void;
}

export default function SettingsReportView({ onOpenExport }: SettingsReportViewProps) {
  const [activeTab, setActiveTab] = useState<'kpi' | 'sync' | 'export'>('kpi');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable thresholds state
  const [departmentWeight, setDepartmentWeight] = useState(30);
  const [callWeight, setCallWeight] = useState(20);
  const [callbackWeight, setCallbackWeight] = useState(10);
  const [freshchatWeight, setFreshchatWeight] = useState(15);
  const [ticketWeight, setTicketWeight] = useState(20);
  const [fanpageWeight, setFanpageWeight] = useState(5);

  const [missCallTarget, setMissCallTarget] = useState(5.0);
  const [frtTarget, setFrtTarget] = useState(50);
  const [ticketSlaTarget, setTicketSlaTarget] = useState(98.5);
  const [assignTimeTarget, setAssignTimeTarget] = useState(45);

  const syncLogs = [
    { source: 'Tổng đài Asterisk (Inbound CDR)', time: '22/10/2026 23:59:59', records: '4,820 cuộc', status: 'Thành công (100%)', latency: '120ms' },
    { source: 'Voice AI Gateway (ElevenLabs Bot)', time: '22/10/2026 23:59:50', records: '468 cuộc', status: 'Thành công (100%)', latency: '85ms' },
    { source: 'BPO Outsourced Partner CDR', time: '22/10/2026 23:55:00', records: '1,586 cuộc', status: 'Đã đối soát', latency: '450ms' },
    { source: 'Freshchat Omni-channel Webhook', time: '22/10/2026 23:59:55', records: '21,724 tin nhắn', status: 'Thành công (100%)', latency: '95ms' },
    { source: 'Jira Service Management (Retail Ticket)', time: '22/10/2026 23:58:30', records: '16,170 tickets', status: 'Thành công (100%)', latency: '210ms' },
    { source: 'KiotViet HRM Active Directory', time: '22/10/2026 23:30:00', records: '190 nhân sự inhouse', status: 'Đã chuẩn hóa', latency: '310ms' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const totalWeight = departmentWeight + callWeight + callbackWeight + freshchatWeight + ticketWeight + fanpageWeight;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Hệ Thống Quản Trị Trung Tâm
            </span>
            <span className="flex items-center gap-1 font-code-sm text-code-sm text-secondary font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Thiết Lập Định Mức Vận Hành
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Cấu Hình Trọng Số KPI, Ngưỡng SLA &amp; Nhật Ký Đồng Bộ
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
            Điều chỉnh trọng số đánh giá hiệu năng nhân viên theo chỉ đạo ban giám đốc CSKH và kiểm tra tính toàn vẹn của dữ liệu snapshot T-1.
          </p>
        </div>

        <button
          onClick={() => onOpenExport?.()}
          className="flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-dark text-white font-label-md transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">ios_share</span>
          <span>Báo Cáo Xuất Khẩu</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl flex items-center justify-between text-body-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Đã lưu thành công cấu hình trọng số KPI và ngưỡng SLA toàn trung tâm!</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* TABS */}
      <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeTab === 'kpi'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>Cấu hình Trọng số KPI &amp; Ngưỡng SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeTab === 'sync'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history_toggle_off</span>
          <span>Nhật ký Đồng bộ Dữ liệu T-1</span>
        </button>
      </div>

      {activeTab === 'kpi' ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KPI Weights */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">donut_large</span>
                  <h3 className="font-bold text-slate-900">Phân Bổ Trọng Số 6 Nhóm KPI (Tổng: 100%)</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums ${
                  totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  Hiện tại: {totalWeight}%
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">1. KPI Department (Sản lượng chung)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={departmentWeight}
                      onChange={(e) => setDepartmentWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">2. KPI Call - Miss call (Tỷ lệ nhỡ)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={callWeight}
                      onChange={(e) => setCallWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">3. KPI Gọi lại đúng quy định (Callback)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={callbackWeight}
                      onChange={(e) => setCallbackWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">4. KPI Freshchat (Multi-channel)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={freshchatWeight}
                      onChange={(e) => setFreshchatWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">5. KPI Ticket &amp; SLA Xử lý 4h</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={ticketWeight}
                      onChange={(e) => setTicketWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">6. KPI Fanpage (Chuyển đổi lead)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fanpageWeight}
                      onChange={(e) => setFanpageWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-primary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Thresholds */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">speed</span>
                  <h3 className="font-bold text-slate-900">Ngưỡng Mục Tiêu SLA Vận Hành</h3>
                </div>
                <span className="text-xs text-slate-400">Quy chuẩn 2026</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">Ngưỡng Miss Call tối đa</div>
                    <div className="text-xs text-slate-400">Tỷ lệ cuộc gọi nhỡ trên tổng cuộc đến</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">≤</span>
                    <input
                      type="number"
                      step="0.1"
                      value={missCallTarget}
                      onChange={(e) => setMissCallTarget(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-secondary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">FRT Freshchat mục tiêu</div>
                    <div className="text-xs text-slate-400">Thời gian phản hồi tin nhắn đầu tiên</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">≤</span>
                    <input
                      type="number"
                      value={frtTarget}
                      onChange={(e) => setFrtTarget(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-secondary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">giây</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">Tỷ lệ tuân thủ SLA 4h</div>
                    <div className="text-xs text-slate-400">Cam kết đóng ticket trong 4 giờ</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">≥</span>
                    <input
                      type="number"
                      step="0.1"
                      value={ticketSlaTarget}
                      onChange={(e) => setTicketSlaTarget(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-secondary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">Thời gian Assign mục tiêu</div>
                    <div className="text-xs text-slate-400">Giao ticket cho chuyên viên phụ trách</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">≤</span>
                    <input
                      type="number"
                      value={assignTimeTarget}
                      onChange={(e) => setAssignTimeTarget(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-right bg-slate-50 border border-slate-200 rounded font-bold text-secondary focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">phút</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Lưu Cấu Hình Mới</span>
            </button>
          </div>
        </form>
      ) : (
        /* SYNC LOGS TABLE */
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Nhật Ký Đồng Bộ Dữ Liệu T-1 (Kho Dữ Liệu CDR)</h3>
              <p className="text-xs text-slate-500">Trạng thái tự động chốt số lúc 23:59:59 của tất cả hệ thống tích hợp</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              6/6 Kết nối toàn vẹn
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Hệ thống nguồn</th>
                  <th className="py-2.5 px-3">Thời gian chốt</th>
                  <th className="py-2.5 px-3 text-right">Số bản ghi</th>
                  <th className="py-2.5 px-3 text-center">Độ trễ API</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.source}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{log.time}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{log.records}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{log.latency}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
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
}
