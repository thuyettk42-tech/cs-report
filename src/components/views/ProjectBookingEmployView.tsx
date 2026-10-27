import { useState } from 'react';

interface ProjectBookingEmployViewProps {
  onOpenExport?: () => void;
  subType?: 'booking' | 'employ';
}

export default function ProjectBookingEmployView({
  onOpenExport,
  subType = 'booking',
}: ProjectBookingEmployViewProps) {
  const [activeSegment, setActiveSegment] = useState<'booking' | 'employ'>(subType);
  const [searchQuery, setSearchQuery] = useState('');

  const bookingTickets = [
    { id: 'BKG-1022', hotel: 'Khách sạn Moonlight Boutique - Đà Nẵng', issue: 'Đồng bộ giá phòng và tồn kho phòng đôi với Agoda & Booking.com bị lệch 1 phòng', status: 'Đã giải quyết', agent: 'Lê Minh Tuấn', date: '22/10/2026' },
    { id: 'BKG-1019', hotel: 'Homestay Rừng Thông - Đà Lạt', issue: 'Tự động tính phụ thu check-in sớm trước 14:00 và khách thêm người', status: 'Đã giải quyết', agent: 'Trần Hữu Nghĩa', date: '22/10/2026' },
    { id: 'BKG-1014', hotel: 'Resort Biển Xanh - Mũi Né', issue: 'In phiếu tạm tính minibar và dịch vụ giặt là gộp chung folio phòng', status: 'Đang xử lý', agent: 'Phạm Thị Mai Trúc', date: '21/10/2026' },
  ];

  const employTickets = [
    { id: 'EMP-5041', company: 'Chuỗi Cửa Hàng Thời Trang Eva de Eva', issue: 'Cấu hình thiết bị chấm công nhận diện khuôn mặt kết nối API tổng', status: 'Đã giải quyết', agent: 'Vũ Quốc Dũng', date: '22/10/2026' },
    { id: 'EMP-5038', company: 'Công ty TNHH Vận Tải & Kho Bãi KSHIP', issue: 'Tính công tăng ca ngày lễ x2.0 và phụ cấp ca đêm 30%', status: 'Đã giải quyết', agent: 'Trịnh Huy Hoàng', date: '21/10/2026' },
    { id: 'EMP-5029', company: 'Hệ Thống Nhà Hàng Vua Cua Sài Gòn', issue: 'Xuất bảng chốt công kỳ lương tháng 10 cho 320 nhân sự part-time', status: 'Đang xử lý', agent: 'Nguyễn Kiều Trang', date: '20/10/2026' },
  ];

  const currentList = activeSegment === 'booking' ? bookingTickets : employTickets;
  const filteredList = currentList.filter(item => {
    return !searchQuery || JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Phân Hệ Khách Sạn &amp; Nhân Sự
            </span>
            <span className="flex items-center gap-1 font-code-sm text-code-sm text-secondary font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Đồng bộ OTA &amp; HRM
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Quản Lý Vận Hành KiotViet Booking &amp; KiotViet Employ
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
            Theo dõi phân hệ đặt phòng khách sạn (OTA Channel Manager, Room folio, Minibar) và quản lý nhân sự (Chấm công GPS, Bảng lương, Đơn từ).
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

      {/* SEGMENT TOGGLE */}
      <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveSegment('booking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeSegment === 'booking'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">hotel</span>
          <span>KiotViet Booking (Khách sạn / Homestay / OTA Channel Manager)</span>
        </button>

        <button
          onClick={() => setActiveSegment('employ')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-sm transition-all ${
            activeSegment === 'employ'
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
          <span>KiotViet Employ (Chấm công / Tính lương / HRM Doanh nghiệp)</span>
        </button>
      </div>

      {/* METRIC HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="text-outline text-label-sm uppercase font-semibold">
            {activeSegment === 'booking' ? 'Khách sạn đang dùng' : 'Doanh nghiệp dùng Employ'}
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">
            {activeSegment === 'booking' ? '4,620' : '8,950'}
          </div>
          <p className="text-xs text-secondary font-medium mt-1">Tỷ lệ gia hạn hợp đồng: 96.8%</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="text-outline text-label-sm uppercase font-semibold">Tỷ lệ phản hồi đúng hạn</div>
          <div className="text-3xl font-bold text-secondary mt-2 tabular-nums">98.5%</div>
          <p className="text-xs text-slate-500 mt-1">Cam kết SLA dưới 30 phút</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="text-outline text-label-sm uppercase font-semibold">
            {activeSegment === 'booking' ? 'Đơn đặt phòng OTA / ngày' : 'Lượt chấm công GPS / ngày'}
          </div>
          <div className="text-3xl font-bold text-primary mt-2 tabular-nums">
            {activeSegment === 'booking' ? '32,400' : '142,500'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Kết nối 2-way sync ổn định 99.98%</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
          <div className="text-outline text-label-sm uppercase font-semibold">Sự cố khẩn cấp (P1)</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2 tabular-nums">0 ca</div>
          <p className="text-xs text-slate-500 mt-1">Toàn bộ hạ tầng hoạt động an toàn</p>
        </div>
      </div>

      {/* TICKETS LIST */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-200 p-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div>
            <h2 className="text-headline-sm font-bold text-slate-900">
              Danh Sách Yêu Cầu Hỗ Trợ Chuyên Biệt ({filteredList.length} ca)
            </h2>
            <p className="text-xs text-slate-500">
              {activeSegment === 'booking' ? 'Hỗ trợ nghiệp vụ quản lý phòng và API đối tác OTA' : 'Hỗ trợ tính lương, ca kíp và phần mềm chấm công'}
            </p>
          </div>
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Mã Ticket</th>
                <th className="py-2.5 px-3">{activeSegment === 'booking' ? 'Khách Sạn / Homestay' : 'Khách Hàng Doanh Nghiệp'}</th>
                <th className="py-2.5 px-4 min-w-[300px]">Nội dung yêu cầu</th>
                <th className="py-2.5 px-3">Chuyên viên phụ trách</th>
                <th className="py-2.5 px-3 text-center">Ngày tạo</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{item.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.hotel || item.company}</td>
                  <td className="py-2.5 px-4 text-slate-700">{item.issue}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{item.agent}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">{item.date}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.status.includes('giải quyết') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
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
