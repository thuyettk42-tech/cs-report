import React from 'react';
import { formatNumber } from '../../services/callCenterData';
import { KatIncident } from '../../services/katData';

interface Props {
  /** null = đang tải; chuỗi = lỗi đọc dữ liệu */
  incidents: KatIncident[] | null | string;
  from: string;
  to: string;
  periodLabel: string;
}

const formatDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

/** Màu mức độ dùng bảng màu trạng thái (luôn kèm biểu tượng + chữ, không chỉ dựa vào màu) */
export const SEVERITY_STYLE: Record<string, { cls: string; icon: string }> = {
  'Nghiêm trọng': { cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'error' },
  'Ảnh hưởng vận hành': { cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: 'warning' },
  Nhẹ: { cls: 'bg-slate-50 text-slate-600 border-slate-200', icon: 'info' },
};

function SeverityBadge({ value }: { value: string | null }) {
  const st = value ? SEVERITY_STYLE[value] : undefined;
  if (!st) return <span className="text-[11px] text-slate-400 italic">Chưa đánh giá</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${st.cls}`}>
      <span className="material-symbols-outlined text-[14px] leading-none">{st.icon}</span>
      {value}
    </span>
  );
}

/** Mã lỗi dài (vd "206002: HDon/DLHDon/…") → chỉ hiện số mã, nguyên văn để trong chú thích khi rê chuột */
const shortCode = (c: string) => (c.match(/^\s*(\d{3,6})\b/) || [])[1] || (c.length > 40 ? c.slice(0, 40) + '…' : c);

export function incidentsInRange(xs: KatIncident[], from: string, to: string) {
  return xs.filter((x) => x.incident_date >= from && x.incident_date <= to);
}

export default function KatIncidentSection({ incidents, from, to, periodLabel }: Props) {
  const list = Array.isArray(incidents)
    ? incidentsInRange(incidents, from, to).sort((a, b) => a.incident_date.localeCompare(b.incident_date) || a.row_no - b.row_no)
    : [];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Thống Kê Sự Cố Sản Phẩm [{periodLabel}]</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi sự cố 1 dòng · nguồn: sheet "Sự cố KAT" (quản lý ghi nhận). Mức độ và tóm tắt lấy từ cột H–J của sheet.
          </p>
        </div>
        {Array.isArray(incidents) && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${list.length ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
            {list.length ? `${formatNumber(list.length)} sự cố trong kỳ` : 'Không có sự cố'}
          </span>
        )}
      </div>

      {incidents === null ? (
        <p className="text-xs text-slate-400 py-6 text-center">Đang tải…</p>
      ) : typeof incidents === 'string' ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Chưa đọc được danh sách sự cố: {incidents}. Kiểm tra đã chạy <b>buoc15_tao_bang_su_co.sql</b> và hàm <b>dongBoSuCo</b>.
        </p>
      ) : list.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-emerald-700">
          <span className="material-symbols-outlined">check_circle</span>
          Không ghi nhận sự cố phát sinh trong kỳ.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="py-2 px-2 font-semibold w-20">Ngày</th>
                <th className="py-2 px-2 font-semibold">Tên lỗi</th>
                <th className="py-2 px-2 font-semibold w-40">Mức độ</th>
                <th className="py-2 px-2 font-semibold w-44">Thời gian xử lý</th>
                <th className="py-2 px-2 font-semibold w-32 text-right">Gian hàng ảnh hưởng</th>
                <th className="py-2 px-2 font-semibold">Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.row_no} className="border-b border-slate-100 align-top hover:bg-slate-50">
                  <td className="py-2.5 px-2 font-mono text-slate-700 whitespace-nowrap">{formatDate(x.incident_date)}</td>
                  <td className="py-2.5 px-2">
                    <div className="font-semibold text-slate-900">{x.error_name}</div>
                    {x.error_code && (
                      <div className="text-[11px] text-slate-500 mt-0.5" title={x.error_code}>
                        Mã lỗi: <span className="font-mono">{shortCode(x.error_code)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    <SeverityBadge value={x.severity} />
                  </td>
                  <td className="py-2.5 px-2 text-slate-700">{x.handle_time || '—'}</td>
                  <td className="py-2.5 px-2 text-right" title={x.impact_text || undefined}>
                    {x.stores_reported == null ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <>
                        <span className="font-mono font-semibold text-slate-900">{formatNumber(x.stores_reported)}</span>
                        <span className="text-slate-500"> báo lỗi</span>
                        {x.stores_actual != null && (
                          <div className="text-[11px] text-slate-500">thực tế {formatNumber(x.stores_actual)}</div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-slate-700 leading-relaxed">{x.summary || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
