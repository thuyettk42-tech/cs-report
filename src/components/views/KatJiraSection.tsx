import React, { useEffect, useMemo, useState } from 'react';
import { formatNumber, formatPercent, minDate, ratio } from '../../services/callCenterData';
import { KatJiraIssue, loadKatJira, loadKatJiraSlaDays } from '../../services/katData';

interface Props {
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  compareLabel: string;
}

type Product = 'all' | 'KVE' | 'HKD';
const DAY = 86400000;
const toTime = (s: string) => new Date(s.replace(' ', 'T') + '+07:00').getTime();
/** Số ngày tồn: ticket đang treo tính đến hiện tại; đã xong / từ chối tính đến Resolved (không có thì lần đổi trạng thái gần nhất) */
const endTime = (x: KatJiraIssue) =>
  x.is_open ? Date.now() : x.resolved_at ? toTime(x.resolved_at) : x.changed_at ? toTime(x.changed_at) : null;
const ageDays = (x: KatJiraIssue) => { const e = endTime(x); return e == null ? NaN : (e - toTime(x.created_at)) / DAY; };
const isIssue = (x: KatJiraIssue) => x.kind !== 'Case'; // Bug, Support, Sự cố
const shops = (xs: KatJiraIssue[]) => xs.reduce((s, x) => s + (Number(x.impact_scope) || 0), 0);
const fmtDays = (d: number | null) => (d == null || !isFinite(d) ? '—' : `${d.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} ngày`);
const formatDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

const KIND_STYLE: Record<string, { label: string; box: string; text: string; sub: string }> = {
  Bug: { label: 'Bug', box: 'bg-rose-50 border-rose-200', text: 'text-rose-700', sub: 'Lỗi hệ thống' },
  Support: { label: 'Support', box: 'bg-sky-50 border-sky-200', text: 'text-sky-700', sub: 'Hỗ trợ kỹ thuật' },
  Case: { label: 'Case', box: 'bg-amber-50 border-amber-200', text: 'text-amber-700', sub: 'Đề xuất tính năng' },
  'Sự cố': { label: 'Sự cố', box: 'bg-purple-50 border-purple-200', text: 'text-purple-700', sub: 'Incident' },
};
const STATUS_COLOR: Record<string, string> = { 'Đã xong': '#1baf7a', 'Từ chối': '#94a3b8', 'Đang treo': '#eda100' };
const AGE_BUCKETS = [
  { label: '0–3 ngày', max: 3, color: '#1baf7a' },
  { label: '4–7 ngày', max: 7, color: '#2a78d6' },
  { label: '8–14 ngày', max: 14, color: '#eda100' },
  { label: '>14 ngày', max: Infinity, color: '#e11d48' },
];
const PRIORITY_STYLE: Record<string, string> = {
  Highest: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-slate-50 text-slate-600 border-slate-200',
};

