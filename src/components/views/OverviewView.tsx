import React from 'react';
import { kpiGroupsOverview } from '../../data/mockData';
import { NavigationTab } from '../../types';

interface OverviewViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenExport: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate, onOpenExport }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Hero */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
                Báo Cáo Tổng Hợp Điều Hành
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-mono">Snapshot T-1 (22/10/2026)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tổng Quan Hiệu Suất Vận Hành &amp; Chỉ Số KPI - Khối CSKH KiotViet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-4xl">
              Hệ thống tổng hợp chỉ số vận hành đa kênh (Call Center, Freshchat, Ticket Helpdesk), phân bổ định biên nhân lực và tiến độ hoàn thành mục tiêu chất lượng dịch vụ tháng 10/2026.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Xuất Báo Cáo</span>
            </button>
            <button
              onClick={() => onNavigate('call-center')}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">headset_mic</span>
              <span>Chi Tiết Tổng Đài</span>
            </button>
          </div>
        </div>

        {/* 4 Bento Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-slate-100">
          {/* Card 1: Tổng Điểm KPI */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Chỉ Số KPI MTD Khối
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-primary font-mono">88.6</span>
                  <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Tiến độ hoàn thành:</span>
                <span className="font-semibold text-emerald-600">Bám sát kế hoạch</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '88.6%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 2: Lực Lượng Vận Hành */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Lực Lượng Vận Hành
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">217</span>
                  <span className="text-xs text-slate-400 font-normal">/ 237 định biên</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
              <span>Inhouse: <strong className="text-slate-900">190</strong> (89.6%)</span>
              <span className="text-slate-400">·</span>
              <span>Outsource: <strong className="text-slate-900">27</strong></span>
            </div>
          </div>

          {/* Card 3: Sản Lượng Xử Lý Hôm Qua */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Sản Lượng Xử Lý (T-1)
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono">9,240</span>
                  <span className="text-xs text-slate-400 font-normal">lượt tương tác</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
              <span>Call: <strong className="text-slate-900">4,820</strong></span>
              <span>Chat: <strong className="text-slate-900">3,482</strong></span>
              <span>Ticket: <strong className="text-slate-900">938</strong></span>
            </div>
          </div>

          {/* Card 4: Tuân Thủ SLA */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tỷ Lệ Đạt SLA Toàn Khối
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono">96.57%</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Mục tiêu: 98.5%</span>
              <span className="text-amber-700 font-semibold">-1.93% Cần chú ý</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Channels Fast Switcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hotline 1900 6522 */}
        <div
          onClick={() => onNavigate('call-center')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">call</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Call Center Hotline</h3>
                <span className="font-mono text-xs text-slate-400">1900 6522</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div>
              <span className="text-slate-400 block">Cuộc đến T-1:</span>
              <span className="font-bold font-mono text-slate-900 text-base">4,820 cuộc</span>
            </div>
            <div>
              <span className="text-slate-400 block">Đã phục vụ:</span>
              <span className="font-bold font-mono text-emerald-600 text-base">96.8%</span>
            </div>
            <div>
              <span className="text-slate-400 block">Cuộc nhỡ:</span>
              <span className="font-bold font-mono text-slate-700 text-sm">154 (3.2%)</span>
            </div>
            <div>
              <span className="text-slate-400 block">AHT Trung bình:</span>
              <span className="font-bold font-mono text-slate-700 text-sm">3m 18s</span>
            </div>
          </div>
        </div>

        {/* Freshchat Multi-channel */}
        <div
          onClick={() => onNavigate('chat-freshchat')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Chat Freshchat &amp; AI</h3>
                <span className="font-mono text-xs text-slate-400">Livechat &amp; Bot</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div>
              <span className="text-slate-400 block">Lũy kế MTD:</span>
              <span className="font-bold font-mono text-slate-900 text-base">21,724 phiên</span>
            </div>
            <div>
              <span className="text-slate-400 block">KPI &lt; 1 phút:</span>
              <span className="font-bold font-mono text-emerald-600 text-base">85.84%</span>
            </div>
            <div>
              <span className="text-slate-400 block">First Response:</span>
              <span className="font-bold font-mono text-slate-700 text-sm">51.75s</span>
            </div>
            <div>
              <span className="text-slate-400 block">AI Tự phục vụ:</span>
              <span className="font-bold font-mono text-primary text-sm">6,120 phiên (99%)</span>
            </div>
          </div>
        </div>

        {/* Support Ticketing System */}
        <div
          onClick={() => onNavigate('ticket-ho-tro')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Ticket Helpdesk &amp; SLA</h3>
                <span className="font-mono text-xs text-slate-400">Escalation Queue</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div>
              <span className="text-slate-400 block">Tổng vé tháng 10:</span>
              <span className="font-bold font-mono text-slate-900 text-base">16,170 vé</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tuân thủ SLA 4h:</span>
              <span className="font-bold font-mono text-emerald-600 text-base">96.57%</span>
            </div>
            <div>
              <span className="text-slate-400 block">TB xử lý vé:</span>
              <span className="font-bold font-mono text-emerald-600 text-sm">41 phút (≤180p)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Assign 45p:</span>
              <span className="font-bold font-mono text-rose-600 text-sm">71.43% (-8.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 KPI Operational Groups Weighted Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bảng Đánh Giá 6 Nhóm Mục Tiêu KPI Khối CSKH (Trọng Số 100%)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tiêu chuẩn đánh giá hiệu suất điều hành và thưởng/phạt theo tháng 10/2026
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            Tổng Điểm Tạm Tính: 88.6 / 100
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-72">Nhóm Mục Tiêu</th>
                <th className="py-3 px-3 text-center">Trọng Số</th>
                <th className="py-3 px-3 text-center">Chỉ Tiêu Chuẩn</th>
                <th className="py-3 px-3 text-center">Thực Tế Đạt</th>
                <th className="py-3 px-3 text-center">Điểm Đóng Góp</th>
                <th className="py-3 px-4 text-center">Đánh Giá Vận Hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpiGroupsOverview.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{kpi.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{kpi.description}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                    {kpi.weight}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-600">
                    {kpi.target}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {kpi.actual}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-primary">
                    {kpi.contribution}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                        kpi.status === 'excellent'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : kpi.status === 'good'
                          ? 'bg-sky-50 text-primary border border-sky-200'
                          : kpi.status === 'improving'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {kpi.statusText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
              <tr>
                <td className="py-3 px-4 text-slate-900">TỔNG HỢP TOÀN KHỐI (100% TRỌNG SỐ)</td>
                <td className="py-3 px-3 text-center font-mono">100%</td>
                <td className="py-3 px-3 text-center font-mono">100%</td>
                <td className="py-3 px-3 text-center font-mono text-primary font-bold">88.6%</td>
                <td className="py-3 px-3 text-center font-mono text-primary font-bold">88.6 / 100</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px]">
                    Hoàn Thành Khá Tốt
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2 Key Action Bottlenecks & Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>Điểm nghẽn 1: Tỷ lệ Assign Ticket trong 45 phút (71.43% vs 80%)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Các ngày Thứ 2 và Thứ 4 đầu ca sáng (08:30 - 10:30) phát sinh đột biến trên 1,000 ticket/ngày, dẫn đến thời gian chờ phân luồng kéo dài đến 396 phút. Yêu cầu bộ phận Điều phối bố trí thêm 2 nhân sự trực phân luồng tự động.
          </p>
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Ảnh hưởng: 12 nhân sự hỗ trợ</span>
            <button
              onClick={() => onNavigate('ticket-ho-tro')}
              className="text-brand font-bold hover:underline"
            >
              Xem nhật ký ticket →
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>Điểm nghẽn 2: Bổ sung định biên Support Hà Nội &amp; Sài Gòn</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Team Support Hà Nội hiện đạt 73.1% (thiếu 7 nhân sự) và Support Sài Gòn đạt 78.6% (thiếu 6 nhân sự). Cần phối hợp phòng Nhân sự đẩy mạnh tuyển dụng và nghiệm thu thêm 2 nhân sự dự phòng từ đối tác Outsourced BPO.
          </p>
          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Định biên thiếu: 22 nhân sự</span>
            <button
              onClick={() => onNavigate('nhan-su-inhouse')}
              className="text-brand font-bold hover:underline"
            >
              Xem bảng định biên →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
