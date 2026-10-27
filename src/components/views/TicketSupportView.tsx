import React from 'react';
import { ticketDailyRecords } from '../../data/mockData';

interface TicketSupportViewProps {
  onOpenExport: () => void;
}

export const TicketSupportView: React.FC<TicketSupportViewProps> = ({ onOpenExport }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Support Ticketing System · KiotViet CSKH
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
                Chốt T-1: 22/10/2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Chi Tiết Báo Cáo Vận Hành Ticket &amp; SLA Hỗ Trợ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi thời gian xử lý, tốc độ phân phối (Assign 45p), tỷ lệ tuân thủ cam kết chất lượng SLA 4h và phân loại nguồn phát sinh.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExport}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Xuất Excel Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Scorecards with Highlighted MTD Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Ticket Trong Tháng */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Sản lượng lũy kế tháng
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Tổng Ticket Trong Tháng</div>
            </div>
            <span className="material-symbols-outlined text-primary text-[22px] p-2 bg-sky-50 rounded-lg">
              query_stats
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">16,170</span>
              <span className="text-xs text-slate-500 font-medium">ticket</span>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                MTD 10/2026
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Prominent Đạt KPI Tháng Card */}
          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between shadow-2xs mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight block">
                  Đạt KPI tháng
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span> Đạt mục tiêu
                </span>
              </div>
            </div>
            <span className="text-xl font-black text-primary font-mono">96.57%</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Trung bình ngày: <strong className="text-slate-800 font-mono">770 TK/ngày</strong></span>
            <span className="font-mono text-[11px] text-slate-400">Chốt MTD</span>
          </div>
        </div>

        {/* Card 2: SLA 4h */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                KPI 5.1 · Trọng số 20%
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Tỉ Lệ Xử Lý Đúng SLA (4h)</div>
            </div>
            <span className="material-symbols-outlined text-primary text-[22px] p-2 bg-sky-50 rounded-lg">
              timer
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">96.57%</span>
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_down</span> -1.93%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '96.57%' }}></div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Target: <strong className="text-slate-800 font-mono">98.50%</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
              Cần chú ý (-1.93%)
            </span>
          </div>
        </div>

        {/* Card 3: TB Xử Lý Ticket (Phút) */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                KPI 5.2 · Thời gian xử lý
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">TB Xử Lý Ticket (Phút)</div>
            </div>
            <span className="material-symbols-outlined text-emerald-600 text-[22px] p-2 bg-emerald-50 rounded-lg">
              speed
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">41</span>
              <span className="text-sm font-semibold text-slate-500">phút</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Đạt chuẩn
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '22.8%' }}></div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mục tiêu: <strong className="text-slate-800 font-mono">≤ 180 phút (3h)</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              Tối ưu 139 phút
            </span>
          </div>
        </div>

        {/* Card 4: Tỷ lệ Assign Trong 45p */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Điều phối · Dispatching
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Tỷ Lệ Assign Trong 45p</div>
            </div>
            <span className="material-symbols-outlined text-blue-600 text-[22px] p-2 bg-blue-50 rounded-lg">
              assignment_ind
            </span>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">71.43%</span>
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> -8.57%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '71.43%' }}></div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Target: <strong className="text-slate-800 font-mono">80.00%</strong></span>
            <span>TB Assign: <strong className="text-slate-800 font-mono">76 phút</strong></span>
          </div>
        </div>
      </div>

      {/* 21-Day Daily Breakdown Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bảng Chi Tiết Theo Dõi Vận Hành Ticket Từng Ngày (Tháng 10/2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Số liệu thực tế ghi nhận từ ngày 1 đến ngày 21/10/2026 (Chốt T-1 lúc 23:59:59)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-medium border border-sky-200">
            21 ngày báo cáo hoàn chỉnh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center">Thứ</th>
                <th className="py-2.5 px-3 text-center">Ngày</th>
                <th className="py-2.5 px-3 text-right">TK Tạo</th>
                <th className="py-2.5 px-3 text-right">TK Xử Lý</th>
                <th className="py-2.5 px-3 text-center">Tỉ Lệ Xử Lý</th>
                <th className="py-2.5 px-3 text-center">Tỉ Lệ Assign 45p</th>
                <th className="py-2.5 px-3 text-right">Thời Gian Assign</th>
                <th className="py-2.5 px-3 text-center">Tỉ Lệ Xử Lý 4H</th>
                <th className="py-2.5 px-3 text-right">Thời Gian Xử Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {ticketDailyRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 text-center font-sans text-slate-700">{r.dayName}</td>
                  <td className="py-2 px-3 text-center font-bold text-slate-900">{r.day}</td>
                  <td className="py-2 px-3 text-right text-slate-800 font-semibold">{r.created.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-slate-800 font-semibold">{r.resolved.toLocaleString()}</td>
                  <td className="py-2 px-3 text-center text-slate-600">{r.resolutionRate}</td>
                  <td
                    className={`py-2 px-3 text-center font-semibold ${
                      r.isAlertAssign ? 'text-rose-700 font-bold bg-rose-50/50' : 'text-slate-800'
                    }`}
                  >
                    {r.assign45pRate}
                  </td>
                  <td
                    className={`py-2 px-3 text-right ${
                      r.assignTimeMin > 100 ? 'text-rose-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {r.assignTimeMin}p
                  </td>
                  <td
                    className={`py-2 px-3 text-center font-semibold ${
                      parseFloat(r.sla4hRate) >= 97 ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {r.sla4hRate}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800 font-semibold">{r.handlingTimeMin}p</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary text-white font-bold">
              <tr>
                <td className="py-2.5 px-3 text-center font-sans" colSpan={2}>
                  TOTAL (MTD)
                </td>
                <td className="py-2.5 px-3 text-right">TB 770</td>
                <td className="py-2.5 px-3 text-right">TB 534</td>
                <td className="py-2.5 px-3 text-center">69.99%</td>
                <td className="py-2.5 px-3 text-center">71.43%</td>
                <td className="py-2.5 px-3 text-right">TB 76p</td>
                <td className="py-2.5 px-3 text-center">96.57%</td>
                <td className="py-2.5 px-3 text-right">TB 41p</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <h3 className="font-bold text-slate-900 text-sm">
            Kết Luận Vận Hành &amp; Khuyến Nghị Trực Ban Hỗ Trợ Ticket
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs pt-1">
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              Cải thiện tốc độ Assign (Hiện tại: 71.43%)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Các ngày đầu tuần (Thứ 2, Thứ 4) có lượng ticket tạo đột biến &gt; 1,000 ticket/ngày khiến thời gian chờ assign kéo dài đến 396 phút. Cần phân công thêm nhân sự trực phân luồng tự động lúc 08:30 - 10:30.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Thời gian xử lý đạt chuẩn xuất sắc (41 phút)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mục tiêu cam kết ≤ 180 phút (3h). Kỹ thuật viên xử lý trung bình chỉ mất 41 phút/ticket, thể hiện chuyên môn và tài liệu hướng dẫn nghiệp vụ đang hỗ trợ rất tốt.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-sky-50 border border-sky-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Dự phòng cao điểm HĐĐT - CKS
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tỷ trọng ticket HĐĐT - CKS có chu kỳ tăng vọt lên ~22% vào tháng giao thời nộp báo cáo quý. Khuyến nghị phối hợp đội PTSP chuẩn bị sẵn các kịch bản mẫu cho chatbot AI ElevenLabs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
