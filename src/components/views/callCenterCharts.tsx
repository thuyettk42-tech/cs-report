import React, { useEffect, useRef, useState } from 'react';

/**
 * Biểu đồ SVG tự vẽ cho màn Call Center (không dùng thư viện ngoài).
 * Một trục tung duy nhất, nét mảnh, có tooltip khi rê chuột; màu theo thực thể (line/kỳ), không theo thứ hạng.
 */

/** Bảng màu phân loại (đã kiểm tra phân biệt được với người mù màu), dùng theo thứ tự cố định. */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
export const OTHER_COLOR = '#b4b2a9';
export const COMPARE_COLOR = '#86b6ef';

const PAD_L = 52;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 26;

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Giá trị trục tung "tròn" (1, 1.2, 1.6, 2 … 8 × 10ⁿ – chia 4 vạch vẫn tròn) không nhỏ hơn v, để biểu đồ không bị dồn sát đáy. */
function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

interface Frame {
  width: number;
  height: number;
  padR: number;
  band: number;
  max: number;
  x: (i: number) => number;
  y: (v: number) => number;
}

function makeFrame(width: number, height: number, count: number, dataMax: number, floorMax?: number, padR = PAD_R): Frame {
  const band = (width - PAD_L - padR) / Math.max(1, count);
  const max = niceMax(Math.max(dataMax, floorMax || 0) * 1.05);
  const plotH = height - PAD_T - PAD_B;
  return {
    width,
    height,
    padR,
    band,
    max,
    x: (i) => PAD_L + (i + 0.5) * band,
    y: (v) => PAD_T + plotH - (v / max) * plotH,
  };
}

function Axes({ f, labels, format, emphasize }: { f: Frame; labels: string[]; format: (v: number) => string; emphasize?: boolean[] }) {
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * f.max);
  const every = Math.max(1, Math.ceil(46 / f.band));
  return (
    <g>
      {emphasize?.map((on, i) =>
        on ? (
          <rect key={`band-${i}`} x={PAD_L + i * f.band} y={PAD_T} width={f.band} height={f.height - PAD_T - PAD_B} fill="#f1f5f9" />
        ) : null
      )}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD_L} x2={f.width - f.padR} y1={f.y(t)} y2={f.y(t)} stroke={t === 0 ? '#cbd5e1' : '#eef2f6'} strokeWidth={1} />
          <text x={PAD_L - 6} y={f.y(t) + 3} textAnchor="end" fontSize={10} fill="#64748b">
            {format(t)}
          </text>
        </g>
      ))}
      {labels.map((l, i) =>
        i % every === 0 || emphasize?.[i] ? (
          <text
            key={`x-${i}`}
            x={f.x(i)}
            y={f.height - 8}
            textAnchor="middle"
            fontSize={10}
            fill={emphasize?.[i] ? '#0f172a' : '#64748b'}
            fontWeight={emphasize?.[i] ? 700 : 400}
          >
            {l}
          </text>
        ) : null
      )}
    </g>
  );
}

function Tooltip({ left, title, rows }: { left: number; title: string; rows: { color?: string; dashed?: boolean; label: string; value: string }[] }) {
  return (
    <div
      className="absolute top-1 z-10 pointer-events-none bg-white border border-slate-200 shadow-md rounded-lg px-2.5 py-2 text-[11px] text-slate-700 min-w-[150px]"
      style={{ left }}
    >
      <div className="font-bold text-slate-900 mb-1">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            {r.color && (
              <span
                className="inline-block w-3 h-0.5"
                style={r.dashed ? { borderTop: `2px dashed ${r.color}` } : { backgroundColor: r.color, height: 2 }}
              ></span>
            )}
            {r.label}
          </span>
          <span className="font-mono font-semibold text-slate-900">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function tooltipLeft(x: number, width: number): number {
  return Math.max(0, Math.min(x + 12, width - 190));
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={it.dashed ? { borderTop: `2px dashed ${it.color}` } : { backgroundColor: it.color, height: 3, borderRadius: 2 }}
          ></span>
          {it.label}
        </span>
      ))}
    </div>
  );
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  values: (number | null)[];
  dashed?: boolean;
  /** Nhãn riêng từng điểm trong tooltip (vd. ngày của kỳ so sánh) */
  pointLabels?: string[];
}

