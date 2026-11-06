import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  daysBetween,
  formatNumber,
  formatPercent,
  formatShortDate,
  maxDate,
  minDate,
  monthEnd,
  monthStart,
  ratio,
  shiftMonths,
} from '../../services/callCenterData';
import {
  KAT_CHANNELS,
  KAT_CHANNEL_GROUPS,
  KAT_CONTENT,
  KatDailyRow,
  channelGroup,
  isTicketChannel,
  loadKatDaily,
  loadKatDates,
  loadKatCalls,
  summarizeKat,
  KatCallDay,
  KatAgentDay,
  KAT_DEFAULT_TARGET_PER_DAY,
  loadKatAgents,
  loadKatTargetPerDay,
  loadKatLastSync,
  loadKatJira,
  KatJiraIssue,
} from '../../services/katData';
import { Legend, OTHER_COLOR, SERIES_COLORS, StackedBarChart } from './callCenterCharts';
import KatAgentProductivity from './KatAgentProductivity';
import KatJiraSection from './KatJiraSection';

const CONTENT_COLOR: Record<string, string> = {
  HĐĐT: SERIES_COLORS[0],
  CKS: SERIES_COLORS[1],
  'Thuế – Kế toán': SERIES_COLORS[2],
  Khác: OTHER_COLOR,
};
const CHANNEL_COLOR: Record<string, string> = { Call: SERIES_COLORS[0], Chat: SERIES_COLORS[1], Ticket: SERIES_COLORS[2], Khác: OTHER_COLOR };
const SLA_TARGET = 0.95;
const MISS_CALL = 'Call – Miss call';
/** Mục tiêu tỷ lệ gọi nhỡ line KAT (như thiết kế: < 5%) */
const ABANDON_TARGET = 0.05;
/** Kỳ dài hơn số ngày này thì biểu đồ sản lượng gộp theo tháng */
const MAX_DAILY_BARS = 62;

type Mode = 'day' | 'range' | 'month' | 'quarter' | 'year';
const MODES: { mode: Mode; label: string }[] = [
  { mode: 'day', label: 'Ngày' },
  { mode: 'range', label: 'Khoảng ngày' },
  { mode: 'month', label: 'Tháng' },
  { mode: 'quarter', label: 'Quý' },
  { mode: 'year', label: 'Năm' },
];
/** Kỳ so sánh: kỳ liền trước (theo loại kỳ), cùng thứ tuần trước (chỉ Ngày), cùng kỳ quý trước, cùng kỳ năm trước */
type Compare = 'prev' | 'week' | 'quarter' | 'year';
const PREV_LABEL: Record<Mode, string> = { day: 'Hôm trước', range: 'Kỳ liền trước', month: 'Tháng trước', quarter: 'Quý trước', year: 'Năm trước' };
function compareOptions(mode: Mode): { value: Compare; label: string }[] {
  return [
    { value: 'prev', label: PREV_LABEL[mode] },
    ...(mode === 'day' ? [{ value: 'week' as Compare, label: 'Cùng thứ tuần trước' }] : []),
    ...(mode === 'quarter' || mode === 'year' ? [] : [{ value: 'quarter' as Compare, label: 'Cùng kỳ quý trước' }]),
    ...(mode === 'year' ? [] : [{ value: 'year' as Compare, label: 'Cùng kỳ năm trước' }]),
  ];
}

const monthLabel = (m: string) => `Tháng ${Number(m.slice(5))}/${m.slice(0, 4)}`;
const quarterOf = (d: string) => `${d.slice(0, 4)}-Q${Math.floor((Number(d.slice(5, 7)) - 1) / 3) + 1}`;
const quarterStart = (q: string) => `${q.slice(0, 4)}-${String((Number(q.slice(6)) - 1) * 3 + 1).padStart(2, '0')}-01`;
const formatDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

