import React, { useState } from 'react';
import { outsourceStaffList, outsourceViolations } from '../../data/mockData';

interface OutsourcedStaffViewProps {
  onOpenExport: () => void;
}

export const OutsourcedStaffView: React.FC<OutsourcedStaffViewProps> = ({ onOpenExport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rateFilter, setRateFilter] = useState<'all' | 'high' | 'low'>('all');

  const filteredStaff = outsourceStaffList.filter((staff) => {
    const matchesSearch =
      !searchQuery ||
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.code.includes(searchQuery);

    const rateNum = parseFloat(staff.supportRate.replace(',', '.').replace('%', ''));
    let matchesRate = true;
    if (rateFilter === 'high') matchesRate = rateNum >= 40;
    if (rateFilter === 'low') matchesRate = rateNum < 35;

    return matchesSearch && matchesRate;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Lực Lượng Nhân Sự · Đối Tác BPO Outsource
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
              Kỳ nghiệm thu T10/2026
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2 flex-wrap">
            Báo Cáo Hiệu Suất &amp; Quản Lý Nhân Sự Outsource
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Đã chốt 15.7 Seat
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-4xl">
            Tổng hợp dữ liệu năng suất, số lượng cuộc gọi, số ticket tạo &amp; xử lý, phân bổ công việc và đối soát biên bản nghiệm thu thanh toán đối tác BPO Call &amp; Livechat.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alert('Biên bản nghiệm thu 15.7 seat (424.5 công / 27 ngày quy chuẩn) đã được xuất file PDF gửi đối tác.')}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">contract</span>
            <span>Chốt Nghiệm Thu</span>
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

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Nhân sự */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quy Mô Nhân Sự &amp; Công
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">25</span>
                <span className="text-xs text-slate-500">nhân sự</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Tổng số công: <strong className="font-mono text-slate-900">424.5 công</strong></span>
            <span>TB: <strong className="font-mono text-slate-900">17.0</strong>/NS</span>
          </div>
        </div>

        {/* Card 2: Cuộc gọi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cuộc Gọi Phục Vụ
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-primary font-mono">11,614</span>
                <span className="text-xs text-slate-500">cuộc</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>TB cuộc / công: <strong className="font-mono text-primary font-bold">41.9 cuộc</strong></span>
            <span className="text-emerald-700 font-semibold">Đạt chuẩn</span>
          </div>
        </div>

        {/* Card 3: Xử lý thành công */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Xử Lý Thành Công
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">4,449</span>
                <span className="text-xs text-slate-500">cuộc</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Tỷ lệ hỗ trợ TB: <strong className="font-mono text-emerald-700 font-bold">38.31%</strong></span>
            <span>Target: &gt;35%</span>
          </div>
        </div>

        {/* Card 4: Ticket */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Ticket Tạo &amp; Xử Lý
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">9,199</span>
                <span className="text-xs text-slate-500">vé</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
            <span>Tỷ lệ hoàn thành: <strong className="font-mono text-primary font-bold">79.21%</strong></span>
            <span>7,286 đã khép</span>
          </div>
        </div>
      </div>

      {/* Week 1 vs Week 2 Performance Comparison */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              So Sánh Hiệu Suất 2 Tuần Đầu Tháng 10/2026
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá tốc độ cải thiện sản lượng và tỷ lệ hỗ trợ giữa Tuần 1 (01-07/10) và Tuần 2 (08-14/10)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200">
            Xu hướng: Tăng trưởng tích cực
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Số công làm việc:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-slate-900">112.5 → 128.0</span>
              <span className="text-emerald-700 font-semibold font-mono text-xs">+13.8%</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Bổ sung thêm 2 NS trực ca tối</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Tổng cuộc gọi tiếp nhận:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-slate-900">4,812 → 5,420</span>
              <span className="text-emerald-700 font-semibold font-mono text-xs">+12.6%</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Giải tỏa áp lực giờ cao điểm</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Tỷ lệ hỗ trợ thành công:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-emerald-600">36.4% → 39.8%</span>
              <span className="text-emerald-700 font-semibold font-mono text-xs">+3.4%</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Nhờ đào tạo lại quy trình HĐĐT</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Ticket xử lý / ngày:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono text-primary">315 → 372</span>
              <span className="text-emerald-700 font-semibold font-mono text-xs">+18.1%</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Tốc độ assign cải thiện rõ rệt</span>
          </div>
        </div>
      </div>

      {/* 2 Split Panels: Work Category Donut & Violations Penalty Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Task Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
              Phân Bổ Loại Công Việc Đội Ngũ Outsource
            </h3>
            <span className="text-xs font-mono text-slate-400">11,614 cuộc</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">1. Tư vấn nghiệp vụ bán hàng KiotViet</span>
                <span className="font-mono font-bold text-primary">54.0% (6,271 cuộc)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '54%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">2. Hỗ trợ khác &amp; giải đáp tài khoản</span>
                <span className="font-mono font-bold text-sky-600">25.8% (2,996 cuộc)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-600 h-full" style={{ width: '25.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">3. Hóa đơn điện tử &amp; Chữ ký số CKS</span>
                <span className="font-mono font-bold text-emerald-600">12.3% (1,428 cuộc)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: '12.3%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">4. Chuyển Leads bán hàng / Nâng cấp gói</span>
                <span className="font-mono font-bold text-amber-600">2.2% (255 cuộc)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: '2.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-800">5. Tiếp nhận sự cố kỹ thuật &amp; chuyển tiếp L2</span>
                <span className="font-mono font-bold text-purple-600">5.7% (664 cuộc)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full" style={{ width: '5.7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Violations & Deductions Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">gavel</span>
              Danh Sách Nhân Sự Vi Phạm &amp; Phạt Trừ BPO (24 ca)
            </h3>
            <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              -1,200,000 đ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2 px-3 text-center w-10">STT</th>
                  <th className="py-2 px-4">Tên Nhân Sự Vi Phạm</th>
                  <th className="py-2 px-3 text-center">Số Ca Vi Phạm</th>
                  <th className="py-2 px-3 text-right">Mức Phạt (VNĐ)</th>
                  <th className="py-2 px-3 text-center">Xử Lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outsourceViolations.map((v) => (
                  <tr key={v.stt} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{v.stt}</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">{v.name}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-rose-700">{v.times} ca</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                      {v.penalty.toLocaleString()} đ
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 font-semibold">
                        Trừ quyết toán
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td className="py-2 px-3 text-center" colSpan={2}>
                    TỔNG CỘNG 6 NHÂN SỰ
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-rose-700">24 ca</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-700">1,200,000 đ</td>
                  <td className="py-2 px-3 text-center font-sans text-[11px] text-slate-600">Đã chốt trừ</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Top 5 High Performers & Needs Attention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Top 5 Nhân Sự Outsource Năng Suất Cao Nhất (Support Rate &gt; 42%)</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs pt-1 text-center">
            <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Trần Q. Nghĩa</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8612</div>
              <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">56.93%</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Bùi T.T. Ngân</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8677</div>
              <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">46.70%</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Nguyễn H. Hải</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8641</div>
              <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">45.81%</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Đinh T. Hùng</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8625</div>
              <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">44.14%</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Nguyễn T.H. Hà</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8673</div>
              <div className="font-bold font-mono text-emerald-700 text-sm mt-0.5">43.63%</div>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>Nhân Sự Cần Đào Tạo Bổ Sung Nghiệp Vụ (Support Rate &lt; 34%)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs pt-1 text-center">
            <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Vũ Thị Thuỳ Linh</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8630</div>
              <div className="font-bold font-mono text-rose-600 text-sm mt-0.5">22.79%</div>
              <div className="text-[10px] text-rose-600 font-medium">Thấp nhất</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Nguyễn T. Hà Uyên</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8671</div>
              <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">31.26%</div>
              <div className="text-[10px] text-slate-400">Chuyển line nhiều</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-2xs">
              <div className="font-bold text-slate-900 truncate">Đặng Xuân Toàn</div>
              <div className="text-[10px] text-slate-400 font-mono">MS 8642</div>
              <div className="font-bold font-mono text-amber-700 text-sm mt-0.5">31.40%</div>
              <div className="text-[10px] text-slate-400">Mới vào ca</div>
            </div>
          </div>
        </div>
      </div>

      {/* Master 25 Outsourced Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h2 className="text-base font-bold text-slate-900">
                Bảng Hiệu Suất Làm Việc Chi Tiết 25 Nhân Sự Outsource
              </h2>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                THÁNG 10/2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cơ sở nghiệm thu thanh toán số lượng chỗ ngồi (seat) và thưởng/phạt chất lượng phục vụ đối tác BPO
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên, mã số..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:bg-white w-40 sm:w-48"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
            </div>
            <select
              value={rateFilter}
              onChange={(e) => setRateFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả tỷ lệ</option>
              <option value="high">Top cao (&ge; 40%)</option>
              <option value="low">Cần lưu ý (&lt; 35%)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 min-w-[200px]">Họ Và Tên</th>
                <th className="py-2.5 px-2 text-center w-16">Mã Số</th>
                <th className="py-2.5 px-2 text-center w-16">Năm Sinh</th>
                <th className="py-2.5 px-3 text-center w-24">Ngày Vào</th>
                <th className="py-2.5 px-3 text-right">Tổng Số Công</th>
                <th className="py-2.5 px-3 text-right">Tổng Cuộc Gọi</th>
                <th className="py-2.5 px-3 text-right">Hỗ Trợ Thành Công</th>
                <th className="py-2.5 px-3 text-right">Tỷ Lệ Hỗ Trợ</th>
                <th className="py-2.5 px-3 text-right">TB Cuộc/Công</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredStaff.map((staff) => {
                const rateNum = parseFloat(staff.supportRate.replace(',', '.').replace('%', ''));
                return (
                  <tr key={staff.stt} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-center text-slate-400">{staff.stt}</td>
                    <td className="py-2 px-4 font-sans font-semibold text-slate-900">{staff.name}</td>
                    <td className="py-2 px-2 text-center text-primary font-bold">{staff.code}</td>
                    <td className="py-2 px-2 text-center text-slate-600">{staff.birthYear}</td>
                    <td className="py-2 px-3 text-center text-slate-500">{staff.startDate}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">{staff.shifts.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-slate-900">{staff.totalCalls.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{staff.successfulCalls}</td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        rateNum >= 42
                          ? 'text-emerald-700 bg-emerald-50/40'
                          : rateNum < 33
                          ? 'text-rose-600 bg-rose-50/40'
                          : 'text-slate-800'
                      }`}
                    >
                      {staff.supportRate}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800 font-semibold">{staff.avgCallPerShift}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
              <tr>
                <td className="py-2.5 px-3 text-center font-sans" colSpan={5}>
                  TỔNG CỘNG &amp; TRUNG BÌNH TOÀN ĐỘI
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-primary font-bold">424.5 công</td>
                <td className="py-2.5 px-3 text-right font-mono">11,614</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700">4,449</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700">38.31%</td>
                <td className="py-2.5 px-3 text-right font-mono">41.9 / công</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Settlement formula note */}
        <div className="p-3 bg-sky-50 rounded-lg text-xs text-slate-700 flex items-center justify-between mx-4 mb-4 border border-sky-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">calculate</span>
            <span>
              Công thức chốt nghiệm thu: <strong>424.5 công thực tế / 27 ngày công quy chuẩn = 15.72 Seat</strong> (Làm tròn nghiệm thu: <strong>15.7 Seat</strong>).
            </span>
          </div>
          <span className="font-bold text-emerald-700 uppercase tracking-tight text-[11px]">
            Đã sẵn sàng thanh toán
          </span>
        </div>
      </div>
    </div>
  );
};
