import React, { useMemo } from 'react';
import {
  CallCenterData,
  DayDetail,
  QA_SEVERITY,
  QaRow,
  QaSeverityKey,
  formatNumber,
  formatPercent,
  ratio,
  severityOfCriterion,
  summarizeQa,
} from '../../services/callCenterData';
import { Legend, LineChart, SERIES_COLORS } from './callCenterCharts';

/** 4 màu phân biệt rõ (bảng màu chung của các biểu đồ), cùng màu ở thanh, biểu đồ và bảng lý do */
const SEV_COLOR: Record<QaSeverityKey, string> = {
  sev_attitude: SERIES_COLORS[0],
  sev_unresolved: SERIES_COLORS[1],
  sev_process: SERIES_COLORS[2],
  sev_communication: SERIES_COLORS[3],
};
const TOTAL_COLOR = '#334155';

const TOP_REASONS = 5;

interface QaAnalysisProps {
  data: CallCenterData;
  trend: DayDetail | null;
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  periodText: string;
  compareLabel: string;
  target?: number;
}

const inRange = (from: string, to: string) => (r: { report_date: string }) => r.report_date >= from && r.report_date <= to;

/** Chênh lệch điểm % giữa 2 tỷ lệ; invert = tăng là xấu */
function PointDelta({ cur, prev, invert = false }: { cur: number | null; prev: number | null; invert?: boolean }) {
  if (cur == null || prev == null) return <span className="text-slate-400">—</span>;
  const d = (cur - prev) * 100;
  if (Math.abs(d) < 0.05) return <span className="text-slate-500">0 điểm</span>;
  const bad = invert ? d > 0 : d < 0;
  return (
    <span className={`font-semibold ${bad ? 'text-rose-700' : 'text-emerald-700'}`}>
      {d > 0 ? '▲' : '▼'} {Math.abs(d).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} điểm
    </span>
  );
}

