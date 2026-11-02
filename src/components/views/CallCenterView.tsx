import React, { useEffect, useMemo, useState } from 'react';
import {
  CallCenterData,
  DayDetail,
  LINES,
  QueueStat,
  addDays,
  emptyStat,
  addStat,
  queueStatsByDay,
  sumStats,
  daysBetween,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatShortDate,
  handleTimes,
  loadAvailableDates,
  loadCallCenterData,
  loadMonthlyTrend,
  maxDate,
  minDate,
  monthEnd,
  monthStart,
  ratio,
  shiftMonths,
  serviceLevels,
  sumBy,
  sumNullable,
  summarizeTeams,
  totalDaily,
  weekdayName,
} from '../../services/callCenterData';
import { COMPARE_COLOR, Legend, LineChart, OTHER_COLOR, SERIES_COLORS, StackedBarChart } from './callCenterCharts';
import QaAnalysis from './QaAnalysis';

interface CallCenterViewProps {
  onOpenExport: () => void;
}

const TEAM_STYLE: Record<string, { short: string; title: string; subtitle: string; color: string; bg: string }> = {
  Inhouse: { short: 'IH', title: 'Nhân sự Inhouse (KiotViet)', subtitle: 'Các site HNI, HCM, DNG, CTO, KAT, CTV', color: 'text-primary', bg: 'bg-primary' },
  'OS Partner': { short: 'OS', title: 'Nhân sự Outsourced (OS)', subtitle: 'Đối tác BPO – site DVKH OUT', color: 'text-[#0090da]', bg: 'bg-[#0090da]' },
  'Voice AI Bot': { short: 'AI', title: 'Voice AI Bot (KiotViet)', subtitle: 'Máy 8400001–8400007 tự trả lời', color: 'text-emerald-600', bg: 'bg-emerald-600' },
};

const AGENT_PAGE = 20;

type FilterMode = 'day' | 'range' | 'month' | 'quarter';
type CompareMode = 'prev' | 'quarter' | 'year';

const FILTER_MODES: { mode: FilterMode; label: string }[] = [
  { mode: 'day', label: 'Ngày' },
  { mode: 'range', label: 'Khoảng ngày' },
  { mode: 'month', label: 'Tháng' },
  { mode: 'quarter', label: 'Quý' },
];

const PREV_LABEL: Record<FilterMode, string> = { day: 'Hôm trước', range: 'Kỳ liền trước', month: 'Tháng trước', quarter: 'Quý trước' };

function compareOptions(mode: FilterMode): { value: CompareMode; label: string }[] {
  return [
    { value: 'prev', label: PREV_LABEL[mode] },
    ...(mode === 'quarter' ? [] : [{ value: 'quarter' as CompareMode, label: 'Cùng kỳ quý trước' }]),
    { value: 'year', label: 'Cùng kỳ năm trước' },
  ];
}

interface Period {
  kind: FilterMode;
  from: string;
  to: string;
  /** Kỳ so sánh, cùng số ngày với kỳ đang xem */
  prevFrom: string;
  prevTo: string;
  compareLabel: string;
  /** Bảng + biểu đồ theo ngày: 7 ngày gần nhất khi xem 1 ngày, còn lại là các ngày trong kỳ */
  tableFrom: string;
  /** Ngày đầu của đường so sánh trên biểu đồ theo ngày */
  cmpTableFrom: string;
}

function quarterStart(q: string): string {
  const [y, n] = q.split('-Q').map(Number);
  return `${y}-${String(3 * n - 2).padStart(2, '0')}-01`;
}

function quarterOf(date: string): string {
  return `${date.slice(0, 4)}-Q${Math.ceil(Number(date.slice(5, 7)) / 3)}`;
}

function buildPeriod(
  mode: FilterMode,
  compare: CompareMode,
  day: string,
  rangeFrom: string,
  rangeTo: string,
  month: string,
  quarter: string,
  latest: string
): Period | null {
  let kind = mode;
  let from: string;
  let to: string;
  let tableFrom: string;
  if (mode === 'day') {
    if (!day) return null;
    from = to = day;
    tableFrom = addDays(day, -6);
  } else if (mode === 'range') {
    if (!rangeFrom || !rangeTo) return null;
    [from, to] = rangeFrom <= rangeTo ? [rangeFrom, rangeTo] : [rangeTo, rangeFrom];
    if (from === to) return buildPeriod('day', compare, from, '', '', '', '', latest);
    tableFrom = from;
  } else {
    const start = mode === 'month' ? (month ? month + '-01' : '') : quarter ? quarterStart(quarter) : '';
    if (!start) return null;
    const end = monthEnd(mode === 'month' ? start : shiftMonths(start, 2));
    from = tableFrom = start;
    to = minDate(latest, end);
  }

  // Lùi theo tháng: tháng trước (1), cùng kỳ quý trước (3), cùng kỳ năm trước (12)
  const shift = compare === 'year' ? 12 : compare === 'quarter' || kind === 'quarter' ? 3 : kind === 'month' ? 1 : 0;
  if (shift) {
    const label =
      compare === 'year' ? 'so với cùng kỳ năm trước' : kind === 'quarter' ? 'so với quý trước' : compare === 'quarter' ? 'so với cùng kỳ quý trước' : 'so với cùng kỳ tháng trước';
    return {
      kind, from, to, tableFrom, compareLabel: label,
      prevFrom: shiftMonths(from, -shift),
      prevTo: shiftMonths(to, -shift),
      cmpTableFrom: shiftMonths(tableFrom, -shift),
    };
  }
  if (kind === 'day') {
    return { kind, from, to, tableFrom, prevFrom: addDays(from, -1), prevTo: addDays(from, -1), compareLabel: 'so với hôm trước', cmpTableFrom: addDays(tableFrom, -7) };
  }
  const n = daysBetween(from, to) + 1;
  return { kind, from, to, tableFrom, prevFrom: addDays(from, -n), prevTo: addDays(from, -1), compareLabel: `so với ${n} ngày trước đó`, cmpTableFrom: addDays(from, -n) };
}

