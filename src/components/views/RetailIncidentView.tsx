import { useState, useMemo } from 'react';
import { retailIncidentsSep, retailProminentBugs } from '../../data/mockData';
import { RetailIncident, RetailBug } from '../../types';

interface RetailIncidentViewProps {
  onOpenExport?: () => void;
}

export default function RetailIncidentView({ onOpenExport }: RetailIncidentViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('sep2025');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewIncidentModal, setShowNewIncidentModal] = useState<boolean>(false);
  const [newIncidentSuccess, setNewIncidentSuccess] = useState<boolean>(false);

  // Form state for creating incident
  const [formTicketId, setFormTicketId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formModule, setFormModule] = useState('Hóa đơn');
  const [formImpact, setFormImpact] = useState('15');
  const [formScope, setFormScope] = useState('Zone 1');

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return retailIncidentsSep.filter((inc) => {
      const matchSearch =
        !searchQuery ||
        inc.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.affectedModule.toLowerCase().includes(searchQuery.toLowerCase());

      const matchModule =
        selectedModule === 'all' ||
        inc.affectedModule.toLowerCase().includes(selectedModule.toLowerCase());

      return matchSearch && matchModule;
    });
  }, [searchQuery, selectedModule]);

  // Filtered bugs
  const filteredBugs = useMemo(() => {
    return retailProminentBugs.filter((bug) => {
      const matchSearch =
        !searchQuery ||
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.cause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchModule =
        selectedModule === 'all' ||
        bug.module.toLowerCase().includes(selectedModule.toLowerCase());

      const matchPriority =
        selectedPriority === 'all' ||
        bug.priority.toLowerCase() === selectedPriority.toLowerCase();

      return matchSearch && matchModule && matchPriority;
    });
  }, [searchQuery, selectedModule, selectedPriority]);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewIncidentModal(false);
    setNewIncidentSuccess(true);
    setTimeout(() => setNewIncidentSuccess(false), 3500);
  };

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      {/* BANNER & CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Báo Cáo Kỹ Thuật &amp; Vận Hành
            </span>
            <span className="flex items-center gap-1 font-code-sm text-code-sm text-secondary font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Live Status
            </span>
            <span className="text-outline text-label-sm">Snapshot T-1</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            BÁO CÁO QUẢN LÝ SỰ CỐ &amp; BUG/INCIDENT - PHÂN HỆ KIOTVIET RETAIL
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
            Theo dõi, đối soát và xử lý các sự cố hệ thống, production bug, incident diện rộng và case vận hành phát sinh trong năm 2025 &amp; đợt cao điểm Tháng 9 - Tháng 10.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => onOpenExport?.()}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Xuất Excel Báo Cáo</span>
          </button>
          <button
            onClick={() => setShowNewIncidentModal(true)}
            className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Tạo Ticket Sự Cố Mới</span>
          </button>
        </div>
      </div>

      {newIncidentSuccess && (
        <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl flex items-center justify-between text-body-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            <span>
              Đã ghi nhận sự cố mới vào Jira Service Management &amp; thông báo trực ban Escalation Queue thành công!
            </span>
          </div>
          <button onClick={() => setNewIncidentSuccess(false)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* INTERACTIVE FILTER BAR */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-space-md border border-slate-200">
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-outline">tune</span>
            <span>Bộ lọc:</span>
          </div>

          {/* Time Filter */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-9 pl-space-md pr-8 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer focus:outline-none"
            >
              <option value="sep2025">Tháng 09/2025 (Kỳ phân tích)</option>
              <option value="oct2025">Tháng 10/2025</option>
              <option value="all2025">Cả năm 2025</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-outline pointer-events-none">expand_more</span>
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-9 pl-space-md pr-8 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả Phân hệ Retail</option>
              <option value="bán hàng">Màn hình bán hàng</option>
              <option value="hóa đơn">Hóa đơn &amp; HĐĐT</option>
              <option value="tracking">Tracking &amp; Tồn kho</option>
              <option value="vận đơn">Vận đơn (Giao vận)</option>
              <option value="hàng hóa">Hàng hóa &amp; Danh mục</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-outline pointer-events-none">expand_more</span>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-9 pl-space-md pr-8 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm appearance-none cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả mức độ ưu tiên</option>
              <option value="highest">Urgent / Highest</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2 text-[18px] text-outline pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Quick Search box */}
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-space-md rounded-lg bg-surface-container text-on-surface text-body-sm focus:outline-none focus:bg-surface-container-high transition-colors"
            placeholder="Lọc ticket ID, module, lỗi..."
            type="text"
          />
        </div>
      </div>

      {/* PHẦN 1: 5 KPI CARDS TỔNG HỢP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Tổng Sự Cố Năm 2025</span>
            <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">report_problem</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">
              18 <span className="font-body-sm text-body-sm text-outline font-normal">vụ</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Gián đoạn: 9 | Bán hàng: 4 | Khác: 5
            </p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-error h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Sự Cố Trong Tháng 9</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">
              02 <span className="font-body-sm text-body-sm text-amber-700 font-medium">Major Incidents</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              RETSD-49949 (25) &amp; 49997 (53)
            </p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Bug Prod Tháng 9</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">bug_report</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">
              24 <span className="font-body-sm text-body-sm text-secondary font-medium">91.7% Xong</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">22 Triệt để · 2 Đang theo dõi</p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
            <div className="bg-secondary h-1.5" style={{ width: '91.7%' }}></div>
            <div className="bg-amber-400 h-1.5" style={{ width: '8.3%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">MTTR (Khắc Phục TB)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">
              24 <span className="font-body-sm text-body-sm text-outline font-normal">phút</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Nhanh nhất: 8p | Lâu nhất: 3h22p</p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Phạm Vi Ảnh Hưởng</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">hub</span>
            </div>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-xl text-headline-xl text-on-surface tabular-nums">
              50% <span className="font-body-sm text-body-sm text-outline font-normal">All zone</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">1 ca All-Zone | 1 ca Zone 4</p>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden flex">
            <div className="bg-error h-1.5" style={{ width: '50%' }}></div>
            <div className="bg-amber-500 h-1.5" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>

      {/* PHẦN 2 & PHẦN 3: BENTO GRID: MA TRẬN MODULE & BIỂU ĐỒ STACKED CỘT CHỒNG THEO THÁNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* PHẦN 2: BẢNG MA TRẬN SỰ CỐ NĂM 2025 - 5 cột */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Các module phát sinh sự cố năm 2025</h2>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-on-surface">Tổng 18 vụ</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Trong năm 2025 phát sinh tổng <strong className="text-on-surface font-semibold">18 sự cố</strong> trên các module nghiệp vụ như bảng bên dưới:
            </p>

            {/* Bảng Ma Trận Yellow Header */}
            <div className="overflow-x-auto rounded-lg border border-amber-300">
              <table className="w-full text-center border-collapse text-body-sm">
                <thead>
                  <tr className="bg-amber-300 text-amber-950 font-label-md text-label-md">
                    <th className="py-2 px-space-sm uppercase tracking-wide font-headline-sm text-headline-sm font-bold" colSpan={8}>
                      SỰ CỐ 2025
                    </th>
                  </tr>
                  <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant">
                    <th className="py-2.5 px-space-xs text-left pl-3 font-semibold">MODULE</th>
                    <th className="py-2.5 px-1 font-semibold">Gián đoạn</th>
                    <th className="py-2.5 px-1 font-semibold">Tracking</th>
                    <th className="py-2.5 px-1 font-semibold">Vận đơn</th>
                    <th className="py-2.5 px-1 font-semibold">Import/Export</th>
                    <th className="py-2.5 px-1 font-semibold">Bán hàng</th>
                    <th className="py-2.5 px-1 font-semibold">HĐ điện tử</th>
                    <th className="py-2.5 px-2 bg-emerald-100 text-emerald-900 font-bold">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-surface-container-low hover:bg-surface-container-high transition-colors font-headline-sm text-headline-sm text-on-surface">
                    <td className="py-3 px-space-xs text-left pl-3 font-label-sm text-label-sm uppercase text-outline font-semibold">SỐ LƯỢNG</td>
                    <td className="py-3 px-1 text-error font-bold tabular-nums">9</td>
                    <td className="py-3 px-1 tabular-nums">2</td>
                    <td className="py-3 px-1 tabular-nums">1</td>
                    <td className="py-3 px-1 tabular-nums">1</td>
                    <td className="py-3 px-1 text-primary font-bold tabular-nums">4</td>
                    <td className="py-3 px-1 tabular-nums">1</td>
                    <td className="py-3 px-2 bg-emerald-50 text-emerald-800 font-headline-md text-headline-md font-bold tabular-nums">18</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Breakdown thanh phân bổ % tỷ trọng */}
            <div className="mt-space-md space-y-space-xs">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span>Cơ cấu tỷ trọng phân bổ</span>
                <span>100% (18/18 sự cố)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex">
                <div className="bg-red-500" style={{ width: '50%' }} title="Gián đoạn: 50%"></div>
                <div className="bg-primary" style={{ width: '22.2%' }} title="Màn hình bán hàng: 22.2%"></div>
                <div className="bg-amber-500" style={{ width: '11.1%' }} title="Tracking: 11.1%"></div>
                <div className="bg-indigo-500" style={{ width: '5.6%' }} title="Vận đơn: 5.6%"></div>
                <div className="bg-teal-500" style={{ width: '5.6%' }} title="Import/Export: 5.6%"></div>
                <div className="bg-emerald-500" style={{ width: '5.6%' }} title="HĐ điện tử: 5.6%"></div>
              </div>
              <div className="grid grid-cols-2 gap-space-xs pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>Gián đoạn hệ thống (50%)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>Màn hình bán hàng (22.2%)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>Tracking &amp; Thẻ kho (11.1%)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>HĐĐT &amp; Vận đơn (16.7%)</div>
              </div>
            </div>
          </div>

          <div className="mt-space-md p-space-sm rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface-variant flex items-start gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <span>Module Gián đoạn chiếm 50% sự cố toàn năm, chủ yếu do hạ tầng Cloud/Zone cần đồng bộ định kỳ lúc đêm muộn.</span>
          </div>
        </div>

        {/* PHẦN 3: BIỂU ĐỒ STACKED BAR CHART CỘT CHỒNG THEO TỪNG THÁNG - 7 cột */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">3. Biểu đồ Bug &amp; Case phát sinh trong năm 2025 theo tháng</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Phân cấp theo mức độ ưu tiên: Urgent, High, Medium, Low (Tháng 1 - Tháng 10)</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-space-sm flex-wrap font-label-sm text-label-sm">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-600"></span>Urgent</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-500"></span>High</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500"></span>Medium</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sky-600"></span>Low</span>
              </div>
            </div>

            {/* SVG Stacked Bar Chart */}
            <div className="w-full h-64 relative mt-space-md">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                {/* Grid Lines Y */}
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="20" y2="20"></line>
                <text className="font-code-sm text-[10px] fill-outline" textAnchor="end" x="30" y="24">35</text>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="70" y2="70"></line>
                <text className="font-code-sm text-[10px] fill-outline" textAnchor="end" x="30" y="74">25</text>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="120" y2="120"></line>
                <text className="font-code-sm text-[10px] fill-outline" textAnchor="end" x="30" y="124">15</text>
                <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="3 3" x1="40" x2="680" y1="170" y2="170"></line>
                <text className="font-code-sm text-[10px] fill-outline" textAnchor="end" x="30" y="174">5</text>
                <line className="text-outline-variant" stroke="currentColor" x1="40" x2="680" y1="200" y2="200"></line>

                {/* T1 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="15" rx="1" width="34" x="55" y="110"></rect>
                  <rect fill="#d97706" height="45" rx="1" width="34" x="55" y="125"></rect>
                  <rect fill="#ea580c" height="20" rx="1" width="34" x="55" y="170"></rect>
                  <rect fill="#dc2626" height="10" rx="1" width="34" x="55" y="190"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="72" y="102">18</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="72" y="216">T1</text>
                </g>

                {/* T2 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="15" rx="1" width="34" x="115" y="125"></rect>
                  <rect fill="#d97706" height="40" rx="1" width="34" x="115" y="140"></rect>
                  <rect fill="#ea580c" height="15" rx="1" width="34" x="115" y="180"></rect>
                  <rect fill="#dc2626" height="5" rx="1" width="34" x="115" y="195"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="132" y="117">15</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="132" y="216">T2</text>
                </g>

                {/* T3 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="15" rx="1" width="34" x="175" y="90"></rect>
                  <rect fill="#d97706" height="55" rx="1" width="34" x="175" y="105"></rect>
                  <rect fill="#ea580c" height="25" rx="1" width="34" x="175" y="160"></rect>
                  <rect fill="#dc2626" height="15" rx="1" width="34" x="175" y="185"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="192" y="82">22</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="192" y="216">T3</text>
                </g>

                {/* T4 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="20" rx="1" width="34" x="235" y="105"></rect>
                  <rect fill="#d97706" height="50" rx="1" width="34" x="235" y="125"></rect>
                  <rect fill="#ea580c" height="20" rx="1" width="34" x="235" y="175"></rect>
                  <rect fill="#dc2626" height="5" rx="1" width="34" x="235" y="195"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="252" y="97">19</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="252" y="216">T4</text>
                </g>

                {/* T5 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="20" rx="1" width="34" x="295" y="75"></rect>
                  <rect fill="#d97706" height="55" rx="1" width="34" x="295" y="95"></rect>
                  <rect fill="#ea580c" height="30" rx="1" width="34" x="295" y="150"></rect>
                  <rect fill="#dc2626" height="20" rx="1" width="34" x="295" y="180"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="312" y="67">25</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="312" y="216">T5</text>
                </g>

                {/* T6 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="20" rx="1" width="34" x="355" y="60"></rect>
                  <rect fill="#d97706" height="70" rx="1" width="34" x="355" y="80"></rect>
                  <rect fill="#ea580c" height="35" rx="1" width="34" x="355" y="150"></rect>
                  <rect fill="#dc2626" height="15" rx="1" width="34" x="355" y="185"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="372" y="52">28</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="372" y="216">T6</text>
                </g>

                {/* T7 (Cao điểm hè) */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="25" rx="1" width="34" x="415" y="45"></rect>
                  <rect fill="#d97706" height="65" rx="1" width="34" x="415" y="70"></rect>
                  <rect fill="#ea580c" height="40" rx="1" width="34" x="415" y="135"></rect>
                  <rect fill="#dc2626" height="25" rx="1" width="34" x="415" y="175"></rect>
                  <text className="font-label-sm text-[10px] fill-error font-bold" textAnchor="middle" x="432" y="37">31</text>
                  <text className="font-label-sm text-[11px] fill-outline font-bold" textAnchor="middle" x="432" y="216">T7</text>
                </g>

                {/* T8 */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="20" rx="1" width="34" x="475" y="80"></rect>
                  <rect fill="#d97706" height="60" rx="1" width="34" x="475" y="100"></rect>
                  <rect fill="#ea580c" height="30" rx="1" width="34" x="475" y="160"></rect>
                  <rect fill="#dc2626" height="10" rx="1" width="34" x="475" y="190"></rect>
                  <text className="font-label-sm text-[10px] fill-on-surface font-semibold" textAnchor="middle" x="492" y="72">24</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="492" y="216">T8</text>
                </g>

                {/* T9 (Hiện tại) */}
                <g className="transition-all hover:opacity-80 cursor-pointer">
                  <rect fill="#0284c7" height="20" rx="1" width="34" x="535" y="95"></rect>
                  <rect fill="#d97706" height="50" rx="1" width="34" x="535" y="115"></rect>
                  <rect fill="#ea580c" height="25" rx="1" width="34" x="535" y="165"></rect>
                  <rect fill="#dc2626" height="10" rx="1" width="34" x="535" y="190"></rect>
                  <text className="font-label-sm text-[10px] fill-primary font-bold" textAnchor="middle" x="552" y="87">21</text>
                  <text className="font-label-sm text-[11px] fill-primary font-bold" textAnchor="middle" x="552" y="216">T9 (Nay)</text>
                </g>

                {/* T10 */}
                <g className="transition-all hover:opacity-80 cursor-pointer opacity-75">
                  <rect fill="#0284c7" height="15" rx="1" width="34" x="595" y="120"></rect>
                  <rect fill="#d97706" height="40" rx="1" width="34" x="595" y="135"></rect>
                  <rect fill="#ea580c" height="20" rx="1" width="34" x="595" y="175"></rect>
                  <rect fill="#dc2626" height="5" rx="1" width="34" x="595" y="195"></rect>
                  <text className="font-label-sm text-[10px] fill-outline font-semibold" textAnchor="middle" x="612" y="112">16*</text>
                  <text className="font-label-sm text-[11px] fill-outline" textAnchor="middle" x="612" y="216">T10</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="grid grid-cols-4 gap-space-sm pt-space-sm bg-surface-container-low p-space-sm rounded-lg mt-space-sm text-center">
            <div>
              <div className="font-label-sm text-label-sm text-error font-medium">Urgent (Khẩn)</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">8.4%</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-amber-700 font-medium">High (Cao)</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">21.2%</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-amber-600 font-medium">Medium (Vừa)</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">52.8%</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-primary font-medium">Low (Thấp)</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold tabular-nums">17.6%</div>
            </div>
          </div>
        </div>
      </div>

      {/* PHẦN 4: BẢNG SỰ CỐ NỔI BẬT TRONG THÁNG (Incidents) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-3 h-3 rounded-full bg-error animate-pulse"></div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Danh sách sự cố phát sinh trong tháng 9 (Incidents)</h2>
            <span className="px-space-xs py-0.5 rounded-full bg-error-container text-error font-code-sm text-code-sm font-semibold">
              2 ca nghiêm trọng
            </span>
          </div>
          <div className="font-body-sm text-body-sm text-outline">
            Thời gian ghi nhận: 01/09/2025 - 30/09/2025
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-sm text-center w-12">STT</th>
                <th className="py-3 px-space-sm w-16">Ngày</th>
                <th className="py-3 px-space-sm w-20">Tháng</th>
                <th className="py-3 px-space-md min-w-[220px]">Vấn đề sự cố</th>
                <th className="py-3 px-space-sm w-32">Ảnh hưởng trên</th>
                <th className="py-3 px-space-sm w-24">Giao diện</th>
                <th className="py-3 px-space-sm text-center w-16">Impact</th>
                <th className="py-3 px-space-sm w-20">Tuyên bố</th>
                <th className="py-3 px-space-sm w-20">Xử lý xong</th>
                <th className="py-3 px-space-sm w-36">Tổng thời gian</th>
                <th className="py-3 px-space-sm w-24">Phạm vi</th>
                <th className="py-3 px-space-sm w-32">Số ticket</th>
                <th className="py-3 px-space-md min-w-[260px]">Nguyên nhân sự cố</th>
                <th className="py-3 px-space-sm text-center w-36">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => (
                <tr key={inc.ticketId} className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                  <td className="py-3 px-space-sm text-center font-code-sm text-outline tabular-nums">{inc.stt}</td>
                  <td className="py-3 px-space-sm font-semibold tabular-nums">{inc.day}</td>
                  <td className="py-3 px-space-sm text-on-surface-variant">{inc.month}</td>
                  <td className="py-3 px-space-md font-semibold text-primary">{inc.issue}</td>
                  <td className="py-3 px-space-sm">
                    <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-label-sm">
                      {inc.affectedModule}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm">{inc.interface}</td>
                  <td className="py-3 px-space-sm text-center">
                    <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded tabular-nums">
                      {inc.impact}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm font-code-sm text-code-sm">{inc.reportedTime}</td>
                  <td className="py-3 px-space-sm font-code-sm text-code-sm">{inc.resolvedTime}</td>
                  <td className="py-3 px-space-sm font-semibold text-amber-700">{inc.totalTime}</td>
                  <td className="py-3 px-space-sm">
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      inc.scope === 'All zone' ? 'bg-error-container text-error' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {inc.scope}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm">
                    <span className="font-code-sm text-code-sm text-primary font-semibold flex items-center gap-0.5">
                      {inc.ticketId}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-on-surface-variant text-[13px] leading-relaxed">
                    {inc.cause}
                  </td>
                  <td className="py-3 px-space-sm text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHẦN 5: BẢNG CÁC BUG NỔI CỘM TRONG THÁNG (Production Bugs) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Các bug nổi cộm giai đoạn 03/09 - 15/09 (Production Bugs)</h2>
            <span className="px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-semibold">
              5 bugs chính
            </span>
          </div>
          <div className="font-body-sm text-body-sm text-outline">
            Nguồn trích xuất: Jira Service Management &amp; Retail Escalation Queue
          </div>
        </div>

        {/* 9 Cột Chuẩn Theo Ảnh Gốc */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3 px-space-sm text-center w-12">STT</th>
                <th className="py-3 px-space-sm w-32">Ticket</th>
                <th className="py-3 px-space-sm min-w-[140px]">Ngày tạo</th>
                <th className="py-3 px-space-md min-w-[280px]">Vấn đề</th>
                <th className="py-3 px-space-sm text-center w-16">Impact</th>
                <th className="py-3 px-space-sm text-center w-28">Độ ưu tiên</th>
                <th className="py-3 px-space-sm text-center w-36">Trạng thái</th>
                <th className="py-3 px-space-sm w-28">Modun</th>
                <th className="py-3 px-space-sm w-32">Loại ticket</th>
                <th className="py-3 px-space-md min-w-[300px]">Nguyên nhân</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBugs.map((bug) => (
                <tr key={bug.ticketId} className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                  <td className="py-3 px-space-sm text-center font-code-sm text-outline tabular-nums">{bug.stt}</td>
                  <td className="py-3 px-space-sm">
                    <span className="font-code-sm text-code-sm text-primary font-semibold flex items-center gap-0.5">
                      {bug.ticketId}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </span>
                  </td>
                  <td className="py-3 px-space-sm font-code-sm text-code-sm text-on-surface-variant">{bug.createdDate}</td>
                  <td className="py-3 px-space-md font-medium text-on-surface">
                    {bug.title}
                  </td>
                  <td className="py-3 px-space-sm text-center">
                    <span className={`px-2 py-0.5 rounded font-semibold tabular-nums ${
                      bug.impact > 20 ? 'bg-red-100 text-red-800' : 'bg-surface-container text-on-surface'
                    }`}>
                      {bug.impact}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm text-center">
                    <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                      bug.priority === 'Highest' ? 'bg-red-100 text-error font-bold' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {bug.priority}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-label-sm text-label-sm font-medium">
                      {bug.status}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm">
                      {bug.module}
                    </span>
                  </td>
                  <td className="py-3 px-space-sm">
                    <span className={`px-2 py-0.5 rounded font-code-sm text-code-sm font-medium ${
                      bug.type === 'Incident' ? 'bg-amber-100 text-amber-900' : 'bg-red-50 text-error'
                    }`}>
                      {bug.type}
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-on-surface-variant text-[13px] leading-relaxed">
                    {bug.cause}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHẦN 6: TÌNH HÌNH CÁC CASE VẬN HÀNH NỔI BẬT TRONG THÁNG (4 Cards) */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">3. Tình hình các Case vận hành &amp; nghiệp vụ nổi bật trong tháng</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Thống kê các nhóm câu hỏi và nghiệp vụ cửa hàng Retail phát sinh tần suất cao</p>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-label-sm text-label-sm text-outline">Tỷ lệ xử lý FCR:</span>
            <span className="font-code-sm text-code-sm font-bold text-secondary tabular-nums">88.4%</span>
          </div>
        </div>

        {/* 4 Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Case 1 */}
          <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between border border-slate-200">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-primary font-bold">CASE CS-8821</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold tabular-nums">142 lượt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">
                Kết nối máy in nhiệt Bluetooth trên App Android 14
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Do cập nhật quyền Nearby Devices của Android 14 dẫn đến một số dòng máy in hóa đơn Xprinter/Birch không tự động ghép nối.
              </p>
            </div>
            <div className="pt-space-md space-y-space-xs border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                <span>Giải pháp:</span>
                <span className="text-secondary font-medium">Đã xuất bản Wiki &amp; Video</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">Đội ngũ CSKH hỗ trợ hướng dẫn bật quyền trực tiếp qua Ultraviewer.</div>
            </div>
          </div>

          {/* Case 2 */}
          <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between border border-slate-200">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-primary font-bold">CASE CS-8815</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold tabular-nums">89 lượt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">
                Kiểm kho lệch giữa phiên POS Offline &amp; Kho Online
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Xảy ra khi điểm bán hàng mất internet, thu ngân tiếp tục quét mã tạo đơn, dẫn đến tồn kho tạm thời chưa đồng bộ lên Cloud Retail.
              </p>
            </div>
            <div className="pt-space-md space-y-space-xs border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                <span>Giải pháp:</span>
                <span className="text-secondary font-medium">Auto-Sync Retry Queue</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">Đã cấu hình tính năng tự động đẩy dữ liệu khi đường truyền mạng hồi phục.</div>
            </div>
          </div>

          {/* Case 3 */}
          <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between border border-slate-200">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-primary font-bold">CASE CS-8790</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold tabular-nums">114 lượt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">
                Hóa đơn điện tử máy tính tiền Thông tư 78 mini-mart
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Nhu cầu tích hợp ký số HSM tập trung và truyền nhận dữ liệu trực tiếp sang Cơ quan Thuế cho các chuỗi bách hóa &amp; siêu thị bán lẻ.
              </p>
            </div>
            <div className="pt-space-md space-y-space-xs border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                <span>Giải pháp:</span>
                <span className="text-primary font-medium">Chuyển Squad Chuyên Trách</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">Đã kích hoạt quy trình hướng dẫn đấu nối chứng thư số theo lô.</div>
            </div>
          </div>

          {/* Case 4 */}
          <div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between border border-slate-200">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-primary font-bold">CASE CS-8742</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold tabular-nums">67 lượt</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">
                Đổi mẫu in mã vạch 3 tem cho shop Thời trang phụ kiện
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Khách hàng mong muốn căn chỉnh lề in và thêm thông tin xuất xứ/chất liệu vải trực tiếp lên con tem giấy in barcode 35x22mm.
              </p>
            </div>
            <div className="pt-space-md space-y-space-xs border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                <span>Giải pháp:</span>
                <span className="text-secondary font-medium">Template Studio Retail</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">Tối ưu sẵn 3 mẫu tem thời trang phổ biến trên mục Cài đặt in KiotViet.</div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW INCIDENT MODAL */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">add_alert</span>
                </span>
                <h3 className="text-headline-sm font-bold text-slate-900">Tạo Ticket Sự Cố / Bug Mới</h3>
              </div>
              <button
                onClick={() => setShowNewIncidentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mã Ticket (Jira / RETSD)</label>
                <input
                  type="text"
                  required
                  placeholder="vd: RETSD-50125"
                  value={formTicketId}
                  onChange={(e) => setFormTicketId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mô tả tóm tắt sự cố</label>
                <input
                  type="text"
                  required
                  placeholder="vd: [Bán hàng] Lỗi không quét được mã vạch barcode 1D..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Module ảnh hưởng</label>
                  <select
                    value={formModule}
                    onChange={(e) => setFormModule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  >
                    <option>Hóa đơn</option>
                    <option>Màn hình bán hàng</option>
                    <option>Tracking &amp; Kho</option>
                    <option>Hóa đơn điện tử</option>
                    <option>Vận đơn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Số lượt Impact</label>
                  <input
                    type="number"
                    value={formImpact}
                    onChange={(e) => setFormImpact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phạm vi Zone</label>
                <select
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                >
                  <option>Zone 1 (HN Primary)</option>
                  <option>Zone 2 (HCM)</option>
                  <option>Zone 3 (Đà Nẵng)</option>
                  <option>Zone 4 (Cần Thơ / Disaster Backup)</option>
                  <option>All zone (Toàn quốc)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm"
                >
                  Tạo Sự Cố &amp; Báo Động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
