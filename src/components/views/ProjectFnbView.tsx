import { useState } from 'react';

interface ProjectFnbViewProps {
  onOpenExport?: () => void;
  subType?: 'fnb' | 'kat';
}

export default function ProjectFnbView({ onOpenExport, subType = 'fnb' }: ProjectFnbViewProps) {
  const [activeSegment, setActiveSegment] = useState<'fnb' | 'kat'>(subType);
  const [searchQuery, setSearchQuery] = useState('');

  const fnbTickets = [
    { id: 'FNB-9042', shop: 'The Coffee Inn - 14 Phan Chu Trinh', issue: 'Mất kết nối máy in nhiệt LAN bếp khi chia bill', status: 'Đã xử lý', agent: 'Lê Minh Tuấn', time: '10:14', impact: 'Bàn 04' },
    { id: 'FNB-9038', shop: 'Nhà hàng Lẩu Nướng Gogi Hà Đông', issue: 'Đồng bộ đơn order từ tablet nhân viên sang thu ngân bị trễ 30s', status: 'Đang theo dõi', agent: 'Trần Hữu Nghĩa', time: '11:45', impact: 'Khu A' },
    { id: 'FNB-9029', shop: 'Trà Sữa TocoToco Cần Thơ', issue: 'Cấu hình khuyến mãi Combo Mua 1 Tặng 1 giờ vàng 14h-17h', status: 'Đã xử lý', agent: 'Đỗ Hoàng Nam', time: '13:20', impact: 'Toàn quán' },
    { id: 'FNB-9015', shop: 'Quán Nhậu 79 - Ung Văn Khiêm HCM', issue: 'In tách món tự động sang 3 trạm Bếp / Nướng / Bia', status: 'Đã xử lý', agent: 'Lâm Minh Đạt', time: '15:10', impact: '3 trạm' },
    { id: 'KAT-4102', shop: 'Sky Lounge 360 - Tây Hồ', issue: 'Mở tab bàn VIP, gộp hóa đơn và tính phụ thu nhạc sống', status: 'Đã xử lý', agent: 'Nguyễn Hoàng Long', time: '21:05', impact: 'Bàn VIP 01' },
    { id: 'KAT-4098', shop: 'Rooftop Craft Beer - Quận 1', issue: 'Tích hợp thanh toán quét mã VietQR tĩnh gắn tại từng bàn', status: 'Đã xử lý', agent: 'Phạm Thị Mai Trúc', time: '22:15', impact: '18 bàn' },
  ];

  const filteredTickets = fnbTickets.filter(t => {
    const matchesSegment = activeSegment === 'fnb' ? t.id.startsWith('FNB') : t.id.startsWith('KAT') || activeSegment === 'kat';
    const matchesSearch = !searchQuery || t.shop.toLowerCase().includes(searchQuery.toLowerCase()) || t.issue.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSegment && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Phân Hệ F&amp;B &amp; Nightlife
            </span>
            <span className="flex items-center gap-1 font-code-sm text-code-sm text-secondary font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Line Chuyên Biệt 24/7
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Quản Lý Vận Hành &amp; Hỗ Trợ KiotViet FnB &amp; KAT (Bar/Lounge)
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
            Theo dõi đường truyền in bill bếp, order tại bàn, đồng bộ KDS và thanh toán tại quầy cho 18,500+ nhà hàng, quán cà phê và quán bar toàn quốc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenExport?.()}
            className="flex items-center gap-1.5 px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* SEGMENT TABS */}
      <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveSegment('fnb')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeSegment === 'fnb'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">restaurant</span>
          <span>KiotViet FnB (Nhà hàng / Quán Cafe / Trà sữa)</span>
        </button>

        <button
          onClick={() => setActiveSegment('kat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeSegment === 'kat'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">local_bar</span>
          <span>KAT (FnB / Bar / Pub / Nightlife)</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-outline text-label-sm">
            <span className="uppercase font-semibold">Cửa hàng trực tuyến</span>
            <span className="material-symbols-outlined text-primary">store</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">18,520</span>
            <span className="text-xs text-secondary font-semibold">+4.2% MoM</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đang hoạt động ca trực hôm nay</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-outline text-label-sm">
            <span className="uppercase font-semibold">Tỷ lệ FCR Giải Quyết 1 Lần</span>
            <span className="material-symbols-outlined text-secondary">verified</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-secondary tabular-nums">86.4%</span>
            <span className="text-xs text-slate-400">Target ≥ 82%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Chủ yếu xử lý cấu hình LAN máy in</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-outline text-label-sm">
            <span className="uppercase font-semibold">Thời lượng cuộc gọi AHT</span>
            <span className="material-symbols-outlined text-tertiary">timer</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">3m 35s</span>
            <span className="text-xs text-emerald-600 font-semibold">-15s tối ưu</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Đội ngũ Đà Nẵng &amp; KAT HN phụ trách</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-outline text-label-sm">
            <span className="uppercase font-semibold">Ca hỗ trợ khẩn cấp (P1)</span>
            <span className="material-symbols-outlined text-error">priority_high</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-error tabular-nums">0</span>
            <span className="text-xs text-secondary font-semibold">Ổn định</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Không có sự cố máy chủ giờ cao điểm</p>
        </div>
      </div>

      {/* TICKETS TABLE */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200 p-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div>
            <h2 className="text-headline-sm font-bold text-slate-900">
              Nhật Ký Yêu Cầu Hỗ Trợ Đang Xử Lý ({filteredTickets.length} ca)
            </h2>
            <p className="text-xs text-slate-500">Phân luồng tự động về Line 2 FnB &amp; KAT Bar/Pub</p>
          </div>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              placeholder="Tìm theo quán, mã ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Mã Ticket</th>
                <th className="py-2.5 px-3">Tên Quán &amp; Địa chỉ</th>
                <th className="py-2.5 px-4 min-w-[280px]">Vấn đề kỹ thuật</th>
                <th className="py-2.5 px-3">Khu vực ảnh hưởng</th>
                <th className="py-2.5 px-3">Kỹ thuật viên</th>
                <th className="py-2.5 px-3 text-center">Thời gian</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 font-sans">
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{t.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{t.shop}</td>
                  <td className="py-2.5 px-4 text-slate-700">{t.issue}</td>
                  <td className="py-2.5 px-3 text-slate-500">{t.impact}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{t.agent}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{t.time}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.status === 'Đã xử lý' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
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
}