/** Các khoảng ngày cần đọc: kỳ này (kèm bảng theo ngày, lũy kế tháng) và kỳ so sánh (kèm đường so sánh). */
function periodRanges(p: Period): [string, string][] {
  const chartDays = daysBetween(p.tableFrom, p.to);
  return [
    [minDate(p.tableFrom, p.from, monthStart(p.to)), p.to],
    [minDate(p.prevFrom, p.cmpTableFrom), maxDate(p.prevTo, addDays(p.cmpTableFrom, chartDays))],
  ];
}

function formatPeriod(from: string, to: string): string {
  if (from === to) return `ngày ${formatDate(from)}`;
  return `${formatShortDate(from)} – ${formatDate(to)}`;
}

/** Đạt / không đạt mục tiêu; null khi thiếu số liệu hoặc mục tiêu. */
function meets(value: number | null, target: number | undefined, direction: 'higher' | 'lower'): boolean | null {
  if (value == null || target == null) return null;
  return direction === 'higher' ? value >= target : value <= target;
}

function statusClass(ok: boolean | null): string {
  if (ok == null) return 'text-slate-500';
  return ok ? 'text-emerald-700' : 'text-rose-700';
}

/** points: chỉ số là tỷ lệ → hiện chênh lệch điểm % (89% so với 80% = +9 điểm), không phải % thay đổi. */
function Delta({ current, previous, label, invert = false, points = false }: { current: number | null; previous: number | null; label: string; invert?: boolean; points?: boolean }) {
  if (current == null || previous == null || previous === 0) return null;
  const change = points ? current - previous : (current - previous) / previous;
  const up = change >= 0;
  const good = invert ? !up : up;
  const amount = points ? `${(Math.abs(change) * 100).toFixed(1).replace('.', ',')} điểm %` : formatPercent(Math.abs(change));
  return (
    <span className={`text-[11px] font-semibold ${good ? 'text-emerald-700' : 'text-rose-700'}`}>
      {up ? '▲' : '▼'} {amount} {label}
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

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
            value === o.value ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ChangeBadge({ current, previous, invert = false }: { current: number | null; previous: number | null; invert?: boolean }) {
  if (current == null || previous == null || previous === 0) return <span className="text-slate-400">—</span>;
  const change = (current - previous) / previous;
  const good = invert ? change <= 0 : change >= 0;
  return (
    <span className={good ? 'text-emerald-700' : 'text-rose-700'}>
      {change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(change))}
    </span>
  );
}

const QUARTER_START_MONTHS = ['01', '04', '07', '10'];
const LINE_OTHER_LABEL = 'Khác (Knote, hàng đợi khác)';
/** Màu đường tỷ lệ trên biểu đồ cột – sẫm, khác hẳn các màu line */
const RATE_COLOR = '#334155';

export const CallCenterView: React.FC<CallCenterViewProps> = ({ onOpenExport }) => {
  const [availableDates, setAvailableDates] = useState<string[] | null>(null);
  const [mode, setMode] = useState<FilterMode>('day');
  const [selectedDate, setSelectedDate] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [compare, setCompare] = useState<CompareMode>('prev');
  const [data, setData] = useState<CallCenterData | null>(null);
  const [dataKey, setDataKey] = useState('');
  const [trend, setTrend] = useState<DayDetail | null>(null);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agentSearch, setAgentSearch] = useState('');
  const [forceFilter, setForceFilter] = useState<'all' | 'inhouse' | 'os' | 'top'>('all');
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [trendScale, setTrendScale] = useState<'total' | 'perDay'>('total');
  const [trendRate, setTrendRate] = useState<'abandon' | 'sl'>('abandon');
  const [cmpMetric, setCmpMetric] = useState<'offered' | 'abandonRate' | 'sl'>('offered');
  const [lineFilter, setLineFilter] = useState('all');
  const [lineMetric, setLineMetric] = useState<'offered' | 'abandonRate'>('offered');

  useEffect(() => {
    loadAvailableDates()
      .then((dates) => {
        setAvailableDates(dates);
        if (dates.length) {
          const latest = dates[0];
          const oldest = dates[dates.length - 1];
          const weekAgo = addDays(latest, -6);
          setSelectedDate(latest);
          setRangeFrom(weekAgo < oldest ? oldest : weekAgo);
          setRangeTo(latest);
          setSelectedMonth(latest.slice(0, 7));
          setSelectedQuarter(quarterOf(latest));
          // Xu hướng 12 tháng gần nhất – tải riêng, không phụ thuộc bộ lọc
          loadMonthlyTrend(maxDate(oldest, shiftMonths(monthStart(latest), -11)), latest)
            .then(setTrend)
            .catch((err) => setTrendError(err?.message || String(err)));
        } else setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.message || String(err));
        setIsLoading(false);
      });
  }, []);

  const latestDate = availableDates?.[0] || '';
  const oldestDate = availableDates?.[availableDates.length - 1] || '';
  const months = useMemo(() => [...new Set((availableDates || []).map((d) => d.slice(0, 7)))], [availableDates]);
  const quarters = useMemo(() => [...new Set((availableDates || []).map(quarterOf))], [availableDates]);

  const period = useMemo(
    () => (latestDate ? buildPeriod(mode, compare, selectedDate, rangeFrom, rangeTo, selectedMonth, selectedQuarter, latestDate) : null),
    [mode, compare, selectedDate, rangeFrom, rangeTo, selectedMonth, selectedQuarter, latestDate]
  );
  const ranges = period ? periodRanges(period) : [];
  const rangesKey = JSON.stringify(ranges);

  useEffect(() => {
    setShowAllAgents(false);
  }, [period?.from, period?.to]);

  useEffect(() => {
    if (!period || !availableDates) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const key = rangesKey;
    loadCallCenterData(ranges, period.from, period.to, availableDates)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setDataKey(key);
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
  }, [period?.from, period?.to, rangesKey, availableDates]);

  const view = useMemo(() => {
    if (!data || !period || data.from !== period.from || data.to !== period.to || dataKey !== rangesKey) return null;
    const { from, to, daily, team, targets } = data;
    const inRange = (d: string, a: string, b: string) => d >= a && d <= b;
    const periodDaily = daily.filter((r) => inRange(r.report_date, from, to));
    const prevDaily = daily.filter((r) => inRange(r.report_date, period.prevFrom, period.prevTo));
    const dayTeam = team.filter((r) => inRange(r.report_date, from, to));
    const prevTeam = team.filter((r) => inRange(r.report_date, period.prevFrom, period.prevTo));
    const mtd = daily.filter((r) => inRange(r.report_date, monthStart(to), to));

    const weekStart = period.tableFrom;
    const weekDates = daily.filter((r) => inRange(r.report_date, weekStart, to)).map((r) => r.report_date);
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
    const weekTeam = team.filter((r) => inRange(r.report_date, weekStart, to));

    return {
      day: periodDaily.length ? totalDaily(periodDaily) : null,
      prevDay: prevDaily.length ? totalDaily(prevDaily) : null,
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
  }, [data, dataKey, period, rangesKey]);

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

  // Xu hướng theo tháng: cuộc đến theo line (gồm cuộc AI đã gán line) + tỷ lệ nhỡ / SL từng tháng
  const monthly = useMemo(() => {
    if (!trend) return [];
    const byDay = queueStatsByDay(trend.queueDays, trend.aiDays, data?.queueInfo || {});
    const monthKeys = [...new Set(trend.daily.map((r) => r.report_date.slice(0, 7)))].sort();
    return monthKeys.map((m) => {
      const inMonth = (d: string) => d.startsWith(m);
      const days = trend.daily.filter((r) => inMonth(r.report_date));
      const t = totalDaily(days);
      const lines = LINES.map((l) => sumStats(byDay, l.queues.map((q) => q.ext), inMonth).offered);
      return {
        month: m,
        days: days.length,
        monthDays: Number(monthEnd(m + '-01').slice(8)),
        offered: t.offered,
        lines,
        other: Math.max(0, t.offered - lines.reduce((a, b) => a + b, 0)),
        abandonRate: ratio(t.abandoned, t.offered),
        sl: serviceLevels(trend.team.filter((r) => inMonth(r.report_date))).agentSl,
      };
    });
  }, [trend, data?.queueInfo]);

  // Biểu đồ theo ngày: các ngày của kỳ đang xem và ngày tương ứng của kỳ so sánh
  const dailyCompare = useMemo(() => {
    if (!view || !period || !data) return null;
    const n = daysBetween(period.tableFrom, period.to) + 1;
    const dates = Array.from({ length: n }, (_, i) => addDays(period.tableFrom, i));
    // Kỳ so sánh có thể ngắn hơn (tháng 9 có 30 ngày so với tháng 10 có 31) → không lấn sang ngày ngoài kỳ
    const cmpDates = dates.map((_, i) => addDays(period.cmpTableFrom, i)).filter((d) => d <= period.prevTo);
    const dailyBy = new Map(data.daily.map((r) => [r.report_date, r]));
    const metricOf = (d: string): number | null => {
      const r = dailyBy.get(d);
      if (!r) return null;
      if (cmpMetric === 'offered') return r.offered;
      if (cmpMetric === 'abandonRate') return ratio(r.abandoned, r.offered);
      return serviceLevels(data.team.filter((t) => t.report_date === d)).agentSl;
    };
    return { dates, cmpDates, current: dates.map(metricOf), compare: cmpDates.map(metricOf) };
  }, [view, period, data, cmpMetric]);

  // Cuộc gọi theo line / theo hàng đợi trong line
  const lineView = useMemo(() => {
    if (!view || !period || !data) return null;
    const byDay = queueStatsByDay(data.queueDays, data.aiDays, data.queueInfo, data.callbackDays);
    const line = LINES.find((l) => l.key === lineFilter);
    const groups = line
      ? line.queues.map((q, i) => ({ key: q.ext, label: q.label, exts: [q.ext], color: SERIES_COLORS[i] }))
      : LINES.map((l, i) => ({ key: l.key, label: l.name, exts: l.queues.map((q) => q.ext), color: SERIES_COLORS[i] }));
    const n = daysBetween(period.tableFrom, period.to) + 1;
    const dates = Array.from({ length: n }, (_, i) => addDays(period.tableFrom, i));
    const inRange = (a: string, b: string) => (d: string) => d >= a && d <= b;
    const rows = groups.map((g) => {
      const series = dates.map((d) => {
        const s = sumStats(byDay, g.exts, (x) => x === d);
        if (!byDay.has(d)) return null;
        return lineMetric === 'offered' ? s.offered : ratio(s.abandoned, s.offered);
      });
      return {
        ...g,
        series,
        cur: sumStats(byDay, g.exts, inRange(period.from, period.to)),
        prev: sumStats(byDay, g.exts, inRange(period.prevFrom, period.prevTo)),
      };
    });
    const total = (pick: 'cur' | 'prev') => rows.reduce<QueueStat>((acc, r) => addStat(acc, r[pick]), emptyStat());
    return { dates, rows, totalCur: total('cur'), totalPrev: total('prev'), hasPrev: data.daily.some((r) => inRange(period.prevFrom, period.prevTo)(r.report_date)) };
  }, [view, period, data, lineFilter, lineMetric]);

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
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Kênh Vận Hành Hotline 1900 6522</span>
          {period && (
            <>
              <span className="text-xs text-slate-400">·</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold">
                {period.from === period.to
                  ? `Ngày báo cáo ${formatDate(period.from)} (${weekdayName(period.from)})`
                  : `${
                      period.kind === 'quarter'
                        ? `Quý ${quarterOf(period.from).slice(6)}/${period.from.slice(0, 4)}: `
                        : period.kind === 'month'
                        ? `Tháng ${Number(period.from.slice(5, 7))}/${period.from.slice(0, 4)}: `
                        : 'Kỳ báo cáo '
                    }${formatPeriod(period.from, period.to)} (${daysBetween(period.from, period.to) + 1} ngày)`}
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
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {availableDates && availableDates.length > 0 && (
          <>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5" role="tablist" aria-label="Kiểu lọc">
              {FILTER_MODES.map((m) => (
                <button
                  key={m.mode}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.mode}
                  onClick={() => setMode(m.mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    mode === m.mode ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'day' && (
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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

            {mode === 'range' && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Từ</span>
                <input
                  type="date"
                  value={rangeFrom}
                  min={oldestDate}
                  max={latestDate}
                  onChange={(e) => e.target.value && setRangeFrom(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
                  title="Từ ngày"
                />
                <span>đến</span>
                <input
                  type="date"
                  value={rangeTo}
                  min={oldestDate}
                  max={latestDate}
                  onChange={(e) => e.target.value && setRangeTo(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
                  title="Đến ngày"
                />
              </div>
            )}

            {mode === 'month' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold"
                title="Chọn tháng báo cáo"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    Tháng {Number(m.slice(5))}/{m.slice(0, 4)}
                  </option>
                ))}
              </select>
            )}

            {mode === 'quarter' && (
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold"
                title="Chọn quý báo cáo"
              >
                {quarters.map((q) => (
                  <option key={q} value={q}>
                    Quý {q.slice(6)}/{q.slice(0, 4)}
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>So sánh với</span>
              <select
                value={mode === 'quarter' && compare === 'quarter' ? 'prev' : compare}
                onChange={(e) => setCompare(e.target.value as CompareMode)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold"
              >
                {compareOptions(mode).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </>
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

  if (isLoading || !data || !view || !period) {
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

  const periodText = formatPeriod(period.from, period.to);
  const isSingleDay = period.from === period.to;
  const compareLabel = period.compareLabel;

  if (!day) {
    return (
      <div className="space-y-6">
        {header}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-5 text-sm">
          Chưa có dữ liệu cho {isSingleDay ? periodText : `kỳ ${periodText}`}.
        </div>
      </div>
    );
  }

  const answerRate = ratio(day.answered, day.offered);
  const abandonRate = ratio(day.abandoned, day.offered);
  const prevAbandonRate = prevDay ? ratio(prevDay.abandoned, prevDay.offered) : null;
  const callbackRate = ratio(day.cbOnTime, day.cbMissed);
  const prevCallbackRate = prevDay ? ratio(prevDay.cbOnTime, prevDay.cbMissed) : null;
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
          <Delta current={day.offered} previous={prevDay?.offered ?? null} label={compareLabel} />
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            {isSingleDay ? (
              <>
                <span>Lũy kế tháng (MTD):</span>
                <span className="font-mono font-bold text-slate-800">{formatNumber(sumBy(mtd, (r) => r.offered))} cuộc</span>
              </>
            ) : (
              <>
                <span>Trung bình / ngày ({day.days} ngày):</span>
                <span className="font-mono font-bold text-slate-800">{formatNumber(day.offered / day.days)} cuộc</span>
              </>
            )}
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
          <Delta current={day.abandoned} previous={prevDay?.abandoned ?? null} label={compareLabel} invert />
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            {isSingleDay ? (
              <>
                <span>Tỷ lệ nhỡ MTD:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatPercent(ratio(sumBy(mtd, (r) => r.abandoned), sumBy(mtd, (r) => r.offered)))}
                </span>
              </>
            ) : (
              <>
                <span>Tỷ lệ nhỡ kỳ so sánh:</span>
                <span className="font-mono font-bold text-slate-800">{formatPercent(prevAbandonRate)}</span>
              </>
            )}
          </div>
        </KpiCard>

        <KpiCard title="Gọi Lại Đúng Hạn (<30m)" icon="ring_volume" iconClass="text-amber-600">
          {callbackRate == null ? (
            <NoSource text="Chưa có file gọi lại (Power BI)" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${targets.TARGET_CALLBACK == null ? 'text-amber-700' : statusClass(meets(callbackRate, targets.TARGET_CALLBACK, 'higher'))}`}>
                  {formatPercent(callbackRate)}
                </span>
                {targets.TARGET_CALLBACK != null && (
                  <span className="text-xs text-slate-400">Mục tiêu ≥{formatPercent(targets.TARGET_CALLBACK, 0)}</span>
                )}
              </div>
              <Delta current={callbackRate} previous={prevCallbackRate} label={compareLabel} points />
            </>
          )}
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
            {day.cbMissed != null && (
              <div className="flex justify-between">
                <span>Sai quy định / cuộc nhỡ:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatNumber(day.cbLate)} / {formatNumber(day.cbMissed)} ({formatPercent(ratio(day.cbLate, day.cbMissed))})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{isSingleDay ? 'Khách nhỡ cần gọi lại:' : 'Khách nhỡ cần gọi lại (cộng các ngày):'}</span>
              <span className="font-mono font-bold text-slate-800">{formatNumber(day.callbackNeeded)} số</span>
            </div>
          </div>
        </KpiCard>

        <KpiCard title="Service Level (SL ĐTV ≤20s)" icon="speed" iconClass="text-primary">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono">{formatPercent(sl.agentSl)}</span>
            <span className={`text-xs font-semibold ${statusClass(meets(sl.agentSl, targets.TARGET_SL, 'higher'))}`}>
              Mục tiêu ≥{formatPercent(targets.TARGET_SL, 0)}
            </span>
          </div>
          <Delta current={sl.agentSl} previous={prevSl.agentSl} label={compareLabel} points />
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
          <Delta current={aht} previous={prevAht} label={compareLabel} invert />
          <p className="text-xs text-slate-500 mt-1.5">
            {times.acwAvg == null ? 'Hiện bằng thời gian đàm thoại (chưa có ACW).' : 'Đàm thoại + xử lý sau gọi.'}
          </p>
        </KpiCard>

        <KpiCard title="Điểm Chất Lượng QA" icon="grade" iconClass="text-amber-500">
          {day.qaAvg == null ? (
            <NoSource />
          ) : (
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                  targets.TARGET_QA == null ? 'text-emerald-600' : statusClass(meets(day.qaAvg, targets.TARGET_QA, 'higher'))
                }`}
              >
                {day.qaAvg}
              </span>
              <span className="text-xs text-slate-400 font-normal">/ 100 · mục tiêu ≥{formatNumber(targets.TARGET_QA)}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-1.5">
            {day.qaCount
              ? `QA chấm ${formatNumber(day.qaCount)} cuộc${isSingleDay ? ' trong ngày' : ' trong kỳ'} (theo ngày chấm).`
              : `Chưa có cuộc được chấm. Mục tiêu ≥${formatNumber(targets.TARGET_QA)} điểm.`}
          </p>
        </KpiCard>
      </div>

      {/* Cặp 1: xu hướng tháng | kỳ này và kỳ so sánh (xếp dọc khi màn hình hẹp) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Xu hướng theo tháng */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Xu Hướng Cuộc Gọi Theo Tháng</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cột: cuộc đến theo line (gồm cuộc Voice AI), trục trái. Đường: {trendRate === 'abandon' ? 'tỷ lệ nhỡ' : 'SL ĐTV'}, trục
              phải. Tháng đầu quý – kỳ kê khai HĐĐT – được tô nền. Nhấn vào cột để xem chi tiết tháng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              value={trendScale}
              onChange={setTrendScale}
              options={[
                { value: 'total', label: 'Tổng tháng' },
                { value: 'perDay', label: 'TB mỗi ngày' },
              ]}
            />
            <Segmented
              value={trendRate}
              onChange={setTrendRate}
              options={[
                { value: 'abandon', label: 'Tỷ lệ nhỡ' },
                { value: 'sl', label: 'SL ĐTV' },
              ]}
            />
          </div>
        </div>
        {trendError ? (
          <div className="text-xs text-rose-700">Không tải được xu hướng: {trendError}</div>
        ) : monthly.length === 0 ? (
          <div className="text-xs text-slate-400 py-10 text-center">Đang tải xu hướng...</div>
        ) : (
          <>
            <Legend
              items={[
                ...LINES.map((l, i) => ({ label: `Line ${l.name}`, color: SERIES_COLORS[i] })),
                { label: LINE_OTHER_LABEL, color: OTHER_COLOR },
                { label: `${trendRate === 'abandon' ? 'Tỷ lệ nhỡ' : 'SL ĐTV'} (trục phải)`, color: RATE_COLOR },
              ]}
            />
            <StackedBarChart
              height={280}
              overlay={{
                label: trendRate === 'abandon' ? 'Tỷ lệ nhỡ' : 'SL ĐTV',
                color: RATE_COLOR,
                values: monthly.map((m) => (trendRate === 'abandon' ? m.abandonRate : m.sl)),
                format: (v) => formatPercent(v, 0),
                target: trendRate === 'abandon' ? targets.TARGET_ABANDON_RATE : targets.TARGET_SL,
                targetLabel: `Mục tiêu ${trendRate === 'abandon' ? '≤' : '≥'}${formatPercent(
                  trendRate === 'abandon' ? targets.TARGET_ABANDON_RATE : targets.TARGET_SL,
                  0
                )}`,
              }}
              xLabels={monthly.map((m) => `T${Number(m.month.slice(5))}`)}
              titles={monthly.map(
                (m) =>
                  `Tháng ${Number(m.month.slice(5))}/${m.month.slice(0, 4)}${m.days < m.monthDays ? ` (${m.days} ngày có số liệu)` : ''}${
                    trendScale === 'perDay' ? ' – TB/ngày' : ''
                  }`
              )}
              segments={[
                ...LINES.map((l, i) => ({ key: l.key, label: `Line ${l.name}`, color: SERIES_COLORS[i] })),
                { key: 'other', label: 'Khác', color: OTHER_COLOR },
              ]}
              values={monthly.map((m) => [...m.lines, m.other].map((v) => (trendScale === 'perDay' ? v / Math.max(1, m.days) : v)))}
              format={formatNumber}
              emphasize={monthly.map((m) => QUARTER_START_MONTHS.includes(m.month.slice(5)))}
              onSelect={(i) => {
                setMode('month');
                setSelectedMonth(monthly[i].month);
              }}
            />
          </>
        )}
      </div>

      {/* Kỳ này và kỳ so sánh theo ngày */}
      {dailyCompare && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kỳ Này và Kỳ So Sánh Theo Ngày</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatPeriod(period.tableFrom, period.to)} {period.compareLabel} (
                {formatPeriod(dailyCompare.cmpDates[0], dailyCompare.cmpDates[dailyCompare.cmpDates.length - 1])}), xếp theo ngày tương ứng
              </p>
            </div>
            <Segmented
              value={cmpMetric}
              onChange={setCmpMetric}
              options={[
                { value: 'offered', label: 'Cuộc đến' },
                { value: 'abandonRate', label: 'Tỷ lệ nhỡ' },
                { value: 'sl', label: 'SL ĐTV' },
              ]}
            />
          </div>
          <Legend
            items={[
              { label: 'Kỳ này', color: SERIES_COLORS[0] },
              { label: 'Kỳ so sánh', color: COMPARE_COLOR, dashed: true },
            ]}
          />
          <LineChart
            dots={dailyCompare.dates.length <= 14}
            xLabels={dailyCompare.dates.map(formatShortDate)}
            series={[
              { key: 'cur', label: 'Kỳ này', color: SERIES_COLORS[0], values: dailyCompare.current },
              {
                key: 'cmp',
                label: 'Kỳ so sánh',
                color: COMPARE_COLOR,
                dashed: true,
                values: dailyCompare.compare,
                pointLabels: dailyCompare.cmpDates.map(formatShortDate),
              },
            ]}
            format={cmpMetric === 'offered' ? formatNumber : (v) => formatPercent(v)}
            target={cmpMetric === 'abandonRate' ? targets.TARGET_ABANDON_RATE : cmpMetric === 'sl' ? targets.TARGET_SL : null}
            targetLabel={cmpMetric === 'offered' ? undefined : 'Mục tiêu'}
          />
          {dailyCompare.compare.every((v) => v == null) && (
            <p className="text-[11px] text-slate-500">Chưa có số liệu cho kỳ so sánh trên Supabase.</p>
          )}
        </div>
      )}
      </div>

      {/* Cặp 2: cuộc gọi theo Line | khung giờ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Cuộc gọi theo Line */}
      {lineView && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cuộc Gọi Theo Line</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatPeriod(period.tableFrom, period.to)}, theo ngày
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold"
                title="Chọn line"
              >
                <option value="all">Tất cả line</option>
                {LINES.map((l) => (
                  <option key={l.key} value={l.key}>
                    Line {l.name} ({l.queues.length} hàng đợi)
                  </option>
                ))}
              </select>
              <Segmented
                value={lineMetric}
                onChange={setLineMetric}
                options={[
                  { value: 'offered', label: 'Cuộc đến' },
                  { value: 'abandonRate', label: 'Tỷ lệ nhỡ' },
                ]}
              />
            </div>
          </div>
          <Legend items={lineView.rows.map((r) => ({ label: r.label, color: r.color }))} />
          <LineChart
            dots={lineView.dates.length <= 14}
            xLabels={lineView.dates.map(formatShortDate)}
            series={lineView.rows.map((r) => ({ key: r.key, label: r.label, color: r.color, values: r.series }))}
            format={lineMetric === 'offered' ? formatNumber : (v) => formatPercent(v)}
            target={lineMetric === 'abandonRate' ? targets.TARGET_ABANDON_RATE : null}
            targetLabel={lineMetric === 'abandonRate' ? 'Mục tiêu' : undefined}
          />
        </div>
      )}

      {/* Khung giờ */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 min-w-0">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">Lưu Lượng và Tỷ Lệ Nhỡ Theo Khung Giờ</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cuộc được phục vụ và cuộc nhỡ theo giờ – {periodText}
            {!isSingleDay && ` (cộng dồn ${day.days} ngày)`}. Số dưới mỗi cột là tỷ lệ nhỡ của giờ đó, tô đỏ khi vượt mục tiêu.
          </p>
        </div>
        {hourly.length === 0 ? (
          <div className="text-xs text-slate-400 py-10 text-center">Chưa có dữ liệu khung giờ.</div>
        ) : (
          <>
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary"></span>Phục vụ</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400"></span>Nhỡ</span>
            </div>
            <div className="flex items-end gap-1 h-52">
              {hourly.map((h) => {
                const rate = ratio(h.abandoned, h.offered);
                const over = meets(rate, targets.TARGET_ABANDON_RATE, 'lower') === false;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${h.hour}h: đến ${h.offered}, phục vụ ${h.answered}, nhỡ ${h.abandoned} (${formatPercent(rate)})`}>
                    <div className="w-full flex flex-col justify-end h-40">
                      <div className="w-full bg-rose-400 rounded-t-sm" style={{ height: `${(h.abandoned / maxHourly) * 100}%` }}></div>
                      <div className={`w-full bg-primary ${h.abandoned ? '' : 'rounded-t-sm'}`} style={{ height: `${(h.answered / maxHourly) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{h.hour}h</span>
                    <span className={`text-[10px] font-mono ${over ? 'text-rose-700 font-bold' : 'text-slate-400'}`}>{formatPercent(rate, 0)}</span>
                  </div>
                );
              })}
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

      {/* Bảng theo Line: để rộng hết màn hình vì nhiều cột */}
      {lineView && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Bảng Theo {lineFilter === 'all' ? 'Line' : `Hàng Đợi – Line ${LINES.find((l) => l.key === lineFilter)?.name ?? ''}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {periodText}, {period.compareLabel}. Chọn line ở biểu đồ "Cuộc Gọi Theo Line" để xem từng hàng đợi.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">{lineFilter === 'all' ? 'Line' : 'Hàng đợi'}</th>
                  <th className="py-2.5 px-3 text-right">Tổng Đến</th>
                  <th className="py-2.5 px-3 text-right">ĐTV Nghe</th>
                  <th className="py-2.5 px-3 text-right">AI Nghe</th>
                  <th className="py-2.5 px-3 text-right">Nhỡ</th>
                  <th className="py-2.5 px-3 text-right" title="Theo Power BI: số cuộc nhỡ gọi lại sai quy định / cuộc nhỡ cần gọi lại">Gọi Lại Sai QĐ</th>
                  <th className="py-2.5 px-3 text-right">SL ĐTV</th>
                  <th className="py-2.5 px-3 text-right">Đàm Thoại TB</th>
                  <th className="py-2.5 px-3 text-right">CSAT</th>
                  <th className="py-2.5 px-3 text-right">Đến Kỳ So Sánh</th>
                  <th className="py-2.5 px-3 text-right">Thay Đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {[...lineView.rows.map((r) => ({ key: r.key, label: r.label, color: r.color, cur: r.cur, prev: r.prev, total: false })),
                  { key: 'total', label: 'Tổng', color: '', cur: lineView.totalCur, prev: lineView.totalPrev, total: true }].map((r) => {
                  const abandonRate = ratio(r.cur.abandoned, r.cur.offered);
                  return (
                    <tr key={r.key} className={r.total ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50/70'}>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {r.color && <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: r.color }}></span>}
                          {r.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatNumber(r.cur.offered)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatNumber(r.cur.human)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatNumber(r.cur.ai)}</td>
                      <td className={`py-2.5 px-3 text-right ${statusClass(meets(abandonRate, targets.TARGET_ABANDON_RATE, 'lower'))}`}>
                        {formatNumber(r.cur.abandoned)} <span className="text-[10px]">({formatPercent(abandonRate)})</span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right ${statusClass(
                          meets(ratio(r.cur.cbMissed - r.cur.cbLate, r.cur.cbMissed), targets.TARGET_CALLBACK, 'higher')
                        )}`}
                      >
                        {r.cur.cbMissed ? (
                          <>
                            {formatNumber(r.cur.cbLate)} <span className="text-[10px]">({formatPercent(ratio(r.cur.cbLate, r.cur.cbMissed))})</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${statusClass(meets(ratio(r.cur.sl, r.cur.human), targets.TARGET_SL, 'higher'))}`}>
                        {formatPercent(ratio(r.cur.sl, r.cur.human))}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatDuration(ratio(r.cur.talk, r.cur.human))}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatPercent(ratio(r.cur.csatSatisfied, r.cur.csatResponses))}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{lineView.hasPrev ? formatNumber(r.prev.offered) : '—'}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">
                        {lineView.hasPrev ? <ChangeBadge current={r.cur.offered} previous={r.prev.offered} /> : <span className="text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Cuộc Voice AI được tính vào line theo máy: 8400001–8400004 → Retail / F&amp;B / Salon / Hotel, 8400006 → Technology,
            8400007 → HĐĐT. Không tính Knote (8400005) và vài cuộc nhỡ ngay tại máy AI (không xác định được line).
          </p>
        </div>
      )}

      {/* Phân bổ theo 3 đội ngũ */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Phân Bổ &amp; Hiệu Suất Tiếp Nhận Cuộc Gọi Theo 3 Đội Ngũ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh sản lượng và chỉ số phục vụ giữa Inhouse KiotViet, Đối tác OS và Voice AI Bot – {periodText}
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
                  isSingleDay
                    ? ['ĐTV trực / cuộc mỗi ĐTV:', `${formatNumber(t.agentsOnDuty)} / ${formatNumber(t.callsPerAgent)}`]
                    : [
                        'ĐTV trực TB / cuộc mỗi ĐTV/ngày:',
                        `${formatNumber(t.agentsOnDuty == null ? null : t.agentsOnDuty / day.days)} / ${formatNumber(t.callsPerAgent)}`,
                      ],
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

      {/* Phân tích chất lượng QA */}
      <QaAnalysis
        data={data}
        trend={trend}
        from={period.from}
        to={period.to}
        prevFrom={period.prevFrom}
        prevTo={period.prevTo}
        periodText={periodText}
        compareLabel={period.compareLabel}
        target={targets.TARGET_QA}
      />

      {/* Chi tiết (thu gọn): bảng theo ngày + xếp hạng ĐTV */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          aria-expanded={showDetails}
          className="w-full flex items-center justify-between gap-2 px-5 py-4 text-left"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">Chi Tiết: Số Liệu Theo Ngày và Xếp Hạng Điện Thoại Viên</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bấm để {showDetails ? 'thu gọn' : 'mở'} – tra số từng ngày và năng suất từng ĐTV.
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-500">{showDetails ? 'expand_less' : 'expand_more'}</span>
        </button>
      </div>
      {showDetails && (
        <>
          {/* Bảng 7 ngày */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tổng Hợp Sản Lượng Call Theo Từng Ngày ({isSingleDay ? '7 Ngày Gần Nhất' : `${weekRows.length} Ngày Trong Kỳ`})
                </h2>
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
                    const isCurrent = isSingleDay && row.date === period.to;
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

          {/* Bảng xếp hạng ĐTV */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bảng Xếp Hạng Năng Suất Điện Thoại Viên</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatNumber(rankedAgents.length)} ĐTV có nghe máy {isSingleDay ? periodText : `trong kỳ ${periodText}`}, xếp theo
                  tổng số cuộc đã nghe
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
        </>
      )}
    </div>
  );
};