function ProductPills({ value, onChange }: { value: Product; onChange: (v: Product) => void }) {
  return (
    <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
      {(['all', 'KVE', 'HKD'] as Product[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded-md ${value === p ? 'bg-white text-primary shadow-xs' : 'text-slate-500'}`}
        >
          {p === 'all' ? 'Tất cả' : p}
        </button>
      ))}
    </div>
  );
}

export default function KatJiraSection({ from, to, prevFrom, prevTo, compareLabel }: Props) {
  const [issues, setIssues] = useState<KatJiraIssue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slaDays, setSlaDays] = useState(5);
  const [product, setProduct] = useState<Product>('all');
  const [showAllCases, setShowAllCases] = useState(false);

  useEffect(() => {
    loadKatJiraSlaDays().then(setSlaDays).catch(() => undefined);
  }, []);
  useEffect(() => {
    setIssues(null);
    loadKatJira(minDate(prevFrom, from), to)
      .then(setIssues)
      .catch((e) => setError(e.message || String(e)));
  }, [from, to, prevFrom]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = useMemo(() => {
    if (!issues) return null;
    const all = issues.filter((x) => product === 'all' || x.product === product);
    const inCur = (x: KatJiraIssue) => x.created_date >= from && x.created_date <= to;
    const inPrev = (x: KatJiraIssue) => x.created_date >= prevFrom && x.created_date <= prevTo;
    const open = all.filter((x) => x.is_open);
    const cur = all.filter(inCur);
    const prev = all.filter(inPrev);
    // Ticket đã xong trong kỳ (Bug / Support / Sự cố) để tính thời gian xử lý
    const done = cur.filter((x) => isIssue(x) && x.status_group === 'Đã xong' && isFinite(ageDays(x)));

    // Vấn đề nổi cộm: Bug + Support + Sự cố tạo trong kỳ, theo nhóm vấn đề
    const topicMap = new Map<string, { topic: string; n: number; bug: number; kve: number; hkd: number; open: number; shops: number; days: number[]; services: Record<string, number>; prev: number }>();
    const getT = (t: string) =>
      topicMap.get(t) || (topicMap.set(t, { topic: t, n: 0, bug: 0, kve: 0, hkd: 0, open: 0, shops: 0, days: [], services: {}, prev: 0 }), topicMap.get(t)!);
    cur.filter(isIssue).forEach((x) => {
      const t = getT(x.topic || 'Khác');
      t.n++;
      if (x.kind === 'Bug') t.bug++;
      if (x.product === 'KVE') t.kve++;
      if (x.product === 'HKD') t.hkd++;
      if (x.is_open) t.open++;
      t.shops += Number(x.impact_scope) || 0;
      if (x.status_group === 'Đã xong' && isFinite(ageDays(x))) t.days.push(ageDays(x));
      const sv = x.service || 'Khác';
      t.services[sv] = (t.services[sv] || 0) + 1;
    });
    prev.filter(isIssue).forEach((x) => { getT(x.topic || 'Khác').prev++; });
    const topics = [...topicMap.values()].filter((t) => t.n > 0).sort((a, b) => b.n - a.n);
    const curIssues = cur.filter(isIssue);

    return {
      open,
      openShops: shops(open.filter(isIssue)),
      openByKind: (['Bug', 'Support', 'Case', 'Sự cố'] as const).map((k) => ({ k, n: open.filter((x) => x.kind === k).length })),
      openKve: open.filter((x) => x.product === 'KVE').length,
      openHkd: open.filter((x) => x.product === 'HKD').length,
      ages: AGE_BUCKETS.map((b, i) => ({
        ...b,
        n: open.filter((x) => { const a = ageDays(x); return a <= b.max && (i === 0 || a > AGE_BUCKETS[i - 1].max); }).length,
      })),
      overSla: open.filter((x) => isIssue(x) && ageDays(x) > slaDays).length,
      created: curIssues.length,
      createdPrev: prev.filter(isIssue).length,
      createdShops: shops(curIssues),
      statusMix: ['Đã xong', 'Từ chối', 'Đang treo'].map((g) => ({ g, n: curIssues.filter((x) => x.status_group === g).length })),
      withinSla: ratio(done.filter((x) => ageDays(x) <= slaDays).length, done.length),
      avgDays: ratio(done.reduce((s, x) => s + ageDays(x), 0), done.length),
      topics,
      topicTotal: topics.reduce((s, t) => s + t.n, 0),
      cases: cur
        .filter((x) => x.kind === 'Case')
        .sort((a, b) => (b.impact_scope || 0) - (a.impact_scope || 0) || b.created_at.localeCompare(a.created_at)),
    };
  }, [issues, product, from, to, prevFrom, prevTo, slaDays]);

  const header = (title: string, sub: React.ReactNode, right?: React.ReactNode) => (
    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
      {right}
    </div>
  );

  if (error || !view) {
    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs text-xs text-slate-400 text-center py-10">
        {error ? `Chưa đọc được dữ liệu Jira: ${error}. Kiểm tra đã chạy buoc13_kat_jira.sql và nạp file Jira.` : 'Đang tải dữ liệu Jira…'}
      </div>
    );
  }
  const openTotal = view.open.length;
  const shownCases = showAllCases ? view.cases : view.cases.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Ticket Jira đang mở */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          {header(
            'Ticket Chuyển SP (Jira) [Hiện tại]',
            `Ticket đang treo, tuổi tính từ ngày tạo đến hôm nay. Tổng ${formatNumber(openTotal)} ticket, ảnh hưởng ${formatNumber(view.openShops)} gian hàng (Bug / Support / Sự cố).`,
            <ProductPills value={product} onChange={setProduct} />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {view.openByKind.map(({ k, n }) => (
              <div key={k} className={`rounded-lg border p-2.5 text-center ${KIND_STYLE[k].box}`}>
                <div className={`text-[11px] font-bold uppercase ${KIND_STYLE[k].text}`}>{KIND_STYLE[k].label}</div>
                <div className={`text-2xl font-extrabold font-mono ${KIND_STYLE[k].text}`}>{formatNumber(n)}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{KIND_STYLE[k].sub}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
            <span className="text-slate-600">Phân rã nghiệp vụ:</span>
            <span className="font-bold text-slate-800">
              KVE: {formatNumber(view.openKve)} • HKD: {formatNumber(view.openHkd)}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Phân bổ tuổi ticket đang treo</span>
              <span className="font-semibold text-rose-700">
                {formatNumber(view.ages[1].n + view.ages[2].n + view.ages[3].n)} ticket &gt; 3 ngày
              </span>
            </div>
            <div className="flex h-2.5 rounded-sm overflow-hidden bg-slate-100">
              {view.ages.map((b) => (
                <div key={b.label} style={{ width: `${(b.n / Math.max(1, openTotal)) * 100}%`, backgroundColor: b.color }} title={`${b.label}: ${b.n}`}></div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[11px]">
              {view.ages.map((b) => (
                <span key={b.label} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }}></span>
                  {b.label}: <strong className="text-slate-800">{formatNumber(b.n)} ticket</strong>
                </span>
              ))}
            </div>
          </div>
          {/* Tạm ẩn SLA Dev xử lý (đôn đốc / % xử lý xong đúng hạn) – chờ người dùng có tài liệu SLA của KAT */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-700">
              Tạo trong kỳ: {formatNumber(view.created)} ticket Bug / Support / Sự cố · {formatNumber(view.createdShops)} gian hàng
            </div>
            <div className="flex h-2.5 rounded-sm overflow-hidden bg-slate-100">
              {view.statusMix.map((s) => (
                <div key={s.g} style={{ width: `${(s.n / Math.max(1, view.created)) * 100}%`, backgroundColor: STATUS_COLOR[s.g] }} title={`${s.g}: ${s.n}`}></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-600">
              {view.statusMix.map((s) => (
                <span key={s.g} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLOR[s.g] }}></span>
                  {s.g} {formatPercent(ratio(s.n, view.created))} ({formatNumber(s.n)})
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-1">
            <div>
              <div className="text-slate-500">So với {compareLabel}</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{formatNumber(view.createdPrev)}</div>
              <div className="text-slate-400">ticket tạo</div>
            </div>
            <div>
              <div className="text-slate-500">TG xử lý TB</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{fmtDays(view.avgDays)}</div>
            </div>
          </div>
        </div>

        {/* Vấn đề nổi cộm */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 min-w-0">
          {header(
            'Vấn Đề Phát Sinh Nổi Cộm (Bug + Support + Sự cố)',
            <>
              Ticket tạo từ {formatDate(from)} đến {formatDate(to)}, khái quát theo nhóm vấn đề từ tiêu đề và mô tả; so với {compareLabel}.
            </>
          )}
          {view.topics.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">Không có ticket Bug / Support / Sự cố trong kỳ.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2 text-left">Nhóm vấn đề</th>
                    <th className="py-2 px-2 text-right">Ticket</th>
                    <th className="py-2 px-2 text-right">Tỷ trọng</th>
                    <th className="py-2 px-2 text-right">Gian hàng</th>
                    <th className="py-2 px-2 text-right">Bug / Khác</th>
                    <th className="py-2 px-2 text-right">KVE / HKD</th>
                    <th className="py-2 px-2 text-left">Dịch vụ chính</th>
                    <th className="py-2 px-2 text-right">Đang treo</th>
                    <th className="py-2 px-2 text-right">TG xử lý TB</th>
                    <th className="py-2 px-2 text-right">So kỳ trước</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {view.topics.slice(0, 10).map((t) => {
                    const sv = Object.entries(t.services).sort((a, b) => b[1] - a[1])[0];
                    const d = t.prev ? (t.n - t.prev) / t.prev : null;
                    const avg = t.days.length ? t.days.reduce((s, x) => s + x, 0) / t.days.length : null;
                    return (
                      <tr key={t.topic} className="hover:bg-slate-50/70">
                        <td className="py-2 px-2 font-semibold text-slate-900">{t.topic}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{formatNumber(t.n)}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{formatPercent(ratio(t.n, view.topicTotal))}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{formatNumber(t.shops)}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {formatNumber(t.bug)} / {formatNumber(t.n - t.bug)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {formatNumber(t.kve)} / {formatNumber(t.hkd)}
                        </td>
                        <td className="py-2 px-2 text-slate-700">{sv ? `${sv[0]} (${formatPercent(ratio(sv[1], t.n), 0)})` : '—'}</td>
                        <td className={`py-2 px-2 text-right font-mono ${t.open ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>{formatNumber(t.open)}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-700">{fmtDays(avg)}</td>
                        <td className={`py-2 px-2 text-right font-mono font-semibold ${d == null ? 'text-slate-400' : d > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {d == null ? '—' : Math.abs(d) < 0.005 ? '= 0%' : `${d > 0 ? '▲' : '▼'} ${formatPercent(Math.abs(d), 0)}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-500 mt-2">
                ▲ = nhiều ticket hơn kỳ so sánh (xấu đi). Gian hàng = tổng Impact scope. Bug / Khác = Bug và Support + Sự cố. TG xử lý TB tính
                trên ticket đã xong (Created → Resolved). Lọc KVE / HKD ở khung bên trái.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Đề xuất tính năng */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        {header(
          'Đề Xuất Tính Năng & Nghiệp Vụ Mới (Case)',
          <>
            Case tạo từ {formatDate(from)} đến {formatDate(to)}: {formatNumber(view.cases.length)} case (KVE:{' '}
            {formatNumber(view.cases.filter((x) => x.product === 'KVE').length)} • HKD: {formatNumber(view.cases.filter((x) => x.product === 'HKD').length)}),
            xếp theo số shop yêu cầu.
          </>,
          <ProductPills value={product} onChange={setProduct} />
        )}
        {view.cases.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">Không có case đề xuất trong kỳ.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2 text-left">Đề xuất</th>
                  <th className="py-2 px-2 text-center">Nhóm</th>
                  <th className="py-2 px-2 text-left">Dịch vụ</th>
                  <th className="py-2 px-2 text-right">Số shop</th>
                  <th className="py-2 px-2 text-center">Ưu tiên</th>
                  <th className="py-2 px-2 text-left">Trạng thái Jira</th>
                  <th className="py-2 px-2 text-right">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shownCases.map((x) => (
                  <tr key={x.issue_key} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2">
                      {x.feature_title ? (
                        <div className="font-semibold text-slate-900">{x.feature_title}</div>
                      ) : (
                        <div className="italic text-slate-400">Ticket không ghi tên đề xuất – mở mã bên dưới trên Jira để xem</div>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono">{x.issue_key}</div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded border text-[11px] font-semibold ${x.product === 'HKD' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                        {x.product}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-700">{x.service || '—'}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{x.impact_scope != null ? formatNumber(x.impact_scope) : '—'}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded border text-[11px] ${PRIORITY_STYLE[x.priority || ''] || PRIORITY_STYLE.Medium}`}>{x.priority || '—'}</span>
                    </td>
                    <td className="py-2 px-2 text-slate-700">{x.status || '—'}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-500">{formatDate(x.created_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {view.cases.length > 8 && (
              <button type="button" onClick={() => setShowAllCases(!showAllCases)} className="mt-2 text-[11px] font-semibold text-primary">
                {showAllCases ? 'Thu gọn' : `Xem cả ${view.cases.length} case`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
