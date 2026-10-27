import React, { useState } from 'react';
import { inhouseSummaryRows, inhouseStaffDirectory } from '../../data/mockData';
import { InhouseStaffMember } from '../../types';

interface InhouseStaffViewProps {
  onOpenExport: () => void;
}

export const InhouseStaffView: React.FC<InhouseStaffViewProps> = ({ onOpenExport }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [summarySearch, setSummarySearch] = useState('');
  const [showImgModal, setShowImgModal] = useState(false);

  // Filter summary table
  const filteredSummaryRows = inhouseSummaryRows.filter((row) => {
    if (row.isTotalRow || row.isAllCenterRow) return true;
    const matchesSearch = !summarySearch || row.team.toLowerCase().includes(summarySearch.toLowerCase());
    let matchesRegion = true;
    if (regionFilter === 'north') {
      matchesRegion = row.team.toLowerCase().includes('hà nội') || row.team.toLowerCase().includes('miền bắc');
    } else if (regionFilter === 'central') {
      matchesRegion = row.team.toLowerCase().includes('đà nẵng') || row.team.toLowerCase().includes('miền trung');
    } else if (regionFilter === 'south') {
      matchesRegion =
        row.team.toLowerCase().includes('sài gòn') ||
        row.team.toLowerCase().includes('cần thơ') ||
        row.team.toLowerCase().includes('miền nam');
    }
    return matchesSearch && matchesRegion;
  });

  // Filter staff directory
  const filteredStaff = inhouseStaffDirectory.filter((member: InhouseStaffMember) => {
    const matchesTeam = selectedTeam === 'all' || member.teamCode === selectedTeam;
    const matchesSearch =
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.ext.includes(searchQuery) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !levelFilter || member.level.toLowerCase().includes(levelFilter.toLowerCase());
    const matchesLine = !lineFilter || member.line.toLowerCase().includes(lineFilter.toLowerCase());

    return matchesTeam && matchesSearch && matchesLevel && matchesLine;
  });

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Lực Lượng Nhân Sự · Nhân Sự Inhouse
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
              Snapshot T-1 (22/10/2026)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2 flex-wrap">
            Quản Lý &amp; Định Biên Nhân Sự Inhouse - Trung Tâm CSKH KiotViet
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              11 Đội ngũ Inhouse
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-4xl">
            Theo dõi định biên nhân sự, tỷ lệ lấp đầy, phân bổ cơ cấu cấp bậc và danh bạ hỗ trợ đa kênh theo từng Team vận hành CSKH KiotViet (Retail, FnB, Bar KAT, KSHIP, Hardware, AI).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowImgModal(!showImgModal)}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">photo_library</span>
            <span>Đối soát ảnh gốc</span>
          </button>
          <button
            onClick={onOpenExport}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => alert('Hệ thống đang mở form tiếp nhận yêu cầu tuyển dụng bổ sung định biên.')}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Thêm nhân sự mới</span>
          </button>
        </div>
      </div>

      {/* 3 Top Summary Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Tổng Thực tế Inhouse */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tổng Thực tế Inhouse
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-primary font-mono">190</span>
                <span className="text-xs text-slate-400 font-normal">/ 212 định biên</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">
                Tỷ lệ lấp đầy: <strong className="text-primary font-mono font-bold">89.62%</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[11px]">
                Thiếu 22 NS
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '89.62%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Cơ cấu Cấp bậc */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cơ cấu Cấp bậc
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">5</span>
                <span className="text-xs text-slate-400 font-normal">nhóm vai trò</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">1 MAN</span>
            <span className="px-2 py-0.5 rounded bg-sky-100 text-primary">11 Leader</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">7 Nội bộ</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">152 Chính thức</span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700">19 Thử việc</span>
          </div>
        </div>

        {/* KPI 3: Thâm niên Trung bình */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Thâm niên Trung bình
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">1.8</span>
                <span className="text-xs text-slate-600 font-medium">năm kinh nghiệm</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">history_edu</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>&lt; 6 tháng (22%)</span>
              <span>1 - 2 năm (48%)</span>
              <span>&gt; 2 năm (30%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div className="bg-slate-300 h-full" style={{ width: '22%' }}></div>
              <div className="bg-primary h-full" style={{ width: '48%' }}></div>
              <div className="bg-emerald-600 h-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference Image Modal Drawer */}
      {showImgModal && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Bảng dữ liệu chốt số gốc từ HRM KiotViet</h3>
            <button
              onClick={() => setShowImgModal(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toàn bộ 16 dòng dữ liệu bên dưới được tính toán tự động khớp 100% với báo cáo định biên vận hành thực tế. Tỷ lệ lấp đầy hiển thị chênh lệch để bộ phận Tuyển dụng kịp thời bổ sung nhân sự cho các nhóm thiếu hụt (Support HN thiếu 7, Support SG thiếu 6).
          </p>
        </div>
      )}

      {/* SECTION 1: MASTER SUMMARY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px] uppercase">
                BÁO CÁO TỔNG HỢP
              </span>
              <span className="font-mono text-xs text-slate-400">BẢNG DỮ LIỆU ĐỊNH BIÊN T-1</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              BẢNG TỔNG HỢP ĐỊNH BIÊN &amp; CƠ CẤU NHÂN SỰ THEO CẤP BẬC
            </h2>
            <p className="text-xs text-slate-500">
              Phân rã kế hoạch định biên so với thực tế và cơ cấu 5 cấp bậc theo từng Team CSKH KiotViet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả Vùng miền</option>
              <option value="north">Miền Bắc (Hà Nội)</option>
              <option value="central">Miền Trung (Đà Nẵng)</option>
              <option value="south">Miền Nam (Sài Gòn - Cần Thơ)</option>
            </select>
            <div className="relative">
              <input
                type="text"
                value={summarySearch}
                onChange={(e) => setSummarySearch(e.target.value)}
                placeholder="Tìm tên Team..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:bg-white w-40 sm:w-48"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 min-w-[200px]">TEAM</th>
                <th className="py-2.5 px-3 text-right">ĐỊNH BIÊN</th>
                <th className="py-2.5 px-3 text-right">THỰC TẾ</th>
                <th className="py-2.5 px-3 text-right min-w-[140px]">TỶ LỆ LẤP ĐẦY</th>
                <th className="py-2.5 px-2 text-center bg-sky-50 text-primary w-12">MAN</th>
                <th className="py-2.5 px-2 text-center bg-sky-50 text-primary w-14">LEADER</th>
                <th className="py-2.5 px-2 text-center bg-sky-50 text-primary w-14">NỘI BỘ</th>
                <th className="py-2.5 px-2 text-center bg-sky-50 text-primary w-20">CHUYÊN VIÊN</th>
                <th className="py-2.5 px-2 text-center bg-sky-50 text-primary w-16">THỬ VIỆC</th>
                <th className="py-2.5 px-3 text-right font-bold w-16">TOTAL</th>
                <th className="py-2.5 px-3 text-center min-w-[130px]">CHÊNH LỆCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredSummaryRows.map((row, idx) => {
                if (row.isTotalRow) {
                  return (
                    <tr key={idx} className="bg-sky-50 font-bold border-t-2 border-primary/30 text-slate-900">
                      <td className="py-3 px-3 text-center text-primary font-bold">★</td>
                      <td className="py-3 px-4 font-sans font-bold text-primary uppercase">{row.team}</td>
                      <td className="py-3 px-3 text-right text-base">{row.target}</td>
                      <td className="py-3 px-3 text-right text-base text-primary font-bold">{row.actual}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold text-primary">{row.fulfillmentRate}%</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${row.fulfillmentRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">{row.man}</td>
                      <td className="py-3 px-2 text-center">{row.leader}</td>
                      <td className="py-3 px-2 text-center">{row.internal}</td>
                      <td className="py-3 px-2 text-center">{row.specialist}</td>
                      <td className="py-3 px-2 text-center text-rose-600">{row.probation}</td>
                      <td className="py-3 px-3 text-right font-bold text-primary text-base">{row.total}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px]">
                          {row.gapText}
                        </span>
                      </td>
                    </tr>
                  );
                }

                if (row.isAllCenterRow) {
                  return (
                    <tr key={idx} className="bg-slate-100 font-bold text-slate-900 border-t border-slate-200">
                      <td className="py-3 px-3 text-center">Σ</td>
                      <td className="py-3 px-4 font-sans font-bold uppercase">{row.team}</td>
                      <td className="py-3 px-3 text-right text-base">{row.target}</td>
                      <td className="py-3 px-3 text-right text-base text-emerald-700 font-bold">{row.actual}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">{row.fulfillmentRate}%</td>
                      <td className="py-3 px-2 text-center" colSpan={5}>
                        <span className="text-slate-500 font-sans font-normal text-[11px]">
                          Bao gồm 27 nhân sự chuyên trách BPO vận hành đêm &amp; cao điểm
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 text-base">{row.total}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-[11px]">
                          {row.gapText}
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400">{row.stt}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.gapType === 'danger'
                            ? 'bg-rose-500'
                            : row.gapType === 'warning'
                            ? 'bg-amber-500'
                            : row.gapType === 'surplus'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      <span>{row.team}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{row.target}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-primary">{row.actual}</td>
                    <td className="py-2.5 px-3 text-right">
                      {row.fulfillmentRate > 0 ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`font-semibold ${
                              row.fulfillmentRate < 80
                                ? 'text-rose-600'
                                : row.fulfillmentRate < 90
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {row.fulfillmentRate}%
                          </span>
                          <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                row.fulfillmentRate < 80
                                  ? 'bg-rose-500'
                                  : row.fulfillmentRate < 90
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(row.fulfillmentRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{row.man}</td>
                    <td className="py-2.5 px-2 text-center text-slate-800 font-semibold">{row.leader}</td>
                    <td className="py-2.5 px-2 text-center text-slate-800">{row.internal}</td>
                    <td className="py-2.5 px-2 text-center text-slate-800 font-semibold">{row.specialist}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{row.probation}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{row.total}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          row.gapType === 'danger'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.gapType === 'warning'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : row.gapType === 'surplus'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.gapText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DETAILED AGENT DIRECTORY */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
              DANH BẠ TÁC NGHIỆP
            </span>
            <span className="font-mono text-xs text-slate-400">THÔNG TIN ĐẦU SỐ &amp; LINE TRỰC</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            DANH SÁCH NHÂN SỰ THEO TỪNG TEAM &amp; LINE HỖ TRỢ
          </h2>
          <p className="text-xs text-slate-500">
            Tra cứu hồ sơ 190 nhân sự inhouse theo 11 team tác nghiệp: mã NV, đầu số tổng đài (extension), thâm niên kinh nghiệm và chuyên môn phân line KiotViet.
          </p>
        </div>

        {/* 11 Team Tabs Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
          <button
            onClick={() => setSelectedTeam('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            Tất cả Team (190)
          </button>
          <button
            onClick={() => setSelectedTeam('HN')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'HN'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            1. Tổng đài Hà Nội (19)
          </button>
          <button
            onClick={() => setSelectedTeam('KAT')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'KAT'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            2. KAT Hà Nội (14)
          </button>
          <button
            onClick={() => setSelectedTeam('DN')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'DN'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            3. Tổng đài Đà Nẵng (34)
          </button>
          <button
            onClick={() => setSelectedTeam('HCM')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'HCM'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            4. Tổng đài HCM (22)
          </button>
          <button
            onClick={() => setSelectedTeam('CTO')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'CTO'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            5. Tổng đài Cần Thơ (14)
          </button>
          <button
            onClick={() => setSelectedTeam('UPGRADE')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'UPGRADE'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            6. Nâng Gói Upgrade (19)
          </button>
          <button
            onClick={() => setSelectedTeam('CX_BAC')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'CX_BAC'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            7. CX Miền Bắc (21)
          </button>
          <button
            onClick={() => setSelectedTeam('CX_NAM')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'CX_NAM'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            8. CX Miền Nam (26)
          </button>
          <button
            onClick={() => setSelectedTeam('KSHIP')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'KSHIP'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            9. Giao Vận KSHIP (14)
          </button>
          <button
            onClick={() => setSelectedTeam('HW')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'HW'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            10. Phần Cứng (4)
          </button>
          <button
            onClick={() => setSelectedTeam('AI')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold ${
              selectedTeam === 'AI'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            11. Team AI (3)
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Tên nhân sự, Mã NV (KV-xxxx), Đầu số nội bộ (10xx, 20xx)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white text-xs"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
              search
            </span>
          </div>

          <div className="md:col-span-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none"
            >
              <option value="">Tất cả Cấp bậc (Level)</option>
              <option value="Manager">Manager / Giám đốc</option>
              <option value="Leader">Team Leader</option>
              <option value="QA">Vận hành Nội bộ / QA</option>
              <option value="Level 3">Level 3 - Senior</option>
              <option value="Level 2">Level 2 - Standard</option>
              <option value="Level 1">Level 1 - Junior</option>
              <option value="Thử việc">Thử việc (Probation)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none"
            >
              <option value="">Tất cả Line Hỗ trợ</option>
              <option value="Retail">Line 1: Bán lẻ Retail &amp; POS</option>
              <option value="FnB">Line 2: Ẩm thực FnB</option>
              <option value="KAT">Line KAT FnB &amp; Pub Bar</option>
              <option value="HĐĐT">Line 3: HĐĐT &amp; Kế toán</option>
              <option value="KSHIP">Line 4: Giao vận KSHIP</option>
              <option value="Nâng">Line 5: Nâng gói &amp; Gia hạn</option>
              <option value="Máy in">Line 6: Thiết bị &amp; Máy in</option>
              <option value="AI">Line 7: Trợ lý AI KiotViet</option>
            </select>
          </div>
        </div>

        {/* Directory Listing Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-24">MÃ NV</th>
                <th className="py-2.5 px-2 w-20 text-center">ĐẦU SỐ</th>
                <th className="py-2.5 px-4 min-w-[200px]">TÊN NHÂN SỰ</th>
                <th className="py-2.5 px-3 min-w-[160px]">TEAM</th>
                <th className="py-2.5 px-3 min-w-[180px]">LINE HỖ TRỢ</th>
                <th className="py-2.5 px-3 w-36">CẤP BẬC (LEVEL)</th>
                <th className="py-2.5 px-3 w-28">NGÀY VÀO</th>
                <th className="py-2.5 px-3 w-32">THÂM NIÊN</th>
                <th className="py-2.5 px-3 text-center w-24">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{agent.id}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                      {agent.ext}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {agent.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{agent.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{agent.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-primary font-semibold text-[11px]">
                      {agent.team}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{agent.line}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        agent.levelType === 'manager'
                          ? 'bg-primary text-white font-bold'
                          : agent.levelType === 'leader'
                          ? 'bg-sky-100 text-primary font-bold'
                          : agent.levelType === 'qa'
                          ? 'bg-slate-200 text-slate-800'
                          : agent.levelType === 'senior'
                          ? 'bg-blue-50 text-blue-800'
                          : agent.levelType === 'probation'
                          ? 'bg-rose-50 text-rose-700 font-bold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {agent.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{agent.startDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{agent.tenure}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => alert(`Xem hồ sơ nhân sự: ${agent.name} (${agent.id}) - Ext: ${agent.ext}`)}
                        className="p-1 rounded text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
                        title="Hồ sơ nhân sự"
                      >
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </button>
                      <button
                        onClick={() => alert(`Xem báo cáo KPI cá nhân: ${agent.name} (${agent.id})`)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                        title="KPI cá nhân"
                      >
                        <span className="material-symbols-outlined text-[18px]">query_stats</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Directory Footer Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Hiển thị <span className="font-bold text-slate-900">{filteredStaff.length}</span> trên tổng số{' '}
            <span className="font-bold text-primary">190</span> nhân sự Inhouse
          </div>
          <div className="flex items-center gap-1 font-mono">
            <button disabled className="px-2 py-1 rounded bg-slate-100 text-slate-400 cursor-not-allowed">
              Trước
            </button>
            <button className="w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              3
            </button>
            <span>...</span>
            <button className="w-6 h-6 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center">
              13
            </button>
            <button className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
