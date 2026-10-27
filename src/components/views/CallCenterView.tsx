import React, { useState } from 'react';
import { callDailyRecords, ivrQueuesData, agentCallRanks } from '../../data/mockData';

interface CallCenterViewProps {
  onOpenExport: () => void;
}

export const CallCenterView: React.FC<CallCenterViewProps> = ({ onOpenExport }) => {
  const [agentSearch, setAgentSearch] = useState('');
  const [forceFilter, setForceFilter] = useState<'all' | 'inhouse' | 'os' | 'top'>('all');
  const [selectedQueue, setSelectedQueue] = useState<string>('all');

  const filteredAgents = agentCallRanks.filter((agent) => {
    const matchesSearch =
      !agentSearch ||
      agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.code.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.team.toLowerCase().includes(agentSearch.toLowerCase());

    let matchesForce = true;
    if (forceFilter === 'inhouse') matchesForce = !agent.isOutsourced;
    if (forceFilter === 'os') matchesForce = !!agent.isOutsourced;
    if (forceFilter === 'top') matchesForce = agent.rank <= 3;

    return matchesSearch && matchesForce;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Kênh Vận Hành Hotline 1900 6522
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
              Chốt T-1 (22/10/2026)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Báo Cáo Vận Hành Call Center Hotline 1900 6522
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích chi tiết lưu lượng cuộc gọi, tỷ lệ nhỡ, SLA gọi lại, phân bổ Inhouse vs Đối tác OS và trợ lý ảo Voice AI.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alert('Đã đối soát 100% bản ghi CDR Asterisk với Gateway Voice AI và BPO Partner.')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">rule</span>
            <span>Đối soát CDR</span>
          </button>
          <button
            onClick={onOpenExport}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 8 Big Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Offered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Tổng Cuộc Đến (Offered)</span>
            <span className="material-symbols-outlined text-primary text-[20px]">phone_in_talk</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">4,820</span>
              <span className="text-xs font-semibold text-primary">T-1 Chốt</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Lũy kế MTD tháng:</span>
              <span className="font-mono font-bold text-slate-800">96,400 cuộc</span>
            </div>
          </div>
        </div>

        {/* 2. Served */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Đã Phục Vụ Thành Công</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">phone_callback</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">4,666</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">96.8%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.8%' }}></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Mục tiêu phục vụ: ≥95%</span>
              <span className="text-emerald-700 font-bold">Vượt chỉ tiêu</span>
            </div>
          </div>
        </div>

        {/* 3. Abandoned */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Cuộc Nhỡ (Abandoned)</span>
            <span className="material-symbols-outlined text-rose-600 text-[20px]">phone_missed</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">154</span>
              <span className="text-xs font-bold text-emerald-700">3.2% (≤5.0%)</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Đạt mục tiêu tỷ lệ nhỡ ≤ 5.0%</span>
            </div>
          </div>
        </div>

        {/* 4. Callback SLA */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Gọi Lại Đúng Hạn (&lt;30m)</span>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">ring_volume</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">87.5%</span>
              <span className="text-xs text-slate-400">Target 90%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '87.5%' }}></div>
            </div>
            <div className="mt-2 text-xs text-amber-700 font-medium flex justify-between">
              <span>Đã gọi lại: 135/154</span>
              <span>Thiếu 2.5%</span>
            </div>
          </div>
        </div>

        {/* 5. SL 80/20 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Service Level (SL 80/20)</span>
            <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">86.4%</span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">≥85% Đạt</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              86.4% cuộc gọi được nhấc máy trong vòng 20 giây đầu
            </p>
          </div>
        </div>

        {/* 6. ATT & ACW */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Đàm Thoại &amp; Wrap-up</span>
            <span className="material-symbols-outlined text-slate-400 text-[20px]">timer</span>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">2m 45s</div>
                <div className="text-[10px] text-slate-400 uppercase">Đàm thoại (ATT)</div>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div>
                <div className="text-base font-bold text-slate-900 font-mono">33s</div>
                <div className="text-[10px] text-slate-400 uppercase">Xử lý sau gọi (ACW)</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Thời gian giữ máy TB (Hold): <strong className="font-mono">12s</strong>
            </div>
          </div>
        </div>

        {/* 7. AHT */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Thời Lượng Xử Lý TB (AHT)</span>
            <span className="material-symbols-outlined text-primary text-[20px]">timelapse</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">3m 18s</span>
              <span className="text-xs text-emerald-700 font-semibold">-12s</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Tối ưu hơn mục tiêu trần 3 phút 30 giây của khối
            </p>
          </div>
        </div>

        {/* 8. QA Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-bold uppercase tracking-wider">Điểm Chất Lượng QA</span>
            <span className="material-symbols-outlined text-amber-500 text-[20px]">grade</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">92.5</span>
              <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Chấm ngẫu nhiên 350 mẫu cuộc gọi T-1 đã khép sổ
            </p>
          </div>
        </div>
      </div>

      {/* Workforce Breakdown (Inhouse vs OS vs AI) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Phân Bổ &amp; Hiệu Suất Tiếp Nhận Cuộc Gọi Theo 3 Đội Ngũ (T-1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh cơ cấu sản lượng và chỉ số phục vụ giữa Inhouse KiotViet, Đối tác OS và Voice AI Bot
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
            Tổng phục vụ: 4,666 cuộc (100%)
          </span>
        </div>

        {/* Segmented Proportional Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                Inhouse: 2,612 cuộc (56.0%)
              </span>
              <span className="flex items-center gap-1.5 text-[#0090da]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0090da]"></span>
                OS Partner: 1,586 cuộc (34.0%)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Voice AI: 468 cuộc (10.0%)
              </span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            <div className="bg-primary h-full" style={{ width: '56.0%' }} title="Inhouse KiotViet 56.0%"></div>
            <div className="bg-[#0090da] h-full" style={{ width: '34.0%' }} title="Outsourced OS 34.0%"></div>
            <div className="bg-emerald-600 h-full" style={{ width: '10.0%' }} title="Voice AI Bot 10.0%"></div>
          </div>
        </div>

        {/* 3 Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Inhouse */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center">
                  IH
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Nhân sự Inhouse (KiotViet)</h3>
                  <span className="text-[10px] text-slate-400">Kỹ thuật &amp; nghiệp vụ sâu</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold font-mono text-xs">
                56.0%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Sản lượng:</span>
                <span className="font-bold font-mono text-primary text-sm">2,612</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">AHT:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">3m 25s</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Giải quyết lần đầu:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">82.4%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">CSAT:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">96.1%</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Phụ trách: KH lớn, Retail L2, FnB nâng cao, Sự cố P1
            </div>
          </div>

          {/* OS Partner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#0090da] text-white font-bold text-xs flex items-center justify-center">
                  OS
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Nhân sự Outsourced (OS)</h3>
                  <span className="text-[10px] text-slate-400">Đối tác BPO Call &amp; Chat</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0090da]/10 text-[#0090da] font-bold font-mono text-xs">
                34.0%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Sản lượng:</span>
                <span className="font-bold font-mono text-[#0090da] text-sm">1,586</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">AHT:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">2m 58s</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Giải quyết lần đầu:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">73.2%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">CSAT:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">91.8%</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Phụ trách: Hỗ trợ chung, HĐĐT, hướng dẫn cơ bản, bước 1
            </div>
          </div>

          {/* Voice AI */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  AI
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Voice AI Bot (KiotViet)</h3>
                  <span className="text-[10px] text-slate-400">Tự động hóa cuộc gọi 24/7</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                10.0%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Tự phục vụ:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">468</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Thời gian xử lý:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">1m 15s</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Nhận diện đúng:</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">94.2%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Tiết kiệm chi phí:</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">~16.4 tr/ngày</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Tự động: Đổi pass, gia hạn, test kết nối máy in, gửi SMS HDSD
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart & Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tổng Hợp Sản Lượng Call Theo Từng Ngày (Lũy Kế 7 Ngày Gần Nhất Đến T-1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi biến động số cuộc đến, tỷ lệ phục vụ, cuộc nhỡ và chất lượng dịch vụ
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-primary bg-sky-50 px-2.5 py-1 rounded">
            Tổng 7 ngày: 30,030 cuộc (TB 4,290 / ngày)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3 text-right">Tổng Đến</th>
                <th className="py-2.5 px-3 text-right">Phục Vụ</th>
                <th className="py-2.5 px-3 text-right">Miss Call</th>
                <th className="py-2.5 px-3 text-right">Gọi Lại</th>
                <th className="py-2.5 px-3 text-right">Inhouse</th>
                <th className="py-2.5 px-3 text-right">OS Partner</th>
                <th className="py-2.5 px-3 text-right">Voice AI</th>
                <th className="py-2.5 px-3 text-right">SL 80/20</th>
                <th className="py-2.5 px-3 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {callDailyRecords.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    row.isT1 ? 'bg-sky-50/60 font-bold border-l-4 border-primary' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold">{row.date}</span>{' '}
                    <span className="text-slate-400">({row.dayName})</span>
                    {row.isT1 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-primary text-white uppercase">
                        T-1
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{row.totalOffered.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{row.served.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">{row.missCallRate}%</td>
                  <td className={`py-2.5 px-3 text-right ${row.callbackRate < 90 ? 'text-amber-700 font-bold' : 'text-emerald-700'}`}>
                    {row.callbackRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{row.inhouse.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{row.osPartner.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{row.aiBot}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{row.sl8020}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-semibold">{row.csat}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2.5 px-3 font-sans">TRUNG BÌNH TUẦN</td>
                <td className="py-2.5 px-3 text-right font-mono">4,290</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-600">4,158</td>
                <td className="py-2.5 px-3 text-right font-mono">3.0%</td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-700">89.2%</td>
                <td className="py-2.5 px-3 text-right font-mono">2,324</td>
                <td className="py-2.5 px-3 text-right font-mono">1,414</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700">420</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-600">86.8%</td>
                <td className="py-2.5 px-3 text-right font-mono">95.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5 IVR Queues Breakdown */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Phân Tích Hiệu Năng 5 Tuyến Hàng Đợi (IVR Queues - T-1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cơ cấu định tuyến phân bổ tiếp nhận giữa Inhouse, OS Partner và Voice AI
            </p>
          </div>
          <select
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="all">Tất cả hàng đợi (1 - 5)</option>
            <option value="1">Queue 1: Retail</option>
            <option value="2">Queue 2: FnB</option>
            <option value="3">Queue 3: Hardware</option>
            <option value="4">Queue 4: HĐĐT</option>
            <option value="5">Queue 5: Khẩn cấp</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-60">Hàng Đợi (IVR Key)</th>
                <th className="py-2.5 px-3 text-right">Tổng Đến</th>
                <th className="py-2.5 px-3 text-center">Phân Bổ Lực Lượng</th>
                <th className="py-2.5 px-3 text-center">AHT</th>
                <th className="py-2.5 px-3 text-center">SL (80/20)</th>
                <th className="py-2.5 px-3 text-center">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ivrQueuesData
                .filter((q) => selectedQueue === 'all' || q.id.toString() === selectedQueue)
                .map((queue) => (
                  <tr key={queue.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center">
                          {queue.id}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{queue.name}</div>
                          <div className="text-[11px] text-slate-500">{queue.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {queue.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span>IH: <strong className="text-primary">{queue.inhouse}</strong></span>
                      {' · '}
                      <span>OS: <strong className="text-[#0090da]">{queue.os}</strong></span>
                      {queue.ai > 0 && (
                        <>
                          {' · '}
                          <span>AI: <strong className="text-emerald-700">{queue.ai}</strong></span>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                      {queue.aht}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                      {queue.sl8020}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {queue.csat}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Performance Rankings Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bảng Xếp Hạng &amp; Năng Suất Điện Thoại Viên Tiêu Biểu (T-1)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng kết số lượng cuộc gọi đã nghe, thời lượng AHT, tỷ lệ xử lý cuộc gọi nhỡ và điểm QA
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="Tìm theo tên, ext, nhóm..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:bg-white w-48"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
            </div>
            <select
              value={forceFilter}
              onChange={(e) => setForceFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả lực lượng</option>
              <option value="inhouse">Inhouse KiotViet</option>
              <option value="os">OS Partner (BPO)</option>
              <option value="top">Top 3 xuất sắc</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-4 w-60">Điện Thoại Viên</th>
                <th className="py-2.5 px-3">Đội Ngũ</th>
                <th className="py-2.5 px-3">Chuyên Môn</th>
                <th className="py-2.5 px-3 text-center">Cuộc Đã Nghe</th>
                <th className="py-2.5 px-3 text-center">AHT TB</th>
                <th className="py-2.5 px-3 text-center">Xử Lý Gọi Lại</th>
                <th className="py-2.5 px-3 text-center">FCR</th>
                <th className="py-2.5 px-3 text-center">Điểm QA</th>
                <th className="py-2.5 px-3 text-center">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgents.map((agent) => (
                <tr key={agent.rank} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500 font-mono">
                    {agent.rank}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-slate-900">{agent.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      EXT: {agent.ext} · {agent.code}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        agent.isOutsourced
                          ? 'bg-[#0090da]/10 text-[#0090da]'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {agent.team}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{agent.specialty}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-primary text-sm">
                    {agent.calls}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{agent.aht}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-800">
                    {agent.callbackSuccess}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-600 font-semibold">
                    {agent.fcr}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        agent.qaScore >= 95
                          ? 'bg-emerald-50 text-emerald-700'
                          : agent.qaScore >= 90
                          ? 'bg-sky-50 text-primary'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {agent.qaScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        agent.tagType === 'excellent'
                          ? 'bg-emerald-50 text-emerald-700'
                          : agent.tagType === 'top-os'
                          ? 'bg-sky-50 text-sky-700'
                          : agent.tagType === 'warning'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {agent.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
