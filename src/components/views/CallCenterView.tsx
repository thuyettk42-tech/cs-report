import React, { useEffect, useMemo, useState } from 'react';
import {
  CallCenterData,
  addDays,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatShortDate,
  handleTimes,
  loadAvailableDates,
  loadCallCenterData,
  ratio,
  serviceLevels,
  sumBy,
  sumNullable,
  summarizeTeams,
  weekdayName,
} from '../../services/callCenterData';

interface CallCenterViewProps {
  onOpenExport: () => void;
}

const TEAM_STYLE: Record<string, { short: string; title: string; subtitle: string; color: string; bg: string }> = {
  Inhouse: { short: 'IH', title: 'Nhân sự Inhouse (KiotViet)', subtitle: 'Các site HNI, HCM, DNG, CTO, KAT, CTV', color: 'text-primary', bg: 'bg-primary' },
  'OS Partner': { short: 'OS', title: 'Nhân sự Outsourced (OS)', subtitle: 'Đối tác BPO – site DVKH OUT', color: 'text-[#0090da]', bg: 'bg-[#0090da]' },
  'Voice AI Bot': { short: 'AI', title: 'Voice AI Bot (KiotViet)', subtitle: 'Máy 8400001–8400007 tự trả lời', color: 'text-emerald-600', bg: 'bg-emerald-600' },
};

const AGENT_PAGE = 20;

/** Đạt / không đạt mục tiêu; null khi thiếu số liệu hoặc mục tiêu. */
function meets(value: number | null, target: number | undefined, direction: 'higher' | 'lower'): boolean | null {
  if (value == null || target == null) return null;
  return direction === 'higher' ? value >= target : value <= target;
}

function statusClass(ok: boolean | null): string {
  if (ok == null) return 'text-slate-500';
  return ok ? 'text-emerald-700' : 'text-rose-700';
}

function Delta({ current, previous, invert = false }: { current: number | null; previous: number | null; invert?: boolean }) {
  if (current == null || previous == null || previous === 0) return null;
  const change = (current - previous) / previous;
  const up = change >= 0;
  const good = invert ? !up : up;
  return (
    <span className={`text-[11px] font-semibold ${good ? 'text-emerald-700' : 'text-rose-700'}`}>
      {up ? '▲' : '▼'} {formatPercent(Math.abs(change))} so với hôm trước
    </span>
  );
}

