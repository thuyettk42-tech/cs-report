import React, { useMemo } from 'react';
import {
  AI_QA_LINES,
  AiQaRow,
  CallCenterData,
  CallDailyRow,
  CallTeamRow,
  DayDetail,
  QueueInfo,
  formatNumber,
  formatPercent,
  queueStatsByDay,
  ratio,
  sumBy,
  sumStats,
} from '../../services/callCenterData';
import { Legend, LineChart, SERIES_COLORS } from './callCenterCharts';

interface AiAnalysisProps {
  data: CallCenterData;
  trend: DayDetail | null;
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  periodText: string;
  compareLabel: string;
  targetSelf?: number;
  targetCorrect?: number;
}

interface AiStat {
  offered: number;
  ai: number;
  checked: number;
  hangup: number;
  self: number;
  correct: number;
}

const between = (from: string, to: string) => (d: string) => d >= from && d <= to;

/** Số 3CX (cuộc đến, cuộc AI nghe) + kết quả chấm của 1 line trong khoảng ngày */
function lineStat(
  byDay: ReturnType<typeof queueStatsByDay>,
  aiQa: AiQaRow[],
  line: (typeof AI_QA_LINES)[number],
  keep: (d: string) => boolean
): AiStat {
  const q = sumStats(byDay, [line.ext], keep);
  const rows = aiQa.filter((r) => r.line === line.line && keep(r.report_date));
  return {
    offered: q.offered,
    ai: q.ai,
    checked: sumBy(rows, (r) => r.checked),
    hangup: sumBy(rows, (r) => r.hangup),
    self: sumBy(rows, (r) => r.self_resolved),
    correct: sumBy(rows, (r) => r.correct),
  };
}

const addAi = (a: AiStat, b: AiStat): AiStat => ({
  offered: a.offered + b.offered,
  ai: a.ai + b.ai,
  checked: a.checked + b.checked,
  hangup: a.hangup + b.hangup,
  self: a.self + b.self,
  correct: a.correct + b.correct,
});
const ZERO: AiStat = { offered: 0, ai: 0, checked: 0, hangup: 0, self: 0, correct: 0 };

/** Các tỷ lệ theo đúng công thức sheet "BÁO CÁO CALL" */
function rates(s: AiStat) {
  return {
    aiShare: ratio(s.ai, s.offered),
    checkedRate: ratio(s.checked, s.ai),
    hangupRate: ratio(s.hangup, s.checked),
    selfRate: ratio(s.self, s.checked - s.hangup),
    correctRate: ratio(s.correct, s.self),
  };
}

/** Tỷ trọng cuộc Voice AI trên tổng cuộc đến toàn tổng đài */
function overallShare(daily: CallDailyRow[], team: CallTeamRow[], keep: (d: string) => boolean) {
  const offered = sumBy(daily.filter((r) => keep(r.report_date)), (r) => r.offered);
  const ai = sumBy(team.filter((r) => r.team === 'Voice AI Bot' && keep(r.report_date)), (r) => r.handled);
  return { offered, ai, share: ratio(ai, offered) };
}

function PointDelta({ cur, prev, invert = false }: { cur: number | null; prev: number | null; invert?: boolean }) {
  if (cur == null || prev == null) return null;
  const d = (cur - prev) * 100;
  if (Math.abs(d) < 0.05) return <span className="text-slate-500">= kỳ so sánh</span>;
  const bad = invert ? d > 0 : d < 0;
  return (
    <span className={`font-semibold ${bad ? 'text-rose-700' : 'text-emerald-700'}`}>
      {d > 0 ? '▲' : '▼'} {Math.abs(d).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} điểm
    </span>
  );
}