interface LineChartProps {
  xLabels: string[];
  series: ChartSeries[];
  format: (v: number) => string;
  height?: number;
  target?: number | null;
  targetLabel?: string;
  dots?: boolean;
  emphasize?: boolean[];
}

export function LineChart({ xLabels, series, format, height = 220, target, targetLabel, dots, emphasize }: LineChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const values = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const f = makeFrame(width, height, xLabels.length, Math.max(0, ...values), target ?? undefined);

  const path = (vals: (number | null)[]) => {
    let d = '';
    let pen = false;
    vals.forEach((v, i) => {
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${f.x(i).toFixed(1)},${f.y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - box.left) / f.band);
    setHover(i >= 0 && i < xLabels.length ? i : null);
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Biểu đồ đường">
          <Axes f={f} labels={xLabels} format={format} emphasize={emphasize} />
          {target != null && (
            <g>
              <line x1={PAD_L} x2={width - PAD_R} y1={f.y(target)} y2={f.y(target)} stroke="#64748b" strokeDasharray="2 3" strokeWidth={1} />
              {targetLabel && (
                <text x={width - PAD_R} y={f.y(target) - 4} textAnchor="end" fontSize={10} fill="#475569">
                  {targetLabel}
                </text>
              )}
            </g>
          )}
          {hover != null && <line x1={f.x(hover)} x2={f.x(hover)} y1={PAD_T} y2={height - PAD_B} stroke="#94a3b8" strokeWidth={1} />}
          {series.map((s) => (
            <path
              key={s.key}
              d={path(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {series.map((s) =>
            s.values.map((v, i) =>
              v != null && (dots || hover === i) ? (
                <circle key={`${s.key}-${i}`} cx={f.x(i)} cy={f.y(v)} r={hover === i ? 4.5 : 3} fill={s.color} stroke="#fff" strokeWidth={2} />
              ) : null
            )
          )}
          <rect
            x={PAD_L}
            y={PAD_T}
            width={Math.max(0, width - PAD_L - PAD_R)}
            height={height - PAD_T - PAD_B}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
      )}
      {hover != null && width > 0 && (
        <Tooltip
          left={tooltipLeft(f.x(hover), width)}
          title={xLabels[hover]}
          rows={series.map((s) => ({
            color: s.color,
            dashed: s.dashed,
            label: s.pointLabels?.[hover] ? `${s.label} (${s.pointLabels[hover]})` : s.label,
            value: s.values[hover] == null ? '—' : format(s.values[hover] as number),
          }))}
        />
      )}
    </div>
  );
}

export interface StackSegment {
  key: string;
  label: string;
  color: string;
}

interface StackedBarChartProps {
  xLabels: string[];
  /** Tiêu đề tooltip từng cột (mặc định = nhãn trục) */
  titles?: string[];
  segments: StackSegment[];
  /** values[cột][đoạn] */
  values: number[][];
  format: (v: number) => string;
  height?: number;
  emphasize?: boolean[];
  onSelect?: (i: number) => void;
  /** Đường tỷ lệ vẽ đè lên cột, dùng trục tung bên phải */
  overlay?: {
    label: string;
    color: string;
    values: (number | null)[];
    format: (v: number) => string;
    target?: number | null;
    targetLabel?: string;
  };
}

const PAD_R_OVERLAY = 48;

function roundedTopRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export function StackedBarChart({ xLabels, titles, segments, values, format, height = 240, emphasize, onSelect, overlay }: StackedBarChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const totals = values.map((col) => col.reduce((a, b) => a + b, 0));
  const f = makeFrame(width, height, xLabels.length, Math.max(0, ...totals), undefined, overlay ? PAD_R_OVERLAY : PAD_R);
  const barW = Math.max(6, Math.min(44, f.band * 0.62));
  // Trục phải của đường tỷ lệ: cùng chiều cao vùng vẽ, thang riêng
  const ovVals = overlay ? overlay.values.filter((v): v is number => v != null) : [];
  const ovMax = niceMax(Math.max(0, ...ovVals, overlay?.target || 0) * 1.1);
  const plotH = height - PAD_T - PAD_B;
  const yr = (v: number) => PAD_T + plotH - (v / ovMax) * plotH;
  const ovPath = overlay
    ? overlay.values.reduce<{ d: string; pen: boolean }>(
        (acc, v, i) =>
          v == null
            ? { d: acc.d, pen: false }
            : { d: `${acc.d}${acc.pen ? 'L' : 'M'}${f.x(i).toFixed(1)},${yr(v).toFixed(1)}`, pen: true },
        { d: '', pen: false }
      ).d
    : '';

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Biểu đồ cột chồng">
          <Axes f={f} labels={xLabels} format={format} emphasize={emphasize} />
          {values.map((col, i) => {
            let base = 0;
            const top = col.reduce((last, v, k) => (v > 0 ? k : last), -1);
            const x = f.x(i) - barW / 2;
            return (
              <g key={i} opacity={hover == null || hover === i ? 1 : 0.55} style={{ cursor: onSelect ? 'pointer' : undefined }}>
                {col.map((v, k) => {
                  if (v <= 0) return null;
                  const y1 = f.y(base + v);
                  const y0 = f.y(base);
                  base += v;
                  // 2px khe trắng giữa các đoạn
                  const h = Math.max(0, y0 - y1 - (k > 0 ? 2 : 0));
                  return k === top ? (
                    <path key={k} d={roundedTopRect(x, y1, barW, h, 4)} fill={segments[k].color} />
                  ) : (
                    <rect key={k} x={x} y={y1} width={barW} height={h} fill={segments[k].color} />
                  );
                })}
              </g>
            );
          })}
          {overlay && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <text key={t} x={width - f.padR + 6} y={yr(t * ovMax) + 3} fontSize={10} fill="#64748b">
                  {overlay.format(t * ovMax)}
                </text>
              ))}
              {overlay.target != null && (
                <g>
                  <line
                    x1={PAD_L}
                    x2={width - f.padR}
                    y1={yr(overlay.target)}
                    y2={yr(overlay.target)}
                    stroke={overlay.color}
                    strokeDasharray="2 3"
                    strokeWidth={1}
                  />
                  {overlay.targetLabel && (
                    <text
                      x={width - f.padR - 2}
                      y={yr(overlay.target) - 4}
                      textAnchor="end"
                      fontSize={10}
                      fontWeight={600}
                      fill="#334155"
                      stroke="#fff"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {overlay.targetLabel}
                    </text>
                  )}
                </g>
              )}
              <path d={ovPath} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
              <path d={ovPath} fill="none" stroke={overlay.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {overlay.values.map((v, i) =>
                v == null ? null : (
                  <circle key={`ov-${i}`} cx={f.x(i)} cy={yr(v)} r={hover === i ? 5 : 3.5} fill={overlay.color} stroke="#fff" strokeWidth={2} />
                )
              )}
            </g>
          )}
          {values.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={PAD_L + i * f.band}
              y={PAD_T}
              width={f.band}
              height={height - PAD_T - PAD_B}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(i)}
              style={{ cursor: onSelect ? 'pointer' : undefined }}
            />
          ))}
        </svg>
      )}
      {hover != null && width > 0 && (
        <Tooltip
          left={tooltipLeft(f.x(hover), width)}
          title={titles?.[hover] || xLabels[hover]}
          rows={[
            ...segments.map((s, k) => ({ color: s.color, label: s.label, value: format(values[hover][k]) })),
            { label: 'Tổng', value: format(totals[hover]) },
            ...(overlay
              ? [{ color: overlay.color, label: overlay.label, value: overlay.values[hover] == null ? '—' : overlay.format(overlay.values[hover] as number) }]
              : []),
          ]}
        />
      )}
    </div>
  );
}
