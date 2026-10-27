import { useState, useMemo, Fragment } from 'react';
import { kpiFocusTeams } from '../../data/mockData';
import { KpiTeamRecord, KpiMemberRecord } from '../../types';

interface KpiEvaluationViewProps {
  onOpenExport?: () => void;
}

export default function KpiEvaluationView({ onOpenExport }: KpiEvaluationViewProps) {
  const [selectedTeamTab, setSelectedTeamTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [calendarSynced, setCalendarSynced] = useState<boolean>(false);

  // Filtered teams and members
  const filteredTeams = useMemo(() => {
    let teams = kpiFocusTeams;
    if (selectedTeamTab !== 'all') {
      teams = teams.filter(t => t.teamCode === selectedTeamTab);
    }

    return teams.map(team => {
      const filteredMembers = team.members.filter(m => {
        const matchesSearch =
          !searchQuery ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.ms.includes(searchQuery);

        const matchesLevel =
          selectedLevel === 'all' || m.level.toString() === selectedLevel;

        return matchesSearch && matchesLevel;
      });

      return {
        ...team,
        members: filteredMembers,
      };
    }).filter(t => t.members.length > 0 || selectedTeamTab === t.teamCode);
  }, [selectedTeamTab, searchQuery, selectedLevel]);

  // Aggregate stats
  const totalEmployeesIn5Teams = useMemo(() => {
    return kpiFocusTeams.reduce((acc, t) => acc + t.members.length, 0);
  }, []);

  const totalWarningMembers = useMemo(() => {
    return kpiFocusTeams.reduce(
      (acc, t) => acc + t.members.filter(m => m.isWarning || m.isCritical).length,
      0
    );
  }, []);

  const handleSendAlerts = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3500);
  };

  const handleSyncCalendar = () => {
    setCalendarSynced(true);
    setTimeout(() => setCalendarSynced(false), 3500);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* 1. HEADER & EXECUTIVE ACTION CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary/10 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Kỳ Vận Hành T-1 (01/10 - 20/10/2026)
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              Chốt số liệu: 20/10/2026 23:59:59
            </span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
            Đánh Giá &amp; Theo Dõi KPI Nhân Sự CSKH
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Báo cáo tiến độ hoàn thành KPI tháng 10/2026 toàn bộ các team vận hành theo định mức Kế hoạch (KH) vs Công việc thực tế (CV).
          </p>
        </div>

        {/* Controls & Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span className="font-medium">Tháng 10/2026 (01 - 20/10)</span>
          </div>

          <button
            onClick={() => onOpenExport?.()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">file_download</span>
            Xuất Excel KPI
          </button>

          <button
            onClick={handleSendAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error-container hover:bg-error-container/80 text-on-error-container font-label-md text-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            Cảnh Báo Chưa Đạt ({totalWarningMembers})
          </button>
        </div>
      </div>

      {alertSent && (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl flex items-center justify-between text-body-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
            <span>
              Đã gửi thông báo đôn đốc tới <strong>14 nhân sự</strong> có hiệu suất &lt; 55% và các Quản lý trực tiếp (Võ Văn Nhiệm, Lê Minh Tuấn, Trần Lâm)!
            </span>
          </div>
          <button onClick={() => setAlertSent(false)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {calendarSynced && (
        <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl flex items-center justify-between text-body-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">event_available</span>
            <span>
              Đã đồng bộ lịch phỏng vấn 1-1 cho các nhân sự nhóm cảnh báo vào Google Calendar của Team Lead thành công!
            </span>
          </div>
          <button onClick={() => setCalendarSynced(false)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* 2. HIGH-LEVEL KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* Card 1: Center Average */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Tỉ Lệ Đạt Toàn TT</span>
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">donut_large</span>
            </span>
          </div>
          <div className="mt-space-sm mb-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-headline-xl font-headline-xl text-primary font-bold tabular-nums">67.3%</span>
              <span className="text-body-sm font-body-sm text-secondary flex items-center font-semibold tabular-nums">
                <span className="material-symbols-outlined text-[16px]">trending_up</span> +2.1%
              </span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '67.3%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant pt-2 border-t border-slate-100">
            <span>Mục tiêu: 75.0%</span>
            <span className="text-error font-medium">Chậm 7.7%</span>
          </div>
        </div>

        {/* Card 2: Met / Exceeded */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Đạt Định Mức (≥70%)</span>
            <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </span>
          </div>
          <div className="mt-space-sm mb-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold tabular-nums">128</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">/ 190 NV (67.4%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: '67.4%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant pt-2 border-t border-slate-100">
            <span className="text-secondary font-medium">Đạt chuẩn định mức</span>
            <span className="tabular-nums">Top vượt: 34 bạn (&gt;80%)</span>
          </div>
        </div>

        {/* Card 3: In Progress / Needs Push */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Cần Đôn Đốc (55% - &lt;70%)</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <span className="material-symbols-outlined text-[20px]">running_with_errors</span>
            </span>
          </div>
          <div className="mt-space-sm mb-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold tabular-nums">48</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">nhân sự (25.3%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '25.3%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant pt-2 border-t border-slate-100">
            <span className="text-amber-700 font-medium">Tiến độ còn chậm</span>
            <span>Chủ yếu Mức 2 &amp; 3</span>
          </div>
        </div>

        {/* Card 4: High Alert */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex items-start justify-between">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Nguy Cơ &amp; Cảnh Báo (&lt;55%)</span>
            <span className="p-1.5 rounded-lg bg-error/10 text-error">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </span>
          </div>
          <div className="mt-space-sm mb-space-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-headline-xl font-headline-xl text-error font-bold tabular-nums">14</span>
              <span className="text-body-sm font-body-sm text-on-surface-variant">nhân sự (7.4%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-error h-1.5 rounded-full" style={{ width: '7.4%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant pt-2 border-t border-slate-100">
            <span className="text-error font-medium">Cảnh báo khẩn</span>
            <span>Phỏng vấn 1-1 ngay</span>
          </div>
        </div>
      </div>

      {/* 3. BENCHMARK & MULTI-TEAM PERFORMANCE COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* 8 Teams Overview Grid */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">Bảng Xếp Hạng Hiệu Suất 8 Team Toàn Trung Tâm</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Đối soát tỷ lệ hoàn thành KPI tháng 10/2026 tính đến ngày 20/10</p>
            </div>
            <span className="text-label-sm font-label-sm text-primary bg-primary/10 px-2.5 py-1 rounded-full font-medium tabular-nums">Trung vị: 70.1%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {/* Team 1 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team KAT HN</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-green-100 text-green-800 font-medium">Top 1 CSKH</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-secondary font-bold tabular-nums">74.2%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">24 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '74.2%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team HCM1 (Retail)</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-green-100 text-green-800 font-medium">Đạt kỳ vọng</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-secondary font-bold tabular-nums">73.4%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">28 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '73.4%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 3 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team ĐN3</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-green-100 text-green-800 font-medium">Đạt kỳ vọng</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-secondary font-bold tabular-nums">72.0%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">18 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 4 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team Tổng Đài HN</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-green-100 text-green-800 font-medium">Đạt kỳ vọng</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-secondary font-bold tabular-nums">71.5%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">32 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '71.5%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 5 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team ĐN1</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-amber-100 text-amber-800 font-medium">Sát ngưỡng</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-on-surface font-bold tabular-nums">69.8%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">16 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '69.8%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 6: Team ĐN2 */}
            <div className="p-space-md rounded-xl bg-amber-500/10 flex flex-col justify-between ring-2 ring-amber-400">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">priority_high</span>
                  Team ĐN 2 (Cần đôn đốc)
                </span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-amber-200 text-amber-900 font-medium">Cần đôn đốc</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-amber-700 font-bold tabular-nums">67.3%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">10 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '67.3%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 7 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team HCM2 (FnB)</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-amber-100 text-amber-800 font-medium">Cần đôn đốc</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-on-surface font-bold tabular-nums">68.1%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">22 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '68.1%' }}></div>
                </div>
              </div>
            </div>

            {/* Team 8 */}
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-semibold">Team Cần Thơ</span>
                <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-rose-100 text-rose-800 font-medium">Chậm tiến độ</span>
              </div>
              <div className="mt-space-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-headline-md font-headline-md text-error font-bold tabular-nums">66.5%</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">20 nhân sự</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div className="bg-error h-1.5 rounded-full" style={{ width: '66.5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Action Plan & Focus Items */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-slate-200">
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              </span>
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Chỉ Đạo Điều Hành KPI</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Kế hoạch nước rút 10 ngày cuối tháng</p>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              {/* Item 1 */}
              <div className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5 shrink-0">priority_high</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Đôn đốc 4 nhân sự dưới 65% của ĐN2</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Yêu cầu Võ Văn Nhiệm (LD) làm việc trực tiếp với Lê Thị Thanh Thúy (55.6%) và Nguyễn Thái Trâm (57.5%) để phân bổ lại ca trực và danh sách ticket tồn đọng.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0">stars</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Tuyên dương cá nhân vượt trội</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Phạm Nguyễn Vĩnh Kỳ đạt 79.3% với năng suất trung bình 5.7%/ngày. Đề xuất chia sẻ kinh nghiệm xử lý nhanh cho nhóm Mức 2.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">tune</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Cân đối lại tỉ lệ KH vs CV</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Trần Thị Diệu Linh có tỉ lệ KH đạt cao (72.2%) nhưng CV mới đạt 57.0%. Cần tăng cường nhận ticket hỗ trợ kỹ thuật FnB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Feedback Trigger */}
          <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-slate-100">
            <span className="text-code-sm font-code-sm text-on-surface-variant">Thời gian còn lại: 11 ngày</span>
            <button
              onClick={handleSyncCalendar}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">event</span>
              Lên Lịch Coaching 1-1
            </button>
          </div>
        </div>
      </div>

      {/* 4. TEAM NAVIGATION TABS & FILTER BAR */}
      <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between gap-space-md flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedTeamTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedTeamTab === 'all'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>Xem tất cả các Team (Toàn trung tâm)</span>
              <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] tabular-nums">48 NV</span>
            </button>

            <button
              onClick={() => setSelectedTeamTab('HN1')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedTeamTab === 'HN1'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>Team HN 1</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-green-800 rounded text-[10px] font-semibold tabular-nums">110.36%</span>
            </button>

            <button
              onClick={() => setSelectedTeamTab('HCM1')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedTeamTab === 'HCM1'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>Team HCM 1</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-green-800 rounded text-[10px] font-semibold tabular-nums">104.62%</span>
            </button>

            <button
              onClick={() => setSelectedTeamTab('HCM2')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedTeamTab === 'HCM2'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>Team HCM 2</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-green-800 rounded text-[10px] font-semibold tabular-nums">101.25%</span>
            </button>

            <button
              onClick={() => setSelectedTeamTab('CTO')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedTeamTab === 'CTO'
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span>Team Cần Thơ (CTO)</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-green-800 rounded text-[10px] font-semibold tabular-nums">103.11%</span>
            </button>

            <button
              onClick={() => setSelectedTeamTab('DN2')}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 font-semibold ${
                selectedTeamTab === 'DN2'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <span>Team ĐN 2</span>
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded text-[10px] tabular-nums">67.3%</span>
            </button>
          </div>

          <div className="flex items-center gap-space-sm w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo Mã NV, Họ tên, MS..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-surface-container-low text-on-surface text-body-sm font-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Tất cả mức Level</option>
              <option value="5">Level 5</option>
              <option value="4">Level 4</option>
              <option value="3">Level 3</option>
              <option value="2">Level 2</option>
              <option value="1">Level 1</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. DETAILED KPI TABLE ACROSS 5 FOCUS TEAMS */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 rounded-lg bg-primary text-on-primary">
              <span className="material-symbols-outlined text-[20px]">table_chart</span>
            </span>
            <div>
              <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight uppercase">
                Bảng Theo Dõi &amp; Đánh Giá KPI Nhân Sự Chi Tiết Theo Team
              </h2>
              <p className="text-code-sm font-code-sm text-on-surface-variant">
                Dữ liệu đối soát chuẩn hóa: Kế hoạch (KH) vs Công việc thực tế (CV) • 5 Team trọng điểm (HN 1, HCM 1, HCM 2, CTO, ĐN 2)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-md bg-secondary/10 text-secondary text-label-sm font-label-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span> Đạt chuẩn: 42 NV
            </span>
            <span className="px-3 py-1 rounded-md bg-error/10 text-error text-label-sm font-label-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">warning</span> Chưa đạt (&lt;70% / Không đạt): 6 NV
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm font-body-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface text-label-sm font-label-sm uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold text-center w-14">STT</th>
                <th className="py-2.5 px-3 font-semibold text-center w-24">Mã NV</th>
                <th className="py-2.5 px-3 font-semibold text-center w-16">MS</th>
                <th className="py-2.5 px-4 font-semibold min-w-[190px]">Họ &amp; Tên Nhân Viên</th>
                <th className="py-2.5 px-3 font-semibold text-center w-14">Level</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">KPI KH</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">KPI CV</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">Đạt KH</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">Đạt CV</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">Tỉ lệ KH</th>
                <th className="py-2.5 px-3 font-semibold text-right tabular-nums">Tỉ lệ CV</th>
                <th className="py-2.5 px-3 font-semibold text-center bg-surface-container-highest tabular-nums">Tổng Đạt</th>
                <th className="py-2.5 px-3 font-semibold text-center w-28">Kết quả T9/T10</th>
                <th className="py-2.5 px-3 font-semibold text-center w-14">HĐ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, tIdx) => {
                const isDn2 = team.teamCode === 'DN2';
                return (
                  <Fragment key={team.teamCode}>
                    {/* Team Section Header Row */}
                    <tr className={`font-bold text-on-surface border-y ${
                      isDn2 ? 'bg-amber-200/90 border-amber-400' : 'bg-amber-100 border-amber-300'
                    }`}>
                      <td className="py-2 px-3 text-center">
                        <span className={`material-symbols-outlined text-[18px] ${
                          isDn2 ? 'text-amber-900' : 'text-amber-800'
                        }`}>
                          {isDn2 ? 'priority_high' : 'folder_open'}
                        </span>
                      </td>
                      <td className="py-2 px-4 uppercase text-amber-950 text-label-md font-label-md tracking-wider" colSpan={10}>
                        <span className={`px-2 py-0.5 rounded mr-2 ${isDn2 ? 'bg-amber-300 text-amber-950 font-bold' : 'bg-amber-200 text-amber-900'}`}>
                          {team.region}
                        </span>
                        {team.teamName} ({team.members.length} Nhân viên)
                      </td>
                      <td className={`py-2 px-3 text-center font-bold text-[15px] font-code-sm tabular-nums ${
                        isDn2 ? 'bg-[#f8b4b4] text-[#841a1a]' : 'bg-amber-200 text-green-800'
                      }`}>
                        {team.totalRate}
                      </td>
                      <td className={`py-2 px-3 text-center text-label-sm font-bold ${
                        isDn2 ? 'text-amber-900 bg-amber-200' : 'text-green-800 bg-green-100/70'
                      }`}>
                        {isDn2 ? 'CẦN ĐÔN ĐỐC' : 'ĐẠT CHỈ TIÊU'}
                      </td>
                      <td className="py-2 px-3 text-center font-code-sm text-code-sm">CT</td>
                    </tr>

                    {/* Member Rows */}
                    {team.members.map((member) => {
                      const isWarn = member.isWarning;
                      const isCrit = member.isCritical;
                      const isTop = member.isTop;

                      let rowBg = 'hover:bg-surface-container-low transition-colors bg-white';
                      if (isCrit) {
                        rowBg = 'hover:bg-rose-100/80 transition-colors bg-rose-100/60';
                      } else if (isWarn) {
                        rowBg = 'hover:bg-rose-50/70 transition-colors bg-rose-50/40';
                      }

                      return (
                        <tr key={member.code} className={rowBg}>
                          <td className="py-1.5 px-3 text-center font-code-sm text-on-surface-variant tabular-nums">
                            {member.stt}
                          </td>
                          <td className="py-1.5 px-3 text-center font-code-sm font-medium text-primary">
                            {member.code}
                          </td>
                          <td className="py-1.5 px-3 text-center font-code-sm text-on-surface-variant font-semibold">
                            {member.ms}
                          </td>
                          <td className="py-1.5 px-4 font-semibold text-on-surface">
                            <div className="flex items-center gap-1.5">
                              {isCrit && (
                                <span className="material-symbols-outlined text-[16px] text-error animate-pulse">warning</span>
                              )}
                              {isWarn && !isCrit && (
                                <span className="material-symbols-outlined text-[16px] text-error">error</span>
                              )}
                              <span className={isCrit || isWarn ? 'text-error font-bold' : ''}>
                                {member.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 text-center font-code-sm">
                            {member.level}
                          </td>
                          <td className="py-1.5 px-3 text-right font-code-sm tabular-nums">
                            {member.kpiPlan || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-code-sm tabular-nums">
                            {member.kpiActual || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-right font-code-sm text-on-surface-variant tabular-nums">
                            {member.achievedPlan.toFixed(1)}
                          </td>
                          <td className="py-1.5 px-3 text-right font-code-sm text-on-surface-variant tabular-nums">
                            {member.achievedActual > 0 ? member.achievedActual.toFixed(1) : '-'}
                          </td>
                          <td className={`py-1.5 px-3 text-right font-code-sm tabular-nums ${
                            parseFloat(member.ratePlan) >= 100
                              ? 'text-secondary font-medium'
                              : parseFloat(member.ratePlan) < 70
                              ? 'text-error font-medium'
                              : 'text-on-surface'
                          }`}>
                            {member.ratePlan}
                          </td>
                          <td className={`py-1.5 px-3 text-right font-code-sm tabular-nums ${
                            member.rateActual === '-'
                              ? 'text-outline'
                              : parseFloat(member.rateActual) >= 100
                              ? 'text-secondary font-medium'
                              : parseFloat(member.rateActual) < 70
                              ? 'text-error font-medium'
                              : 'text-on-surface'
                          }`}>
                            {member.rateActual}
                          </td>
                          <td className={`py-1.5 px-3 text-center font-code-sm font-bold tabular-nums ${
                            isCrit
                              ? 'bg-[#fca5a5] text-[#7f1d1d] text-[13px]'
                              : isWarn
                              ? 'bg-[#f8b4b4] text-[#841a1a]'
                              : isTop
                              ? 'bg-emerald-100 text-secondary text-[13px]'
                              : 'bg-emerald-50 text-secondary'
                          }`}>
                            {member.totalAchieved}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {isCrit ? (
                              <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-error-container text-on-error-container font-bold animate-pulse">
                                Báo động
                              </span>
                            ) : isWarn ? (
                              <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-error-container text-on-error-container font-bold">
                                {member.result}
                              </span>
                            ) : isTop ? (
                              <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                                ★ {member.result}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-green-100 text-green-800">
                                {member.result}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-center font-code-sm text-on-surface-variant">
                            {member.contract}
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-amber-100/90 font-bold text-on-surface border-t-2 border-amber-300">
                <td className="py-3 px-4 text-right text-label-md font-label-md text-amber-950 uppercase tracking-wider" colSpan={9}>
                  Tổng hợp trung bình toàn bộ 5 Team trọng điểm (48 Nhân viên):
                </td>
                <td className="py-3 px-3 text-right font-code-sm text-[#c2410c] text-[14px] font-bold tabular-nums">
                  98.4%
                </td>
                <td className="py-3 px-3 text-right font-code-sm text-[#c2410c] text-[14px] font-bold tabular-nums">
                  104.2%
                </td>
                <td className="py-3 px-3 text-center font-code-sm text-[#c2410c] text-[15px] font-black bg-amber-200 tabular-nums">
                  101.8%
                </td>
                <td className="py-3 px-3 text-center text-label-sm font-label-sm text-green-800 bg-green-100/80 font-bold" colSpan={2}>
                  42/48 NV ĐẠT CHUẨN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