function Tile({ label, value, tone, delta, sub }: { label: string; value: string; tone?: string; delta?: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[11px] font-semibold uppercase text-slate-500 leading-tight">{label}</div>
      <div className={`text-2xl font-extrabold font-mono mt-1 ${tone || 'text-slate-900'}`}>{value}</div>
      {delta && <div className="text-xs">{delta}</div>}
      <div className="text-[11px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

const vsTarget = (v: number | null, target?: number) =>
  v == null || target == null ? 'text-slate-900' : v >= target ? 'text-emerald-700' : 'text-rose-700';

export default function AiAnalysis(props: AiAnalysisProps) {
  const { data, trend, from, to, prevFrom, prevTo, periodText, compareLabel, targetSelf, targetCorrect } = props;

  const view = useMemo(() => {
    const byDay = queueStatsByDay(data.queueDays, data.aiDays, data.queueInfo);
    const inCur = between(from, to);
    const inPrev = between(prevFrom, prevTo);
    const lines = AI_QA_LINES.map((l) => ({ ...l, cur: lineStat(byDay, data.aiQaDays, l, inCur), prev: lineStat(byDay, data.aiQaDays, l, inPrev) }));
    const cur = lines.reduce((a, l) => addAi(a, l.cur), ZERO);
    const prev = lines.reduce((a, l) => addAi(a, l.prev), ZERO);
    return {
      lines,
      cur,
      prev,
      overall: overallShare(data.daily, data.team, inCur),
      overallPrev: overallShare(data.daily, data.team, inPrev),
    };
  }, [data, from, to, prevFrom, prevTo]);

  // Xu hướng theo tháng (từ khi có số chấm AI): tỷ trọng AI toàn tổng đài, tỷ lệ tự xử lý, xử lý đúng
  const monthly = useMemo(() => {
    if (!trend) return [];
    const months = [...new Set(trend.aiQaDays.map((r) => r.report_date.slice(0, 7)))].sort();
    const byDay = queueStatsByDay(trend.queueDays, trend.aiDays, (data.queueInfo || {}) as Record<string, QueueInfo>);
    return months.map((m) => {
      const keep = (d: string) => d.startsWith(m);
      const s = AI_QA_LINES.reduce((a, l) => addAi(a, lineStat(byDay, trend.aiQaDays, l, keep)), ZERO);
      return { month: m, share: overallShare(trend.daily, trend.team, keep).share, ...rates(s) };
    });
  }, [trend, data.queueInfo]);

  const { lines, cur, prev, overall, overallPrev } = view;
  const r = rates(cur);
  const p = rates(prev);
  const hasPrev = prev.checked > 0;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Phân Tích Voice AI – Tiếp Nhận và Chất Lượng Xử Lý</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {periodText}, {compareLabel}. Cuộc AI tiếp nhận lấy từ 3CX; kết quả chấm lấy từ file "[OM] Báo cáo chất lượng call của AI Agent"
          (có từ tháng 6/2026), tính như sheet "BÁO CÁO CALL".
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Tile
          label="Tỷ trọng AI tiếp nhận"
          value={formatPercent(overall.share)}
          delta={<PointDelta cur={overall.share} prev={overallPrev.share} />}
          sub={`${formatNumber(overall.ai)} / ${formatNumber(overall.offered)} cuộc đến toàn tổng đài`}
        />
        <Tile
          label="Tỷ lệ call AI được chấm"
          value={formatPercent(r.checkedRate)}
          sub={`${formatNumber(cur.checked)} cuộc chấm / ${formatNumber(cur.ai)} cuộc AI của 4 line`}
        />
        <Tile
          label="KH ngắt máy ngang"
          value={formatPercent(r.hangupRate)}
          delta={hasPrev ? <PointDelta cur={r.hangupRate} prev={p.hangupRate} invert /> : null}
          sub={`${formatNumber(cur.hangup)} cuộc, trên số cuộc chấm`}
        />
        <Tile
          label="AI tự xử lý"
          value={formatPercent(r.selfRate)}
          tone={vsTarget(r.selfRate, targetSelf)}
          delta={hasPrev ? <PointDelta cur={r.selfRate} prev={p.selfRate} /> : null}
          sub={
            <>
              {formatNumber(cur.self)} / {formatNumber(cur.checked - cur.hangup)} cuộc (trừ ngắt máy)
              {targetSelf != null && <> · KPI ≥{formatPercent(targetSelf, 0)}</>}
            </>
          }
        />
        <Tile
          label="AI xử lý đúng"
          value={formatPercent(r.correctRate)}
          tone={vsTarget(r.correctRate, targetCorrect)}
          delta={hasPrev ? <PointDelta cur={r.correctRate} prev={p.correctRate} /> : null}
          sub={
            <>
              {formatNumber(cur.correct)} / {formatNumber(cur.self)} cuộc tự xử lý
              {targetCorrect != null && <> · KPI ≥{formatPercent(targetCorrect, 0)}</>}
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trái: theo line */}
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm font-bold text-slate-800">Theo từng line</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-1.5 text-left">Line</th>
                  <th className="py-2 px-1.5 text-right">AI nghe</th>
                  <th className="py-2 px-1.5 text-right">Tỷ trọng AI</th>
                  <th className="py-2 px-1.5 text-right">Được chấm</th>
                  <th className="py-2 px-1.5 text-right">Ngắt máy</th>
                  <th className="py-2 px-1.5 text-right">Tự xử lý</th>
                  <th className="py-2 px-1.5 text-right">Xử lý đúng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {[...lines.map((l) => ({ key: l.line, label: l.label, s: l.cur, total: false })), { key: 'total', label: 'Tổng 4 line', s: cur, total: true }].map(
                  (row) => {
                    const x = rates(row.s);
                    return (
                      <tr key={row.key} className={row.total ? 'bg-slate-100 font-bold' : ''}>
                        <td className="py-2 px-1.5 font-sans font-semibold text-slate-900">{row.label}</td>
                        <td className="py-2 px-1.5 text-right">{formatNumber(row.s.ai)}</td>
                        <td className="py-2 px-1.5 text-right" title={`${formatNumber(row.s.ai)} / ${formatNumber(row.s.offered)} cuộc đến của line`}>
                          {formatPercent(x.aiShare)}
                        </td>
                        <td className="py-2 px-1.5 text-right" title={`${formatNumber(row.s.checked)} cuộc chấm`}>
                          {formatNumber(row.s.checked)} <span className="text-[10px] text-slate-500">({formatPercent(x.checkedRate, 0)})</span>
                        </td>
                        <td className="py-2 px-1.5 text-right">{formatPercent(x.hangupRate)}</td>
                        <td className={`py-2 px-1.5 text-right font-semibold ${vsTarget(x.selfRate, targetSelf)}`}>{formatPercent(x.selfRate)}</td>
                        <td className={`py-2 px-1.5 text-right font-semibold ${vsTarget(x.correctRate, targetCorrect)}`}>{formatPercent(x.correctRate)}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tỷ trọng AI = cuộc AI nghe / cuộc đến của line (3CX). Được chấm = cuộc chấm / cuộc AI nghe. Ngắt máy = KH ngắt máy ngang / cuộc chấm.
            Tự xử lý = tự xử lý / (cuộc chấm − ngắt máy). Xử lý đúng = tự xử lý và Pass / tự xử lý. Xanh = đạt KPI, đỏ = chưa đạt.
          </p>
        </div>

        {/* Phải: xu hướng theo tháng */}
        <div className="min-w-0 space-y-2">
          <h3 className="text-sm font-bold text-slate-800">Xu hướng theo tháng</h3>
          {monthly.length === 0 ? (
            <div className="text-xs text-slate-400 py-10 text-center">Chưa có số chấm call AI.</div>
          ) : (
            <>
              <Legend
                items={[
                  { label: 'Tỷ trọng AI tiếp nhận', color: SERIES_COLORS[0] },
                  { label: 'AI tự xử lý', color: SERIES_COLORS[1] },
                  { label: 'AI xử lý đúng', color: SERIES_COLORS[2] },
                ]}
              />
              <LineChart
                height={240}
                dots
                xLabels={monthly.map((m) => 'T' + Number(m.month.slice(5)))}
                series={[
                  { key: 'share', label: 'Tỷ trọng AI tiếp nhận', color: SERIES_COLORS[0], values: monthly.map((m) => m.share) },
                  { key: 'self', label: 'AI tự xử lý', color: SERIES_COLORS[1], values: monthly.map((m) => m.selfRate) },
                  { key: 'correct', label: 'AI xử lý đúng', color: SERIES_COLORS[2], values: monthly.map((m) => m.correctRate) },
                ]}
                format={(v) => formatPercent(v)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