/** Thời gian xử lý ticket thường tính bằng giờ: "7h 15p", dưới 1 giờ thì "42p" */
function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !isFinite(seconds)) return '—';
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}p` : `${m}p`;
}

/** Kỳ đang xem (kỳ đang chạy tính đến ngày mới nhất có dữ liệu) và kỳ so sánh cùng độ dài */
function buildPeriod(
  mode: Mode,
  compare: Compare,
  v: { day: string; from: string; to: string; month: string; quarter: string; year: string },
  latest: string
) {
  let from: string, to: string;
  if (mode === 'day') from = to = v.day;
  else if (mode === 'range') {
    from = minDate(v.from, v.to);
    to = maxDate(v.from, v.to);
  } else if (mode === 'month') {
    from = v.month + '-01';
    to = minDate(monthEnd(from), latest);
  } else if (mode === 'quarter') {
    from = quarterStart(v.quarter);
    to = minDate(monthEnd(shiftMonths(from, 2)), latest);
  } else {
    from = v.year + '-01-01';
    to = minDate(v.year + '-12-31', latest);
  }
  const days = daysBetween(from, to) + 1;
  let prevFrom: string, prevTo: string;
  const months = compare === 'year' ? 12 : compare === 'quarter' ? 3 : mode === 'month' ? 1 : mode === 'quarter' ? 3 : mode === 'year' ? 12 : 0;
  if (compare === 'week') {
    prevFrom = addDays(from, -7);
    prevTo = addDays(to, -7);
  } else if (months) {
    // Lùi đúng số tháng, giữ ngày trong tháng (31/10 → 30/09 vì tháng 9 chỉ có 30 ngày)
    prevFrom = shiftMonths(from, -months);
    prevTo = shiftMonths(to, -months);
  } else {
    // Ngày / Khoảng ngày so với số ngày bằng nhau liền trước
    prevTo = addDays(from, -1);
    prevFrom = addDays(from, -days);
  }
  return { from, to, prevFrom, prevTo, days };
}

function Delta({ cur, prev, points = false, invert = false }: { cur: number | null; prev: number | null; points?: boolean; invert?: boolean }) {
  if (cur == null || prev == null || (!points && !prev)) return <span className="text-slate-400">— chưa có kỳ so sánh</span>;
  const d = points ? (cur - prev) * 100 : ((cur - prev) / prev) * 100;
  if (Math.abs(d) < 0.05) return <span className="text-slate-500">không đổi</span>;
  const bad = invert ? d > 0 : d < 0;
  return (
    <span className={`font-semibold ${bad ? 'text-rose-700' : 'text-emerald-700'}`}>
      {d > 0 ? '▲' : '▼'} {Math.abs(d).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
      {points ? ' điểm' : '%'}
    </span>
  );
}

function Card({ title, icon, iconClass, children }: { title: string; icon: string; iconClass: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase text-slate-500 leading-tight">{title}</span>
        <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>{icon}</span>
      </div>
      <div className="mt-2 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function NoData({ hint }: { hint: string }) {
  return (
    <>
      <span className="text-sm font-semibold text-slate-400 mt-1">Chưa có dữ liệu</span>
      <span className="text-[11px] text-slate-400 mt-auto pt-2">{hint}</span>
    </>
  );
}

function SmallStat({ label, value, tone, delta, sub }: { label: string; value: string; tone?: string; delta?: React.ReactNode; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase text-slate-500">{label}</span>
        <span className={`text-xl font-extrabold font-mono whitespace-nowrap ${tone || 'text-slate-900'}`}>{value}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2 mt-1 text-[11px]">
        <span className="text-slate-500">{sub}</span>
        {delta}
      </div>
    </div>
  );
}

export default function KatTicketReport() {
  const [range, setRange] = useState<{ oldest: string; latest: string } | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('month');
  const [compare, setCompare] = useState<Compare>('prev');
  const [day, setDay] = useState('');
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');
  const [month, setMonth] = useState('');
  const [quarter, setQuarter] = useState('');
  const [year, setYear] = useState('');
  const [content, setContent] = useState<string>('all');
  const [volumeBy, setVolumeBy] = useState<'content' | 'channel'>('content');
  const [data, setData] = useState<{ key: string; daily: KatDailyRow[]; calls: KatCallDay[]; agents: KatAgentDay[] } | null>(null);
  const [targetPerDay, setTargetPerDay] = useState(KAT_DEFAULT_TARGET_PER_DAY);

  const [lastSync, setLastSync] = useState<{ run_at: string; status: string } | null>(null);
  const [jiraOpen, setJiraOpen] = useState<KatJiraIssue[] | null>(null);
  useEffect(() => {
    loadKatTargetPerDay().then(setTargetPerDay).catch(() => undefined);
    loadKatLastSync().then(setLastSync).catch(() => undefined);
    // Thẻ "Ticket Jira mở": chỉ cần ticket đang treo (khoảng ngày rỗng để không lấy thêm ticket theo kỳ)
    loadKatJira('9999-01-01', '9999-01-01').then(setJiraOpen).catch(() => setJiraOpen([]));
  }, []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKatDates()
      .then((r) => {
        setRange(r);
        if (!r) return;
        setDay(r.latest);
        setRangeFrom(maxDate(r.oldest, addDays(r.latest, -6)));
        setRangeTo(r.latest);
        setMonth(r.latest.slice(0, 7));
        setQuarter(quarterOf(r.latest));
        setYear(r.latest.slice(0, 4));
      })
      .catch((e) => setError(e.message || String(e)));
  }, []);

  const period = useMemo(() => {
    if (!range || !day) return null;
    // Lựa chọn so sánh không hợp với loại kỳ mới (vd "Cùng thứ tuần trước" khi chuyển sang Tháng) → kỳ liền trước
    const cmp = compareOptions(mode).some((o) => o.value === compare) ? compare : 'prev';
    return buildPeriod(mode, cmp, { day, from: rangeFrom, to: rangeTo, month, quarter, year }, range.latest);
  }, [range, mode, compare, day, rangeFrom, rangeTo, month, quarter, year]);
  const compareLabel = useMemo(() => {
    const o = compareOptions(mode).find((x) => x.value === compare) || compareOptions(mode)[0];
    return o.label.toLowerCase();
  }, [mode, compare]);
  const periodKey = period ? `${period.prevFrom}|${period.from}|${period.to}` : '';

  useEffect(() => {
    if (!period) return;
    const key = periodKey;
    const lo = minDate(period.prevFrom, period.from);
    Promise.all([
      loadKatDaily(lo, period.to),
      // Số cuộc gọi line HĐĐT không bắt buộc: lỗi thì thẻ gọi nhỡ hiện "Chưa có dữ liệu"
      loadKatCalls(lo, period.to).catch(() => [] as KatCallDay[]),
      // Năng suất nhân sự cần SQL bước 12; chưa chạy thì mục đó báo chưa có số
      loadKatAgents(lo, period.to).catch(() => [] as KatAgentDay[]),
    ])
      .then(([daily, calls, agents]) => setData({ key, daily, calls, agents }))
      .catch((e) => setError(e.message || String(e)));
  }, [periodKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => {
    if (!range) return { months: [] as string[], quarters: [] as string[], years: [] as string[] };
    const months: string[] = [];
    for (let m = monthStart(range.latest); m >= monthStart(range.oldest); m = shiftMonths(m, -1)) months.push(m.slice(0, 7));
    const quarters = [...new Set(months.map((m) => quarterOf(m + '-01')))];
    const years = [...new Set(months.map((m) => m.slice(0, 4)))];
    return { months, quarters, years };
  }, [range]);

  const view = useMemo(() => {
    if (!data || !period || data.key !== periodKey) return null;
    const keep = (r: { content_group: string }) => content === 'all' || r.content_group === content;
    const inCur = (d: string) => d >= period.from && d <= period.to;
    const inPrev = (d: string) => d >= period.prevFrom && d <= period.prevTo;
    const cur = data.daily.filter((r) => inCur(r.report_date));
    const prev = data.daily.filter((r) => inPrev(r.report_date));
    const curF = cur.filter(keep);
    const prevF = prev.filter(keep);
    const count = (rs: KatDailyRow[], f: (r: KatDailyRow) => boolean) => rs.reduce((s, r) => s + (f(r) ? r.tickets : 0), 0);

    // Sản lượng: theo ngày, hoặc theo tháng khi kỳ dài
    const byMonth = period.days > MAX_DAILY_BARS;
    const buckets: { key: string; label: string; title: string; keep: (d: string) => boolean }[] = [];
    if (byMonth) {
      for (let m = monthStart(period.from); m <= period.to; m = shiftMonths(m, 1)) {
        const mk = m.slice(0, 7);
        buckets.push({ key: mk, label: 'T' + Number(mk.slice(5)), title: monthLabel(mk), keep: (d) => d.startsWith(mk) });
      }
    } else {
      for (let i = 0; i < period.days; i++) {
        const d = addDays(period.from, i);
        buckets.push({ key: d, label: formatShortDate(d), title: formatDate(d), keep: (x) => x === d });
      }
    }
    const segs = volumeBy === 'content' ? [...KAT_CONTENT] : [...KAT_CHANNEL_GROUPS];
    const volume = buckets.map((b) => {
      const rs = curF.filter((r) => b.keep(r.report_date));
      return segs.map((sg) => count(rs, (r) => (volumeBy === 'content' ? r.content_group === sg : channelGroup(r.channel) === sg)));
    });

    const sumCalls = (keepDay: (d: string) => boolean) =>
      (data.calls || []).filter((c) => keepDay(c.report_date)).reduce((a, c) => ({ offered: a.offered + c.offered, abandoned: a.abandoned + c.abandoned }), { offered: 0, abandoned: 0 });
    return {
      calls: sumCalls(inCur),
      prevCalls: sumCalls(inPrev),
      s: summarizeKat(curF),
      p: summarizeKat(prevF),
      hasPrev: prev.length > 0,
      byMonth,
      buckets,
      segs,
      volume,
      // Ticket "Call – Miss call" hầu như không có nội dung (rơi vào "Khác") → không tính vào tỷ trọng dịch vụ
      contentShare: KAT_CONTENT.map((c) => ({
        c,
        cur: count(cur, (r) => r.content_group === c && r.channel !== MISS_CALL),
        prev: count(prev, (r) => r.content_group === c && r.channel !== MISS_CALL),
      })),
      shareBase: count(cur, (r) => r.channel !== MISS_CALL),
      missCalls: count(cur, (r) => r.channel === MISS_CALL),
      allCur: count(cur, () => true),
      channels: KAT_CHANNELS.map((ch) => {
        const rs = curF.filter((r) => r.channel === ch);
        return { ch, s: summarizeKat(rs), byContent: KAT_CONTENT.map((c) => count(rs, (r) => r.content_group === c)), prev: count(prevF, (r) => r.channel === ch) };
      }).filter((x) => x.s.tickets > 0 || x.prev > 0),
    };
  }, [data, period, periodKey, content, volumeBy]);

  const selectCls = 'px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-none font-semibold';
  const dateMin = range?.oldest;
  const dateMax = range?.latest;

  const header = (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold uppercase tracking-wider text-[11px]">Phân hệ KAT</span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Line chuyên biệt
          </span>
          {period && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
              {period.from === period.to ? formatDate(period.from) : `${formatDate(period.from)} – ${formatDate(period.to)}`} ({period.days} ngày)
            </span>
          )}
          {range && (() => {
            // Hôm qua theo giờ Việt Nam: file ticket ngày hôm qua thường được thả vào sáng nay
            const yesterday = addDays(new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10), -1);
            const late = range.latest < yesterday;
            return (
              <span
                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${late ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                title={late ? `Chưa có ticket từ ${formatDate(addDays(range.latest, 1))} – kiểm tra đã thả file xuất CRM vào thư mục KAT chưa` : undefined}
              >
                {late && '⚠ '}Ticket CRM có đến {formatDate(range.latest)}
                {lastSync && ` · đồng bộ lúc ${new Date(lastSync.run_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`}
                {lastSync?.status === 'error' && ' (lỗi)'}
              </span>
            );
          })()}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Báo cáo vận hành dự án KAT</h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Ticket thật từ CRM (Hóa đơn điện tử, Chữ ký số, Thuế – Kế toán), đồng bộ mỗi sáng.
          {period && (
            <>
              {' '}
              So với {compareLabel}: {period.prevFrom === period.prevTo ? formatDate(period.prevFrom) : `${formatDate(period.prevFrom)} – ${formatDate(period.prevTo)}`}.
            </>
          )}
        </p>
        {period && (mode === 'day' || mode === 'range' || mode === 'month') && (() => {
          // Tháng đầu quý (T1, T4, T7, T10) là cao điểm kê khai HĐĐT / thuế → so với tháng thường dễ lệch mạnh
          const peak = (d: string) => [1, 4, 7, 10].includes(Number(d.slice(5, 7)));
          if (peak(period.from) === peak(period.prevFrom)) return null;
          return (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-block">
              Lưu ý mùa vụ: {peak(period.prevFrom) ? 'kỳ so sánh' : 'kỳ đang xem'} rơi vào tháng đầu quý (cao điểm kê khai), nên các chỉ số so sánh thường
              {peak(period.prevFrom) ? ' giảm' : ' tăng'} mạnh – nên xem thêm "Cùng kỳ quý trước".
            </p>
          );
        })()}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold" role="tablist">
          {MODES.map((m) => (
            <button
              key={m.mode}
              type="button"
              role="tab"
              aria-selected={mode === m.mode}
              onClick={() => setMode(m.mode)}
              className={`px-3 py-1.5 rounded-md ${mode === m.mode ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === 'day' && <input type="date" value={day} min={dateMin} max={dateMax} onChange={(e) => e.target.value && setDay(e.target.value)} className={selectCls} />}
        {mode === 'range' && (
          <>
            <input type="date" value={rangeFrom} min={dateMin} max={dateMax} onChange={(e) => e.target.value && setRangeFrom(e.target.value)} className={selectCls} />
            <span className="text-xs text-slate-400">đến</span>
            <input type="date" value={rangeTo} min={dateMin} max={dateMax} onChange={(e) => e.target.value && setRangeTo(e.target.value)} className={selectCls} />
          </>
        )}
        {mode === 'month' && (
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls} title="Chọn tháng">
            {options.months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        )}
        {mode === 'quarter' && (
          <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className={selectCls} title="Chọn quý">
            {options.quarters.map((q) => (
              <option key={q} value={q}>
                Quý {q.slice(6)}/{q.slice(0, 4)}
              </option>
            ))}
          </select>
        )}
        {mode === 'year' && (
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls} title="Chọn năm">
            {options.years.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        )}
        <span className="text-xs text-slate-500">So sánh với</span>
        <select
          value={compareOptions(mode).some((o) => o.value === compare) ? compare : 'prev'}
          onChange={(e) => setCompare(e.target.value as Compare)}
          className={selectCls}
          title="Chọn kỳ so sánh"
        >
          {compareOptions(mode).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={content} onChange={(e) => setContent(e.target.value)} className={selectCls} title="Lọc theo nhóm nội dung">
          <option value="all">Tất cả loại dịch vụ (KAT)</option>
          {KAT_CONTENT.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-4">
        {header}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
          Chưa đọc được số ticket KAT: {error}. Kiểm tra đã chạy <b>buoc10_tao_bang_kat.sql</b> và <b>buoc11_kat_tong_hop.sql</b> trên Supabase.
        </div>
      </div>
    );
  }
  if (!view) {
    return (
      <div className="space-y-4">
        {header}
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-400">
          {range === null ? 'Chưa có ticket KAT trên Supabase.' : 'Đang tải số liệu…'}
        </div>
      </div>
    );
  }

  const { s, p, hasPrev } = view;
  const prevOr = (v: number | null) => (hasPrev ? v : null);
  const slaRate = ratio(s.withinSla, s.slaBase);
  const abandonRate = ratio(view.calls.abandoned, view.calls.offered);
  const avgTicket = ratio(s.ticketSeconds, s.ticketChannel);
  const maxShare = Math.max(1, ...view.contentShare.map((x) => x.cur));
  const dayLabel = mode === 'day' ? 'trong ngày' : 'trong kỳ';

  return (
    <div className="space-y-4">
      {header}

      {/* 6 chỉ số chính (giữ đủ như thiết kế; mục chưa có nguồn hiện "Chưa có dữ liệu") */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card title={`Tổng yêu cầu [${dayLabel}]`} icon="support_agent" iconClass="text-primary">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {formatNumber(s.tickets)} <span className="text-xs font-semibold text-slate-400">ticket</span>
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Call: {formatNumber(s.byGroup.Call)} | Chat: {formatNumber(s.byGroup.Chat)} | Ticket: {formatNumber(s.byGroup.Ticket)}
          </span>
          <span className="text-xs mt-auto pt-2">
            <Delta cur={s.tickets} prev={prevOr(p.tickets)} />
          </span>
        </Card>
        <Card title={`Tỷ lệ gọi nhỡ [${dayLabel}]`} icon="phone_missed" iconClass="text-rose-600">
          {view.calls.offered === 0 ? (
            <NoData hint="Chưa có số cuộc gọi line HĐĐT (3CX) cho kỳ này. Mục tiêu < 5%." />
          ) : (
            <>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${abandonRate != null && abandonRate <= ABANDON_TARGET ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatPercent(abandonRate)}{' '}
                <span className="text-xs font-semibold text-slate-400">
                  {formatNumber(view.calls.abandoned)}/{formatNumber(view.calls.offered)} cuộc
                </span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Line HĐĐT (8009) trên 3CX, gồm cuộc Voice AI · mục tiêu &lt; {formatPercent(ABANDON_TARGET, 0)}</span>
              <span className="text-xs mt-auto pt-2">
                <Delta cur={abandonRate} prev={view.prevCalls.offered ? ratio(view.prevCalls.abandoned, view.prevCalls.offered) : null} points invert />
              </span>
            </>
          )}
        </Card>
        <Card title="Phản hồi chat TB" icon="chat" iconClass="text-sky-600">
          <NoData hint="Màn Chat (Freshchat) chưa có số thật – cần file xuất / báo cáo Freshchat. Mục tiêu < 60s." />
        </Card>
        <Card title="Ticket đúng SLA (4h)" icon="task_alt" iconClass="text-emerald-600">
          <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${slaRate == null ? 'text-slate-400' : slaRate >= SLA_TARGET ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatPercent(slaRate)}{' '}
            <span className="text-xs font-semibold text-slate-400">
              {formatNumber(s.withinSla)}/{formatNumber(s.slaBase)}
            </span>
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Chuẩn SLA: {formatPercent(SLA_TARGET, 0)} · {formatNumber(s.slaBase - s.withinSla)} ticket quá hạn
          </span>
          <span className="text-xs mt-auto pt-2">
            <Delta cur={slaRate} prev={prevOr(ratio(p.withinSla, p.slaBase))} points />
          </span>
        </Card>
        <Card title="Khiếu nại đang xử lý" icon="warning" iconClass="text-amber-500">
          <NoData hint="Cần danh sách khiếu nại KAT." />
        </Card>
        <Card title="Ticket Jira mở (Bug + Sup)" icon="settings" iconClass="text-sky-700">
          {jiraOpen == null ? (
            <span className="text-xs text-slate-400 mt-1">Đang tải…</span>
          ) : (() => {
            const issues = jiraOpen.filter((x) => x.is_open && x.kind !== 'Case');
            const bug = issues.filter((x) => x.kind === 'Bug').length;
            const nowMs = Date.now();
            const old = issues.filter((x) => (nowMs - new Date(x.created_at.replace(' ', 'T') + '+07:00').getTime()) / 86400000 > 7).length;
            return (
              <>
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${issues.length ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {formatNumber(issues.length)} <span className="text-xs font-semibold text-slate-400">ticket</span>
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Bug: {formatNumber(bug)} | Support: {formatNumber(issues.length - bug)}
                </span>
                <span className="text-xs mt-auto pt-2">
                  {old ? <span className="font-semibold text-rose-700">{formatNumber(old)} ticket treo &gt; 7 ngày</span> : <span className="text-slate-500">Không có ticket treo &gt; 7 ngày</span>}
                </span>
              </>
            );
          })()}
        </Card>
      </div>

      {/* Tình trạng xử lý ticket */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tình Trạng Xử Lý Ticket</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hoàn thiện = Đã xử lý xong / Đã báo KH · Không xử lý = Từ chối / Trùng lặp · Đang treo = các trạng thái còn lại (theo file xuất gần nhất).
            </p>
          </div>
        </div>
        {/* Thanh cơ cấu trạng thái */}
        <div className="flex h-3 rounded-sm overflow-hidden bg-slate-100" title="Cơ cấu trạng thái ticket">
          {[
            { n: s.done, c: '#1baf7a', l: 'Hoàn thiện' },
            { n: s.rejected, c: '#94a3b8', l: 'Không xử lý' },
            { n: s.pending, c: '#eda100', l: 'Đang treo' },
          ].map((x) => (
            <div key={x.l} style={{ width: `${(x.n / Math.max(1, s.tickets)) * 100}%`, backgroundColor: x.c }} title={`${x.l}: ${formatNumber(x.n)}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SmallStat
          label="Đã hoàn thiện"
          value={formatPercent(ratio(s.done, s.tickets))}
          tone="text-emerald-700"
          sub={`${formatNumber(s.done)} ticket`}
          delta={<Delta cur={ratio(s.done, s.tickets)} prev={prevOr(ratio(p.done, p.tickets))} points />}
        />
        <SmallStat
          label="Không xử lý"
          value={formatPercent(ratio(s.rejected, s.tickets))}
          sub={`${formatNumber(s.rejected)} từ chối / trùng lặp`}
          delta={<Delta cur={ratio(s.rejected, s.tickets)} prev={prevOr(ratio(p.rejected, p.tickets))} points invert />}
        />
        <SmallStat label="Đang treo" value={formatNumber(s.pending)} tone={s.pending ? 'text-amber-700' : undefined} sub="mới tạo / đang xử lý / chờ nội bộ" />
        <SmallStat
          label="TG xử lý TB kênh Ticket"
          value={formatDuration(avgTicket)}
          sub={`${formatNumber(s.ticketChannel)} ticket kênh Ticket`}
          delta={<Delta cur={avgTicket} prev={prevOr(ratio(p.ticketSeconds, p.ticketChannel))} invert />}
        />
        </div>
      </div>

      {/* Sản lượng | Tỷ trọng nội dung */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sản Lượng Ticket Theo {view.byMonth ? 'Tháng' : 'Ngày'}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Số ticket tạo mỗi {view.byMonth ? 'tháng' : 'ngày'}, chia theo {volumeBy === 'content' ? 'nhóm nội dung' : 'kênh'}.</p>
            </div>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              {(['content', 'channel'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVolumeBy(v)}
                  className={`px-3 py-1.5 rounded-md ${volumeBy === v ? 'bg-white text-primary shadow-xs' : 'text-slate-500'}`}
                >
                  {v === 'content' ? 'Theo dịch vụ' : 'Theo kênh'}
                </button>
              ))}
            </div>
          </div>
          <Legend items={view.segs.map((k) => ({ label: k, color: volumeBy === 'content' ? CONTENT_COLOR[k] : CHANNEL_COLOR[k] }))} />
          <StackedBarChart
            height={240}
            xLabels={view.buckets.map((b) => b.label)}
            titles={view.buckets.map((b) => b.title)}
            segments={view.segs.map((k) => ({ key: k, label: k, color: volumeBy === 'content' ? CONTENT_COLOR[k] : CHANNEL_COLOR[k] }))}
            values={view.volume}
            format={formatNumber}
          />
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Tỷ Trọng Theo Loại Dịch Vụ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trên {formatNumber(view.shareBase)} ticket có nội dung
              {view.missCalls > 0 && <> (không tính {formatNumber(view.missCalls)} ticket gọi nhỡ chưa ghi nội dung)</>}.
            </p>
          </div>
          <div className="space-y-3">
            {view.contentShare.map((x) => (
              <div key={x.c}>
                <div className="flex items-baseline justify-between text-xs gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CONTENT_COLOR[x.c] }}></span>
                    {x.c}
                  </span>
                  <span className="font-mono text-slate-700">
                    <strong className="text-slate-900">{formatNumber(x.cur)}</strong> ({formatPercent(ratio(x.cur, view.shareBase))})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-slate-100 rounded-sm overflow-hidden">
                    <div className="h-full rounded-sm" style={{ width: `${(x.cur / maxShare) * 100}%`, backgroundColor: CONTENT_COLOR[x.c] }}></div>
                  </div>
                  <span className="text-[11px] w-24 text-right">{hasPrev ? <Delta cur={x.cur} prev={x.prev} /> : null}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Loại dịch vụ do hệ thống đọc mô tả + AI summary của ticket; 1 ticket nhiều việc ưu tiên Thuế → HĐĐT → CKS → Khác.
          </p>
        </div>
      </div>

      {/* Năng suất nhân sự KAT (mã tổng đài 88xx) */}
      {period && data && (
        <KatAgentProductivity
          rows={data.agents || []}
          from={period.from}
          to={period.to}
          prevFrom={period.prevFrom}
          prevTo={period.prevTo}
          compareLabel={compareLabel}
          allTickets={view.allCur}
          target={targetPerDay}
        />
      )}

      {/* Jira chuyển sản phẩm, vấn đề nổi cộm, đề xuất tính năng */}
      {period && (
        <KatJiraSection from={period.from} to={period.to} prevFrom={period.prevFrom} prevTo={period.prevTo} compareLabel={compareLabel} />
      )}

      {/* Bảng theo kênh – chi tiết để tra cứu, thu gọn mặc định */}
      <details className="group bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <summary className="cursor-pointer list-none flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Chi Tiết: Ticket Theo Kênh Hỗ Trợ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {view.channels.length} kênh · bấm để xem. Ticket CRM không ghi kênh: người tạo = người xử lý thì lấy kênh nhân viên đó dùng trong ngày; khác người thì tính là Ticket.
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
        </summary>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 text-left">Kênh</th>
                <th className="py-2.5 px-2 text-right">Ticket</th>
                <th className="py-2.5 px-2 text-right">Tỷ trọng</th>
                <th className="py-2.5 px-2 text-right">Hoàn thiện</th>
                <th className="py-2.5 px-2 text-right">Không xử lý</th>
                <th className="py-2.5 px-2 text-right">Đúng SLA 4h</th>
                <th className="py-2.5 px-2 text-right">TG xử lý TB</th>
                <th className="py-2.5 px-2 text-right">Kỳ so sánh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {view.channels.map(({ ch, s: c, byContent, prev }) => {
                const t = isTicketChannel(ch);
                const sla = ratio(c.withinSla, c.slaBase);
                return (
                  <tr key={ch} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2 font-sans font-semibold text-slate-900">{ch}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900">{formatNumber(c.tickets)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-700">{formatPercent(ratio(c.tickets, s.tickets))}</td>
                    <td className="py-2.5 px-2 text-right text-slate-700">{formatPercent(ratio(c.done, c.tickets))}</td>
                    <td className="py-2.5 px-2 text-right text-slate-700">{formatNumber(c.rejected)}</td>
                    <td className={`py-2.5 px-2 text-right font-semibold ${t ? (sla != null && sla >= SLA_TARGET ? 'text-emerald-700' : 'text-rose-700') : 'text-slate-400'}`}>
                      {t ? formatPercent(sla) : '—'}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700">{t ? formatDuration(ratio(c.ticketSeconds, c.ticketChannel)) : '—'}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{hasPrev ? formatNumber(prev) : '—'}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold">
                <td className="py-2.5 px-2 font-sans text-slate-900">Tổng</td>
                <td className="py-2.5 px-2 text-right text-slate-900">{formatNumber(s.tickets)}</td>
                <td className="py-2.5 px-2 text-right">100%</td>
                <td className="py-2.5 px-2 text-right">{formatPercent(ratio(s.done, s.tickets))}</td>
                <td className="py-2.5 px-2 text-right">{formatNumber(s.rejected)}</td>
                <td className="py-2.5 px-2 text-right">{formatPercent(slaRate)}</td>
                <td className="py-2.5 px-2 text-right">{formatDuration(avgTicket)}</td>
                <td className="py-2.5 px-2 text-right text-slate-500">{hasPrev ? formatNumber(p.tickets) : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500">
          SLA chỉ tính kênh Ticket (xử lý xong trong 4 giờ, không tính ticket Từ chối / Trùng lặp). Call và Chat xử lý ngay khi KH liên hệ.
        </p>
      </details>
    </div>
  );
}