function KpiCard({ title, icon, iconClass, children }: { title: string; icon: string; iconClass: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
        <span className="font-bold uppercase tracking-wider">{title}</span>
        <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>{icon}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function NoSource({ text = 'Chưa có nguồn dữ liệu' }: { text?: string }) {
  return <span className="text-sm font-semibold text-slate-400">{text}</span>;
}

export const CallCenterView: React.FC<CallCenterViewProps> = ({ onOpenExport }) => {
  const [availableDates, setAvailableDates] = useState<string[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [data, setData] = useState<CallCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agentSearch, setAgentSearch] = useState('');
  const [forceFilter, setForceFilter] = useState<'all' | 'inhouse' | 'os' | 'top'>('all');
  const [selectedQueue, setSelectedQueue] = useState<string>('all');
  const [showAllAgents, setShowAllAgents] = useState(false);

  useEffect(() => {
    loadAvailableDates()
      .then((dates) => {
        setAvailableDates(dates);
        if (dates.length) setSelectedDate(dates[0]);
        else setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.message || String(err));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDate || !availableDates) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    loadCallCenterData(selectedDate, availableDates)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, availableDates]);

  const view = useMemo(() => {
    if (!data) return null;
    const { date, daily, team, targets } = data;
    const day = daily.find((r) => r.report_date === date) || null;
    const prevDay = daily.find((r) => r.report_date === addDays(date, -1)) || null;
    const dayTeam = team.filter((r) => r.report_date === date);
    const prevTeam = team.filter((r) => r.report_date === addDays(date, -1));
    const monthStart = date.slice(0, 8) + '01';
    const mtd = daily.filter((r) => r.report_date >= monthStart);

    const weekStart = addDays(date, -6);
    const weekDates = daily.filter((r) => r.report_date >= weekStart).map((r) => r.report_date);
    const weekRows = weekDates.map((d) => {
      const r = daily.find((x) => x.report_date === d)!;
      const t = team.filter((x) => x.report_date === d);
      const byTeam = (name: string) => sumBy(t.filter((x) => x.team === name), (x) => x.handled);
      return {
        date: d,
        offered: r.offered,
        answered: r.answered,
        abandoned: r.abandoned,
        callbackNeeded: r.callback_needed,
        inhouse: byTeam('Inhouse'),
        os: byTeam('OS Partner'),
        ai: byTeam('Voice AI Bot'),
        sl: serviceLevels(t).agentSl,
        csatSat: r.csat_satisfied,
        csatResp: r.csat_responses,
      };
    });
    const weekTeam = team.filter((r) => r.report_date >= weekStart);

    return {
      day,
      prevDay,
      dayTeam,
      prevTeam,
      mtd,
      weekRows,
      weekTeam,
      teams: summarizeTeams(dayTeam),
      sl: serviceLevels(dayTeam),
      prevSl: serviceLevels(prevTeam),
      times: handleTimes(dayTeam),
      prevTimes: handleTimes(prevTeam),
      targets,
    };
  }, [data]);

  const queueRows = useMemo(() => {
    if (!data) return [];
    return data.queues
      .map((q) => {
        const info = data.queueInfo[q.queue];
        const humanHandled = q.handled_inhouse + q.handled_os;
        const answered = humanHandled + q.handled_ai;
        return {
          ...q,
          name: info?.display_name || q.queue,
          sortOrder: info?.sort_order ?? null,
          answered,
          abandonRate: ratio(q.abandoned, q.offered),
          talkAvg: ratio(q.handle_seconds, humanHandled),
          sl: ratio(q.answered_within_sl, answered),
          csat: ratio(q.csat_satisfied, q.csat_responses),
        };
      })
      .sort((a, b) => {
        if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
        if (a.sortOrder != null) return -1;
        if (b.sortOrder != null) return 1;
        return b.offered - a.offered;
      });
  }, [data]);

  const hourly = useMemo(() => {
    if (!data) return [];
    const byHour: Record<string, { hour: string; offered: number; answered: number; ai: number; abandoned: number }> = {};
    data.slots.forEach((s) => {
      const hour = s.slot_start.slice(0, 2);
      const h = (byHour[hour] = byHour[hour] || { hour, offered: 0, answered: 0, ai: 0, abandoned: 0 });
      h.offered += s.offered;
      h.answered += s.answered;
      h.ai += s.answered_ai;
      h.abandoned += s.abandoned;
    });
    return Object.values(byHour).sort((a, b) => a.hour.localeCompare(b.hour));
  }, [data]);

  const rankedAgents = useMemo(() => {
    if (!data) return [];
    return data.agents
      .filter((a) => a.team !== 'Voice AI Bot')
      .sort((a, b) => b.handled - a.handled)
      .map((a, idx) => ({
        ...a,
        rank: idx + 1,
        name: a.agent_name || a.ext,
        skill: data.skillGroups[a.ext] || null,
        talkAvg: ratio(a.talk_seconds, a.handled),
        sl: ratio(a.answered_within_sl, a.handled),
        fcr: ratio(a.fcr_count, a.handled),
      }));
  }, [data]);

  const filteredAgents = rankedAgents.filter((agent) => {
    const q = agentSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      agent.name.toLowerCase().includes(q) ||
      agent.ext.toLowerCase().includes(q) ||
      (agent.team || '').toLowerCase().includes(q) ||
      (agent.skill || '').toLowerCase().includes(q);

    let matchesForce = true;
    if (forceFilter === 'inhouse') matchesForce = agent.team === 'Inhouse';
    if (forceFilter === 'os') matchesForce = agent.team === 'OS Partner';
    if (forceFilter === 'top') matchesForce = agent.rank <= 10;

    return matchesSearch && matchesForce;
  });
  const visibleAgents = showAllAgents ? filteredAgents : filteredAgents.slice(0, AGENT_PAGE);

  // ---------------------------------------------------------------------
  // Trạng thái tải / lỗi / chưa có dữ liệu
  // ---------------------------------------------------------------------

  const header = (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Kênh Vận Hành Hotline 1900 6522</span>
          {data && (
            <>
              <span className="text-xs text-slate-400">·</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
                Ngày báo cáo {formatDate(data.date)} ({weekdayName(data.date)})
              </span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Báo Cáo Vận Hành Call Center Hotline 1900 6522
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Số liệu thật từ tổng đài 3CX, đồng bộ tự động mỗi sáng qua Google Sheet → Supabase.
          {data?.lastSync && (
            <>
              {' '}Đồng bộ lần cuối: <strong className="text-slate-700">{formatDateTime(data.lastSync.run_at)}</strong>
              {data.lastSync.status === 'error' && <span className="text-rose-700 font-semibold"> (lỗi – xem sync_log)</span>}
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {availableDates && availableDates.length > 0 && (
          <select
            value={selectedDate || ''}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowAllAgents(false);
              setSelectedQueue('all');
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold"
            title="Chọn ngày báo cáo"
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {formatDate(d)} ({weekdayName(d)})
              </option>
            ))}
          </select>
        )}
        <button
          onClick={onOpenExport}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Xuất Báo Cáo</span>
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-5 text-sm">
          <div className="font-bold mb-1">Không tải được số liệu Call Center</div>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoading && availableDates && availableDates.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 text-sm">
          <div className="font-bold mb-1">Chưa có dữ liệu</div>
          <div className="text-xs leading-relaxed">
            Không đọc được ngày nào trong bảng call_daily. Có thể Apps Script chưa đồng bộ, hoặc tài khoản của bạn chưa
            được thêm vào bảng allowed_users trên Supabase.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data || !view) {
    return (
      <div className="space-y-6">
        {header}
        <div className="bg-white border border-slate-200 rounded-xl p-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          Đang tải số liệu từ Supabase...
        </div>
      </div>
    );
  }

  const { day, prevDay, mtd, weekRows, weekTeam, teams, sl, prevSl, times, prevTimes, targets } = view;

  if (!day) {
    return (
      <div className="space-y-6">
        {header}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 text-sm">
          Chưa có dữ liệu cho ngày {formatDate(data.date)}.
        </div>
      </div>
    );
  }

  const answerRate = ratio(day.answered, day.offered);
  const abandonRate = ratio(day.abandoned, day.offered);
  const callbackRate = ratio(day.callback_on_time, day.callback_needed);
  const aht = times.talkAvg == null ? null : times.talkAvg + (times.acwAvg || 0);
  const prevAht = prevTimes.talkAvg == null ? null : prevTimes.talkAvg + (prevTimes.acwAvg || 0);
  const totalHandled = sumBy(teams, (t) => t.handled);
  const aiTeam = teams.find((t) => t.team === 'Voice AI Bot')!;
  const aiSaving = targets.COST_PER_AGENT_CALL ? aiTeam.handled * targets.COST_PER_AGENT_CALL : null;

  const weekTotals = {
    offered: sumBy(weekRows, (r) => r.offered),
    answered: sumBy(weekRows, (r) => r.answered),
    abandoned: sumBy(weekRows, (r) => r.abandoned),
    callbackNeeded: sumNullable(weekRows, (r) => r.callbackNeeded),
    inhouse: sumBy(weekRows, (r) => r.inhouse),
    os: sumBy(weekRows, (r) => r.os),
    ai: sumBy(weekRows, (r) => r.ai),
    sl: serviceLevels(weekTeam).agentSl,
    csat: ratio(sumNullable(weekRows, (r) => r.csatSat), sumNullable(weekRows, (r) => r.csatResp)),
  };

  const maxHourly = Math.max(1, ...hourly.map((h) => h.offered));
  const peak = hourly.reduce<(typeof hourly)[number] | null>((best, h) => (!best || h.offered > best.offered ? h : best), null);

  return (
    <div className="space-y-6">
      {header}

      {/* 8 thẻ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard title="Tổng Cuộc Đến (Offered)" icon="phone_in_talk" iconClass="text-primary">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{formatNumber(day.offered)}</span>
          </div>
          <Delta current={day.offered} previous={prevDay?.offered ?? null} />
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Lũy kế tháng (MTD):</span>
            <span className="font-mono font-bold text-slate-800">{formatNumber(sumBy(mtd, (r) => r.offered))} cuộc</span>
          </div>
        </KpiCard>

        <KpiCard title="Đã Phục Vụ Thành Công" icon="phone_callback" iconClass="text-emerald-600">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">{formatNumber(day.answered)}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{formatPercent(answerRate)}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(answerRate || 0) * 100}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Mục tiêu: ≥{formatPercent(targets.TARGET_ANSWER_RATE, 0)}</span>
            <span className={`font-bold ${statusClass(meets(answerRate, targets.TARGET_ANSWER_RATE, 'higher'))}`}>
              {meets(answerRate, targets.TARGET_ANSWER_RATE, 'higher') ? 'Đạt' : 'Chưa đạt'}
            </span>
          </div>
        </KpiCard>

        <KpiCard title="Cuộc Nhỡ (Abandoned)" icon="phone_missed" iconClass="text-rose-600">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{formatNumber(day.abandoned)}</span>
            <span className={`text-xs font-bold ${statusClass(meets(abandonRate, targets.TARGET_ABANDON_RATE, 'lower'))}`}>
              {formatPercent(abandonRate)} (≤{formatPercent(targets.TARGET_ABANDON_RATE)})
            </span>
          </div>
          <Delta current={day.abandoned} previous={prevDay?.abandoned ?? null} invert />
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Tỷ lệ nhỡ MTD:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatPercent(ratio(sumBy(mtd, (r) => r.abandoned), sumBy(mtd, (r) => r.offered)))}
            </span>
          </div>
        </KpiCard>

        <KpiCard title="Gọi Lại Đúng Hạn (<30m)" icon="ring_volume" iconClass="text-amber-600">
          {callbackRate == null ? (
            <NoSource text="Chưa có nguồn (log gọi ra 3CX)" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">{formatPercent(callbackRate)}</span>
              <span className="text-xs text-slate-400">Mục tiêu {formatPercent(targets.TARGET_CALLBACK, 0)}</span>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Khách nhỡ cần gọi lại:</span>
            <span className="font-mono font-bold text-slate-800">{formatNumber(day.callback_needed)} số</span>
          </div>
        </KpiCard>

        <KpiCard title="Service Level (SL ĐTV ≤20s)" icon="speed" iconClass="text-primary">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">{formatPercent(sl.agentSl)}</span>
            <span className={`text-xs font-semibold ${statusClass(meets(sl.agentSl, targets.TARGET_SL, 'higher'))}`}>
              Mục tiêu ≥{formatPercent(targets.TARGET_SL, 0)}
            </span>
          </div>
          <Delta current={sl.agentSl} previous={prevSl.agentSl} />
          <p className="text-xs text-slate-500 mt-1.5">
            Cuộc ĐTV nghe máy trong 20 giây (chờ + đổ chuông). Tính cả Voice AI: {formatPercent(sl.allSl)}
          </p>
        </KpiCard>

        <KpiCard title="Đàm Thoại & Wrap-up" icon="timer" iconClass="text-slate-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-slate-900 font-mono">{formatDuration(times.talkAvg)}</div>
              <div className="text-[10px] text-slate-400 uppercase">Đàm thoại TB (ATT)</div>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <div className="text-base font-bold text-slate-900 font-mono">{times.acwAvg == null ? '—' : formatDuration(times.acwAvg)}</div>
              <div className="text-[10px] text-slate-400 uppercase">Xử lý sau gọi (ACW)</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Tính trên cuộc ĐTV nghe. ACW và giữ máy (Hold): chưa có nguồn dữ liệu.
          </div>
        </KpiCard>

        <KpiCard title="Thời Lượng Xử Lý TB (AHT)" icon="timelapse" iconClass="text-primary">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{formatDuration(aht)}</span>
            <span className={`text-xs font-semibold ${statusClass(meets(aht, targets.TARGET_AHT_SEC, 'lower'))}`}>
              Trần {formatDuration(targets.TARGET_AHT_SEC)}
            </span>
          </div>
          <Delta current={aht} previous={prevAht} invert />
          <p className="text-xs text-slate-500 mt-1.5">
            {times.acwAvg == null ? 'Hiện bằng thời gian đàm thoại (chưa có ACW).' : 'Đàm thoại + xử lý sau gọi.'}
          </p>
        </KpiCard>

        <KpiCard title="Điểm Chất Lượng QA" icon="grade" iconClass="text-amber-500">
          {day.qa_avg == null ? (
            <NoSource />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">{day.qa_avg}</span>
              <span className="text-xs text-slate-400 font-normal">/ 100 điểm</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1.5">
            {day.qa_count ? `Chấm ${formatNumber(day.qa_count)} cuộc.` : `Mục tiêu ≥${formatNumber(targets.TARGET_QA)} điểm.`}
          </p>
        </KpiCard>
      </div>

      {/* Phân bổ theo 3 đội ngũ */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Phân Bổ &amp; Hiệu Suất Tiếp Nhận Cuộc Gọi Theo 3 Đội Ngũ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh sản lượng và chỉ số phục vụ giữa Inhouse KiotViet, Đối tác OS và Voice AI Bot – ngày {formatDate(data.date)}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
            Tổng phục vụ: {formatNumber(totalHandled)} cuộc
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {teams.map((t) => (
              <span key={t.team} className={`flex items-center gap-1.5 ${TEAM_STYLE[t.team].color}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${TEAM_STYLE[t.team].bg}`}></span>
                {t.team}: {formatNumber(t.handled)} cuộc ({formatPercent(t.share)})
              </span>
            ))}
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
            {teams.map((t) => (
              <div
                key={t.team}
                className={`${TEAM_STYLE[t.team].bg} h-full`}
                style={{ width: `${(t.share || 0) * 100}%` }}
                title={`${t.team} ${formatPercent(t.share)}`}
              ></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {teams.map((t) => {
            const style = TEAM_STYLE[t.team];
            const isAi = t.team === 'Voice AI Bot';
            const cells: [string, string, string?][] = isAi
              ? [
                  ['Tự phục vụ:', formatNumber(t.handled), style.color],
                  ['SL ≤20s:', formatPercent(t.sl)],
                  ['Thời gian xử lý:', 'Không ghi trong 3CX'],
                  ['Tiết kiệm (ước tính):', aiSaving == null ? '—' : `~${(aiSaving / 1e6).toFixed(1).replace('.', ',')} tr`, 'text-emerald-700'],
                ]
              : [
                  ['Sản lượng:', formatNumber(t.handled), style.color],
                  ['Đàm thoại TB:', formatDuration(t.talkAvg)],
                  ['SL ≤20s:', formatPercent(t.sl)],
                  ['ĐTV trực / cuộc mỗi ĐTV:', `${formatNumber(t.agentsOnDuty)} / ${formatNumber(t.callsPerAgent)}`],
                  ['Giải quyết lần đầu:', formatPercent(t.fcr)],
                  ['CSAT:', formatPercent(t.csat)],
                ];
            return (
              <div key={t.team} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg ${style.bg} text-white font-bold text-xs flex items-center justify-center`}>
                      {style.short}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{style.title}</h3>
                      <span className="text-[10px] text-slate-400">{style.subtitle}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded bg-white font-bold font-mono text-xs ${style.color}`}>{formatPercent(t.share)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {cells.map(([label, value, cls]) => (
                    <div key={label} className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{label}</span>
                      <span className={`font-bold font-mono text-sm ${cls || 'text-slate-900'}`}>{value}</span>
                    </div>
                  ))}
                </div>
                {isAi && (
                  <div className="text-[11px] text-slate-500">
                    Tiết kiệm = số cuộc AI × {formatNumber(targets.COST_PER_AGENT_CALL)}đ/cuộc ĐTV. Chưa trừ cuộc AI chuyển sang ĐTV.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bảng 7 ngày */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tổng Hợp Sản Lượng Call Theo Từng Ngày (7 Ngày Gần Nhất)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Theo dõi biến động số cuộc đến, tỷ lệ phục vụ, cuộc nhỡ và Service Level</p>
          </div>
          <span className="text-xs font-mono font-bold text-primary bg-sky-50 px-2.5 py-1 rounded">
            Tổng {weekRows.length} ngày: {formatNumber(weekTotals.offered)} cuộc (TB {formatNumber(weekTotals.offered / Math.max(1, weekRows.length))} / ngày)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3 text-right">Tổng Đến</th>
                <th className="py-2.5 px-3 text-right">Phục Vụ</th>
                <th className="py-2.5 px-3 text-right">Tỷ Lệ Nhỡ</th>
                <th className="py-2.5 px-3 text-right">Cần Gọi Lại</th>
                <th className="py-2.5 px-3 text-right">Inhouse</th>
                <th className="py-2.5 px-3 text-right">OS Partner</th>
                <th className="py-2.5 px-3 text-right">Voice AI</th>
                <th className="py-2.5 px-3 text-right">SL ĐTV</th>
                <th className="py-2.5 px-3 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {weekRows.map((row) => {
                const isCurrent = row.date === data.date;
                const rowAbandon = ratio(row.abandoned, row.offered);
                return (
                  <tr key={row.date} className={`hover:bg-slate-50/70 transition-colors ${isCurrent ? 'bg-sky-50/60 font-bold border-l-4 border-primary' : ''}`}>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold">{formatShortDate(row.date)}</span>{' '}
                      <span className="text-slate-400">({weekdayName(row.date)})</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatNumber(row.offered)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{formatNumber(row.answered)}</td>
                    <td className={`py-2.5 px-3 text-right ${statusClass(meets(rowAbandon, targets.TARGET_ABANDON_RATE, 'lower'))}`}>
                      {formatPercent(rowAbandon)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatNumber(row.callbackNeeded)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatNumber(row.inhouse)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatNumber(row.os)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{formatNumber(row.ai)}</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${statusClass(meets(row.sl, targets.TARGET_SL, 'higher'))}`}>
                      {formatPercent(row.sl)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900">{formatPercent(ratio(row.csatSat, row.csatResp))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t border-slate-200 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans">TỔNG {weekRows.length} NGÀY</td>
                <td className="py-2.5 px-3 text-right">{formatNumber(weekTotals.offered)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-600">{formatNumber(weekTotals.answered)}</td>
                <td className="py-2.5 px-3 text-right">{formatPercent(ratio(weekTotals.abandoned, weekTotals.offered))}</td>
                <td className="py-2.5 px-3 text-right">{formatNumber(weekTotals.callbackNeeded)}</td>
                <td className="py-2.5 px-3 text-right">{formatNumber(weekTotals.inhouse)}</td>
                <td className="py-2.5 px-3 text-right">{formatNumber(weekTotals.os)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-700">{formatNumber(weekTotals.ai)}</td>
                <td className="py-2.5 px-3 text-right">{formatPercent(weekTotals.sl)}</td>
                <td className="py-2.5 px-3 text-right">{formatPercent(weekTotals.csat)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Hàng đợi */}
        <div className="xl:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hiệu Năng Theo Hàng Đợi ({queueRows.length} hàng đợi)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Phân bổ tiếp nhận giữa Inhouse, OS Partner và Voice AI – ngày {formatDate(data.date)}</p>
            </div>
            <select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả hàng đợi</option>
              {queueRows.map((q) => (
                <option key={q.queue} value={q.queue}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Hàng Đợi</th>
                  <th className="py-2.5 px-3 text-right">Tổng Đến</th>
                  <th className="py-2.5 px-3 text-right">Nhỡ</th>
                  <th className="py-2.5 px-3 text-center">Phân Bổ</th>
                  <th className="py-2.5 px-3 text-center">Đàm Thoại TB</th>
                  <th className="py-2.5 px-3 text-center">SL ≤20s</th>
                  <th className="py-2.5 px-3 text-center">CSAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueRows
                  .filter((q) => selectedQueue === 'all' || q.queue === selectedQueue)
                  .map((q) => (
                    <tr key={q.queue} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{q.name}</div>
                        {q.name !== q.queue && <div className="text-[11px] text-slate-400 font-mono">{q.queue}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatNumber(q.offered)}</td>
                      <td className={`py-2.5 px-3 text-right font-mono ${statusClass(meets(q.abandonRate, targets.TARGET_ABANDON_RATE, 'lower'))}`}>
                        {formatNumber(q.abandoned)} <span className="text-[10px]">({formatPercent(q.abandonRate)})</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] whitespace-nowrap">
                        <span>IH <strong className="text-primary">{formatNumber(q.handled_inhouse)}</strong></span>
                        {' · '}
                        <span>OS <strong className="text-[#0090da]">{formatNumber(q.handled_os)}</strong></span>
                        {q.handled_ai > 0 && (
                          <>
                            {' · '}
                            <span>AI <strong className="text-emerald-700">{formatNumber(q.handled_ai)}</strong></span>
                          </>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700">{formatDuration(q.talkAvg)}</td>
                      <td className={`py-2.5 px-3 text-center font-mono font-bold ${statusClass(meets(q.sl, targets.TARGET_SL, 'higher'))}`}>
                        {formatPercent(q.sl)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-900">{formatPercent(q.csat)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khung giờ */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Lưu Lượng Cuộc Gọi Theo Khung Giờ</h2>
            <p className="text-xs text-slate-500 mt-0.5">Cuộc được phục vụ và cuộc nhỡ theo giờ – ngày {formatDate(data.date)}</p>
          </div>
          {hourly.length === 0 ? (
            <div className="text-xs text-slate-400 py-10 text-center">Chưa có dữ liệu khung giờ.</div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>Phục vụ</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span>Nhỡ</span>
              </div>
              <div className="flex items-end gap-1 h-48">
                {hourly.map((h) => (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${h.hour}h: đến ${h.offered}, phục vụ ${h.answered}, nhỡ ${h.abandoned}`}>
                    <div className="w-full flex flex-col justify-end h-40">
                      <div className="w-full bg-rose-400 rounded-t-sm" style={{ height: `${(h.abandoned / maxHourly) * 100}%` }}></div>
                      <div className={`w-full bg-primary ${h.abandoned ? '' : 'rounded-t-sm'}`} style={{ height: `${(h.answered / maxHourly) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{h.hour}</span>
                  </div>
                ))}
              </div>
              {peak && (
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  Cao điểm: <strong>{peak.hour}h–{String(Number(peak.hour) + 1).padStart(2, '0')}h</strong> với{' '}
                  <strong className="font-mono">{formatNumber(peak.offered)}</strong> cuộc đến, nhỡ{' '}
                  <strong className="font-mono">{formatPercent(ratio(peak.abandoned, peak.offered))}</strong>.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bảng xếp hạng ĐTV */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bảng Xếp Hạng Năng Suất Điện Thoại Viên</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatNumber(rankedAgents.length)} ĐTV có nghe máy ngày {formatDate(data.date)}, xếp theo số cuộc đã nghe
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
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">search</span>
            </div>
            <select
              value={forceFilter}
              onChange={(e) => setForceFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none"
            >
              <option value="all">Tất cả lực lượng</option>
              <option value="inhouse">Inhouse KiotViet</option>
              <option value="os">OS Partner (BPO)</option>
              <option value="top">Top 10 sản lượng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-4">Điện Thoại Viên</th>
                <th className="py-2.5 px-3">Đội Ngũ</th>
                <th className="py-2.5 px-3">Chuyên Môn</th>
                <th className="py-2.5 px-3 text-center">Cuộc Đã Nghe</th>
                <th className="py-2.5 px-3 text-center">Đàm Thoại TB</th>
                <th className="py-2.5 px-3 text-center">SL ≤20s</th>
                <th className="py-2.5 px-3 text-center">FCR</th>
                <th className="py-2.5 px-3 text-center">Điểm QA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleAgents.map((agent) => (
                <tr key={agent.ext} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500 font-mono">{agent.rank}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-slate-900">{agent.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">EXT: {agent.ext}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        agent.team === 'OS Partner' ? 'bg-[#0090da]/10 text-[#0090da]' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {agent.team || '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{agent.skill || '—'}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-primary text-sm">{formatNumber(agent.handled)}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{formatDuration(agent.talkAvg)}</td>
                  <td className={`py-2.5 px-3 text-center font-mono font-semibold ${statusClass(meets(agent.sl, targets.TARGET_SL, 'higher'))}`}>
                    {formatPercent(agent.sl)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{formatPercent(agent.fcr)}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-900">{agent.qa_avg == null ? '—' : agent.qa_avg}</td>
                </tr>
              ))}
              {visibleAgents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">Không có ĐTV phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredAgents.length > AGENT_PAGE && (
          <div className="text-center">
            <button
              onClick={() => setShowAllAgents(!showAllAgents)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showAllAgents ? 'Thu gọn' : `Hiện tất cả ${formatNumber(filteredAgents.length)} ĐTV`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
