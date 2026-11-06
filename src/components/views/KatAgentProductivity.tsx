import React, { useMemo, useState } from 'react';
import { formatNumber, formatPercent, ratio } from '../../services/callCenterData';
import { KatAgentDay, isKatAgent } from '../../services/katData';

interface Props {
  rows: KatAgentDay[];
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  compareLabel: string;
  /** Tổng ticket KAT của kỳ (mọi người xử lý) để tính phần đội KAT đảm nhận */
  allTickets: number;
  target: number;
}

interface Agent {
  code: string;
  name: string;
  tickets: number;
  days: number;
  done: number;
  calls: number;
  chats: number;
  ticketChannel: number;
  slaBase: number;
  withinSla: number;
  ticketSeconds: number;
  prevPerDay: number | null;
}

/** CRM có lúc ghi "8802 -Đào Mạnh Đạt - Customer Service - KAT" → chỉ lấy "Đào Mạnh Đạt" */
function cleanName(raw: string | null, code: string): string {
  const s = (raw || '').replace(/^\s*\d{3,5}\s*-\s*/, '').split(/\s+-\s*|\s*-\s+/)[0].trim();
  return s || code;
}

/** "7h 15p", dưới 1 giờ "42p" */
function formatDuration(seconds: number | null): string {
  if (seconds == null || !isFinite(seconds)) return '—';
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}p` : `${m}p`;
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: React.ReactNode; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
      <div className={`text-2xl font-extrabold font-mono mt-1 ${tone || 'text-slate-900'}`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

export default function KatAgentProductivity({ rows, from, to, prevFrom, prevTo, compareLabel, allTickets, target }: Props) {
  const [showAll, setShowAll] = useState(false);

  const view = useMemo(() => {
    const inCur = (d: string) => d >= from && d <= to;
    const inPrev = (d: string) => d >= prevFrom && d <= prevTo;
    // Năng suất kỳ so sánh của từng người
    const prev = new Map<string, { t: number; d: Set<string> }>();
    rows.filter((r) => isKatAgent(r.handler_code) && inPrev(r.report_date) && r.tickets > 0).forEach((r) => {
      const p = prev.get(r.handler_code) || { t: 0, d: new Set<string>() };
      p.t += r.tickets;
      p.d.add(r.report_date);
      prev.set(r.handler_code, p);
    });
    const map = new Map<string, Agent & { daySet: Set<string> }>();
    rows.filter((r) => isKatAgent(r.handler_code) && inCur(r.report_date)).forEach((r) => {
      const a =
        map.get(r.handler_code) ||
        ({ code: r.handler_code, name: cleanName(r.handler_name, r.handler_code), tickets: 0, days: 0, done: 0, calls: 0, chats: 0, ticketChannel: 0, slaBase: 0, withinSla: 0, ticketSeconds: 0, prevPerDay: null, daySet: new Set<string>() } as Agent & { daySet: Set<string> });
      a.tickets += r.tickets;
      if (r.tickets > 0) a.daySet.add(r.report_date);
      a.done += r.done;
      a.calls += r.calls;
      a.chats += r.chats;
      a.ticketChannel += r.ticket_channel;
      a.slaBase += r.sla_base;
      a.withinSla += r.within_sla;
      a.ticketSeconds += Number(r.ticket_seconds) || 0;
      if (r.handler_name) a.name = cleanName(r.handler_name, r.handler_code); // tên mới nhất
      map.set(r.handler_code, a);
    });
    const agents: Agent[] = [...map.values()]
      .map(({ daySet, ...a }) => {
        const p = prev.get(a.code);
        return { ...a, days: daySet.size, prevPerDay: p && p.d.size ? p.t / p.d.size : null };
      })
      .filter((a) => a.tickets > 0)
      .sort((x, y) => y.tickets / y.days - x.tickets / x.days);

    const tickets = agents.reduce((s, a) => s + a.tickets, 0);
    const personDays = agents.reduce((s, a) => s + a.days, 0);
    const prevT = [...prev.values()].reduce((s, p) => s + p.t, 0);
    const prevD = [...prev.values()].reduce((s, p) => s + p.d.size, 0);

    // Ticket KAT do đội khác xử lý (không phải mã 88)
    const others = new Map<string, number>();
    rows.filter((r) => !isKatAgent(r.handler_code) && inCur(r.report_date)).forEach((r) => {
      const team = r.handler_team || (r.handler_code ? 'Khác' : 'Chưa có người xử lý');
      others.set(team, (others.get(team) || 0) + r.tickets);
    });
    return {
      agents,
      tickets,
      perDay: ratio(tickets, personDays),
      prevPerDay: prevD ? prevT / prevD : null,
      meet: agents.filter((a) => a.tickets / a.days >= target).length,
      others: [...others.entries()].sort((a, b) => b[1] - a[1]),
      maxPerDay: Math.max(target * 1.3, ...agents.map((a) => a.tickets / a.days)),
    };
  }, [rows, from, to, prevFrom, prevTo, target]);

  const shown = showAll ? view.agents : view.agents.slice(0, 12);
  const othersTotal = view.others.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Năng Suất Nhân Sự KAT</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Nhân viên có mã tổng đài 88xx, tính theo người xử lý ticket. Năng suất = ticket / ngày làm việc (ngày có ít nhất 1 ticket). Mục tiêu ≥{' '}
          {formatNumber(target)} ticket/ngày; so với {compareLabel}.
        </p>
      </div>

      {view.agents.length === 0 ? (
        <div className="text-xs text-slate-400 py-8 text-center">
          Chưa có số liệu theo nhân viên cho kỳ này (cần chạy SQL bước 12 và nạp lại ticket để có cột người xử lý).
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
              label="Đội KAT tự xử lý"
              value={formatPercent(ratio(view.tickets, allTickets))}
              tone="text-slate-900"
              sub={`${formatNumber(view.tickets)} ticket · ${formatNumber(view.agents.length)} nhân sự 88xx`}
            />
            <Stat
              label="Do đội khác xử lý"
              value={formatPercent(ratio(allTickets - view.tickets, allTickets))}
              tone="text-amber-700"
              sub={
                view.others.length
                  ? `${formatNumber(allTickets - view.tickets)} ticket · nhiều nhất ${view.others[0][0]} (${formatPercent(ratio(view.others[0][1], allTickets - view.tickets), 0)})`
                  : `${formatNumber(allTickets - view.tickets)} ticket`
              }
            />
            <Stat
              label="TB ticket / người / ngày"
              value={view.perDay == null ? '—' : view.perDay.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
              tone={view.perDay != null && view.perDay >= target ? 'text-emerald-700' : 'text-rose-700'}
              sub={
                <>
                  Mục tiêu ≥{formatNumber(target)} · kỳ so sánh{' '}
                  {view.prevPerDay == null ? '—' : view.prevPerDay.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                </>
              }
            />
            <Stat
              label="Đạt mục tiêu"
              value={`${view.meet}/${view.agents.length}`}
              tone={view.meet === view.agents.length ? 'text-emerald-700' : 'text-amber-700'}
              sub="nhân sự có TB ≥ mục tiêu"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2 text-left">Nhân viên</th>
                    <th className="py-2 px-2 text-left w-[28%]">Ticket / ngày</th>
                    <th className="py-2 px-2 text-right">Ticket</th>
                    <th className="py-2 px-2 text-right">Ngày làm</th>
                    <th className="py-2 px-2 text-right">Call / Chat / Ticket</th>
                    <th className="py-2 px-2 text-right">Hoàn thiện</th>
                    <th className="py-2 px-2 text-right">Đúng SLA 4h</th>
                    <th className="py-2 px-2 text-right">TG xử lý TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((a, i) => {
                    const perDay = a.tickets / a.days;
                    const ok = perDay >= target;
                    const sla = ratio(a.withinSla, a.slaBase);
                    const d = a.prevPerDay == null ? null : perDay - a.prevPerDay;
                    return (
                      <tr key={a.code} className="hover:bg-slate-50/70">
                        <td className="py-2 px-2 text-center font-mono text-slate-500">{i + 1}</td>
                        <td className="py-2 px-2">
                          <div className="font-semibold text-slate-900">{a.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{a.code}</div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1 h-2.5 bg-slate-100 rounded-sm">
                              <div
                                className={`h-full rounded-sm ${ok ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                style={{ width: `${Math.min(100, (perDay / view.maxPerDay) * 100)}%` }}
                              ></div>
                              <div
                                className="absolute -top-1 -bottom-1 w-0.5 bg-slate-700"
                                style={{ left: `${(target / view.maxPerDay) * 100}%` }}
                                title={`Mục tiêu ${target}`}
                              ></div>
                            </div>
                            <span className={`font-mono font-bold w-10 text-right ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {perDay.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                            </span>
                            <span className={`text-[10px] w-12 text-right ${d == null ? 'text-slate-300' : d >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {d == null ? '—' : `${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{formatNumber(a.tickets)}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{a.days}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {formatNumber(a.calls)} / {formatNumber(a.chats)} / {formatNumber(a.ticketChannel)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{formatPercent(ratio(a.done, a.tickets))}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{a.slaBase ? formatPercent(sla) : '—'}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">
                          {a.ticketChannel ? formatDuration(a.ticketSeconds / a.ticketChannel) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span>Vạch đen = mục tiêu {formatNumber(target)} ticket/ngày. ▲▼ = chênh lệch so với kỳ so sánh. SLA và thời gian xử lý chỉ tính kênh Ticket.</span>
                {view.agents.length > 12 && (
                  <button type="button" onClick={() => setShowAll(!showAll)} className="font-semibold text-primary">
                    {showAll ? 'Thu gọn' : `Xem cả ${view.agents.length} người`}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">Ticket KAT do đội khác xử lý</h3>
              <p className="text-[11px] text-slate-500">
                {formatNumber(othersTotal)} ticket ({formatPercent(ratio(othersTotal, allTickets))}) không do mã 88xx xử lý.
              </p>
              <div className="space-y-1.5">
                {view.others.slice(0, 8).map(([team, n]) => (
                  <div key={team} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1">
                    <span className="text-slate-700">{team}</span>
                    <span className="font-mono text-slate-900">
                      {formatNumber(n)} <span className="text-[10px] text-slate-400">({formatPercent(ratio(n, othersTotal), 0)})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