function StatTile({ label, value, sub, delta }: { label: string; value: string; sub: React.ReactNode; delta?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3.5">
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{value}</div>
      {delta && <div className="text-xs mt-0.5">{delta}</div>}
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

export default function QaAnalysis({ data, trend, from, to, prevFrom, prevTo, periodText, compareLabel, target }: QaAnalysisProps) {
  const view = useMemo(() => {
    const curRows = data.qaDays.filter(inRange(from, to));
    const prevRows = data.qaDays.filter(inRange(prevFrom, prevTo));
    const cur = summarizeQa(curRows);
    const prev = summarizeQa(prevRows);

    // Lý do lỗi: cộng số cuộc theo (tiêu chí, lý do) trong kỳ và kỳ so sánh
    const sumReasons = (lo: string, hi: string) => {
      const m = new Map<string, { criterion: string; reason: string; calls: number }>();
      data.qaReasons.filter(inRange(lo, hi)).forEach((r) => {
        const k = r.criterion + '|' + r.reason;
        const e = m.get(k) || { criterion: r.criterion, reason: r.reason, calls: 0 };
        e.calls += r.calls;
        m.set(k, e);
      });
      return m;
    };
    const prevReasons = sumReasons(prevFrom, prevTo);
    const reasons = [...sumReasons(from, to).entries()]
      .map(([k, r]) => ({ ...r, key: k, sev: severityOfCriterion(r.criterion), prevCalls: prevReasons.get(k)?.calls ?? 0 }))
      .sort((a, b) => b.calls - a.calls);

    // Theo đội của ĐTV (lấy từ danh sách ĐTV có cuộc trong kỳ)
    const teamOf = new Map(data.agents.map((a) => [a.ext, a.team || 'Khác']));
    const byTeam = new Map<string, QaRow[]>();
    curRows.forEach((r) => {
      const t = teamOf.get(r.ext) || 'Khác';
      byTeam.set(t, [...(byTeam.get(t) || []), r]);
    });
    const teams = ['Inhouse', 'OS Partner', 'Khác']
      .filter((t) => byTeam.has(t))
      .map((t) => ({ team: t, s: summarizeQa(byTeam.get(t) as QaRow[]) }));

    return { cur, prev, reasons, teams };
  }, [data, from, to, prevFrom, prevTo]);

  // Xu hướng theo tháng: tỷ lệ cuộc lỗi theo nhóm nghiêm trọng (% trên số cuộc chấm)
  const monthly = useMemo(() => {
    if (!trend) return [];
    const months = [...new Set(trend.qaDays.map((r) => r.report_date.slice(0, 7)))].sort();
    return months
      .map((m) => ({ month: m, s: summarizeQa(trend.qaDays.filter((r) => r.report_date.startsWith(m))) }))
      .filter((m) => m.s.count > 0);
  }, [trend]);

  const { cur, prev, reasons, teams } = view;
  const hasPrev = prev.count > 0;
  const errRate = ratio(cur.errorCalls, cur.count);
  const prevErrRate = hasPrev ? ratio(prev.errorCalls, prev.count) : null;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Phân Tích Chất Lượng Cuộc Gọi (QA Chấm)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {periodText}, {compareLabel}. Chỉ lượt chấm kênh Call trong sheet "Form Responses 2", tính theo ngày QA chấm. Cuộc lỗi = có ghi
          nhận ở ít nhất 1 tiêu chí; mỗi cuộc lỗi tính 1 lần, xếp theo nhóm nghiêm trọng nhất.
        </p>
      </div>

      {cur.count === 0 ? (
        <div className="text-xs text-slate-400 py-8 text-center">Chưa có cuộc nào được QA chấm trong kỳ này.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile
              label="Cuộc được chấm"
              value={formatNumber(cur.count)}
              sub={hasPrev ? `Kỳ so sánh: ${formatNumber(prev.count)} cuộc` : 'Kỳ so sánh: chưa có lượt chấm'}
            />
            <StatTile
              label="Tỷ lệ cuộc lỗi"
              value={formatPercent(errRate)}
              delta={<PointDelta cur={errRate} prev={prevErrRate} invert />}
              sub={`${formatNumber(cur.errorCalls)} cuộc lỗi · ${formatNumber(cur.count - cur.errorCalls)} không lỗi`}
            />
            <StatTile
              label="KH khen / hài lòng / 5 sao"
              value={formatPercent(ratio(cur.praise, cur.count))}
              delta={<PointDelta cur={ratio(cur.praise, cur.count)} prev={hasPrev ? ratio(prev.praise, prev.count) : null} />}
              sub={`${formatNumber(cur.praise)} cuộc được khen`}
            />
            <StatTile
              label="Điểm QA trung bình"
              value={cur.score == null ? '—' : String(cur.score)}
              sub={
                <>
                  {target != null && <span>Mục tiêu ≥{formatNumber(target)} · </span>}
                  Kỳ so sánh: {hasPrev && prev.score != null ? prev.score : '—'}
                </>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trái: cơ cấu cuộc lỗi theo mức nghiêm trọng + theo đội */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-sm font-bold text-slate-800">Cuộc lỗi theo mức nghiêm trọng – kỳ đang xem</h3>
              <table className="w-full text-xs">
                <thead className="text-[11px] text-slate-500 uppercase">
                  <tr>
                    <th className="pb-1.5 text-left font-semibold">Nhóm lỗi</th>
                    <th className="pb-1.5 text-right font-semibold">Cuộc</th>
                    <th className="pb-1.5 text-right font-semibold">% chấm</th>
                    <th className="pb-1.5 text-right font-semibold">So kỳ trước</th>
                  </tr>
                </thead>
                <tbody>
                  {QA_SEVERITY.map((s, i) => {
                    const n = cur.bySeverity[s.key];
                    const share = ratio(n, cur.count);
                    const prevShare = hasPrev ? ratio(prev.bySeverity[s.key], prev.count) : null;
                    const maxShare = Math.max(...QA_SEVERITY.map((x) => cur.bySeverity[x.key] / cur.count), 0.0001);
                    return (
                      <tr key={s.key} title={s.detail}>
                        <td className="py-1.5 pr-2 w-1/2">
                          <div className="font-semibold text-slate-800">
                            {i + 1}. {s.label}
                          </div>
                          <div className="h-2 bg-slate-100 rounded-sm overflow-hidden mt-1">
                            <div className="h-full rounded-sm" style={{ width: `${((share || 0) / maxShare) * 100}%`, backgroundColor: SEV_COLOR[s.key] }}></div>
                          </div>
                        </td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatNumber(n)}</td>
                        <td className="py-1.5 text-right font-mono text-slate-700">{formatPercent(share)}</td>
                        <td className="py-1.5 text-right text-[11px]">
                          <PointDelta cur={share} prev={prevShare} invert />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {teams.length > 0 && (
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-1.5 px-1.5">Đội</th>
                        <th className="py-1.5 px-1.5 text-right">Chấm</th>
                        <th className="py-1.5 px-1.5 text-right">Điểm</th>
                        <th className="py-1.5 px-1.5 text-right">% lỗi</th>
                        {QA_SEVERITY.map((s, i) => (
                          <th key={s.key} className="py-1.5 px-1.5 text-right" title={s.label}>
                            N{i + 1}
                          </th>
                        ))}
                        <th className="py-1.5 px-1.5 text-right">Khen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {teams.map(({ team, s }) => (
                        <tr key={team}>
                          <td className="py-1.5 px-1.5 font-sans font-semibold text-slate-900">{team}</td>
                          <td className="py-1.5 px-1.5 text-right">{formatNumber(s.count)}</td>
                          <td className={`py-1.5 px-1.5 text-right font-semibold ${target != null && s.score != null && s.score < target ? 'text-rose-700' : 'text-slate-900'}`}>
                            {s.score ?? '—'}
                          </td>
                          <td className="py-1.5 px-1.5 text-right">{formatPercent(ratio(s.errorCalls, s.count))}</td>
                          {QA_SEVERITY.map((g) => (
                            <td key={g.key} className="py-1.5 px-1.5 text-right text-slate-700">
                              {formatNumber(s.bySeverity[g.key])}
                            </td>
                          ))}
                          <td className="py-1.5 px-1.5 text-right text-slate-700">{formatNumber(s.praise)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] text-slate-400 mt-1">
                    N1–N4: số cuộc lỗi nhóm 1–4. "Khác": ĐTV không có cuộc nghe trong kỳ nên chưa xác định được đội.
                  </p>
                </div>
              )}
            </div>

            {/* Phải: xu hướng theo tháng */}
            <div className="space-y-3 min-w-0">
              <h3 className="text-sm font-bold text-slate-800">Tỷ lệ cuộc lỗi theo tháng, chia theo mức nghiêm trọng</h3>
              {monthly.length === 0 ? (
                <div className="text-xs text-slate-400 py-10 text-center">Chưa có dữ liệu theo tháng.</div>
              ) : (
                <>
                  <Legend
                    items={[
                      ...QA_SEVERITY.map((s) => ({ label: s.label, color: SEV_COLOR[s.key] })),
                      { label: 'Tổng cuộc lỗi', color: TOTAL_COLOR, dashed: true },
                    ]}
                  />
                  <LineChart
                    height={250}
                    dots
                    xLabels={monthly.map((m) => 'T' + Number(m.month.slice(5)))}
                    series={[
                      ...QA_SEVERITY.map((s) => ({
                        key: s.key,
                        label: s.label,
                        color: SEV_COLOR[s.key],
                        values: monthly.map((m) => m.s.bySeverity[s.key] / m.s.count),
                      })),
                      {
                        key: 'total',
                        label: 'Tổng cuộc lỗi',
                        color: TOTAL_COLOR,
                        dashed: true,
                        values: monthly.map((m) => m.s.errorCalls / m.s.count),
                      },
                    ]}
                    format={(v) => formatPercent(v)}
                  />
                  <p className="text-[11px] text-slate-500">Mỗi đường = số cuộc lỗi của nhóm / số cuộc được chấm trong tháng. Đường nét đứt = tổng cuộc lỗi.</p>
                </>
              )}
            </div>
          </div>

          {/* Lý do lỗi hay gặp */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800">{TOP_REASONS} lý do lỗi hay gặp nhất trong kỳ</h3>
            {reasons.length === 0 ? (
              <div className="text-xs text-slate-400 py-4">Không có lỗi nào được ghi nhận.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2 w-8">#</th>
                      <th className="py-2 px-2">Lý do</th>
                      <th className="py-2 px-2">Tiêu chí</th>
                      <th className="py-2 px-2">Nhóm</th>
                      <th className="py-2 px-2 text-right">Số cuộc</th>
                      <th className="py-2 px-2 text-right">% cuộc chấm</th>
                      <th className="py-2 px-2 text-right">Kỳ so sánh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reasons.slice(0, TOP_REASONS).map((r, i) => {
                      const sev = QA_SEVERITY.find((s) => s.key === r.sev);
                      return (
                        <tr key={r.key}>
                          <td className="py-2 px-2 font-mono text-slate-500">{i + 1}</td>
                          <td className="py-2 px-2 text-slate-900">{r.reason}</td>
                          <td className="py-2 px-2 text-slate-600">{r.criterion}</td>
                          <td className="py-2 px-2">
                            {sev ? (
                              <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: SEV_COLOR[sev.key] }}></span>
                                {sev.label}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{formatNumber(r.calls)}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-700">{formatPercent(ratio(r.calls, cur.count))}</td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500">{hasPrev ? formatNumber(r.prevCalls) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {reasons.length > TOP_REASONS && (
                  <p className="text-[11px] text-slate-400 mt-1">Còn {reasons.length - TOP_REASONS} lý do khác ít gặp hơn.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
