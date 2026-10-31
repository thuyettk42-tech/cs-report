import { getSupabaseClient } from './supabaseClient';

/**
 * Đọc số liệu Call Center từ Supabase (các bảng do Apps Script "Đồng bộ 3CX Supabase" ghi)
 * và tính chỉ số theo công thức đã chốt: luôn cộng tổng các ngày rồi mới chia,
 * không lấy trung bình của tỷ lệ.
 */

export const TEAMS = ['Inhouse', 'OS Partner', 'Voice AI Bot'] as const;
export type TeamName = (typeof TEAMS)[number];

export interface CallDailyRow {
  report_date: string;
  offered: number;
  answered: number;
  abandoned: number;
  callback_needed: number | null;
  callback_on_time: number | null;
  talk_seconds: number;
  hold_seconds: number | null;
  acw_seconds: number | null;
  qa_count: number | null;
  qa_avg: number | null;
  csat_responses: number | null;
  csat_satisfied: number | null;
}

export interface CallTeamRow {
  report_date: string;
  team: TeamName;
  agents_on_duty: number | null;
  handled: number;
  answered_within_sl: number;
  talk_seconds: number;
  acw_seconds: number | null;
  fcr_count: number | null;
  csat_responses: number | null;
  csat_satisfied: number | null;
}

export interface CallQueueRow {
  report_date: string;
  queue: string;
  offered: number;
  abandoned: number;
  handled_inhouse: number;
  handled_os: number;
  handled_ai: number;
  answered_within_sl: number;
  handle_seconds: number;
  csat_responses: number | null;
  csat_satisfied: number | null;
}

export interface CallSlotRow {
  slot_start: string;
  offered: number;
  answered: number;
  answered_ai: number;
  abandoned: number;
}

export interface CallAgentRow {
  ext: string;
  agent_name: string | null;
  team: string | null;
  handled: number;
  answered_within_sl: number;
  talk_seconds: number;
  acw_seconds: number | null;
  fcr_count: number | null;
  qa_avg: number | null;
}

export interface QueueInfo {
  queue: string;
  display_name: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface CallCenterData {
  /** Kỳ báo cáo đang xem (yyyy-mm-dd), from = to khi xem 1 ngày */
  from: string;
  to: string;
  /** Các ngày có dữ liệu, mới nhất trước */
  availableDates: string[];
  /** call_daily từ fetchFrom đến to (gồm cả kỳ so sánh, bảng theo ngày, lũy kế tháng), sắp tăng dần */
  daily: CallDailyRow[];
  /** call_team_daily cùng khoảng ngày như daily */
  team: CallTeamRow[];
  /** Hàng đợi / khung giờ / ĐTV đã cộng dồn các ngày trong kỳ */
  queues: CallQueueRow[];
  slots: CallSlotRow[];
  agents: CallAgentRow[];
  queueInfo: Record<string, QueueInfo>;
  skillGroups: Record<string, string>;
  targets: Record<string, number>;
  lastSync: { run_at: string; status: string; message: string | null } | null;
}

const PAGE_SIZE = 1000;

/** Supabase trả tối đa 1000 dòng mỗi lần, nên đọc theo trang cho đến hết. */
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message || String(error));
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

export async function loadAvailableDates(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const rows = await fetchAll<{ report_date: string }>((from, to) =>
    supabase.from('call_daily').select('report_date').order('report_date', { ascending: false }).range(from, to)
  );
  return rows.map((r) => r.report_date);
}

export function monthStart(date: string): string {
  return date.slice(0, 8) + '01';
}

export function monthEnd(date: string): string {
  const [y, m] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

/** Số ngày từ a đến b (b - a). */
export function daysBetween(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

/** Cộng dồn các cột số theo khóa; cột NULL ở mọi dòng giữ NULL (chưa có nguồn). */
function groupSum<T extends Record<string, any>>(rows: T[], keyOf: (r: T) => string, fields: (keyof T)[]): T[] {
  const map = new Map<string, T>();
  rows.forEach((r) => {
    const k = keyOf(r);
    const cur = map.get(k);
    if (!cur) {
      map.set(k, { ...r });
      return;
    }
    fields.forEach((f) => {
      const a = cur[f];
      const b = r[f];
      (cur as any)[f] = a == null && b == null ? null : (Number(a) || 0) + (Number(b) || 0);
    });
  });
  return [...map.values()];
}

/**
 * fetchFrom..to: số theo ngày (call_daily, call_team_daily) cho thẻ KPI, kỳ so sánh, bảng theo ngày.
 * from..to: kỳ đang xem – hàng đợi, khung giờ, ĐTV được cộng dồn các ngày trong kỳ.
 */
export async function loadCallCenterData(fetchFrom: string, from: string, to: string, availableDates: string[]): Promise<CallCenterData> {
  const supabase = getSupabaseClient();

  const [daily, team, queueDays, slotDays, agentDays, queueInfo, agentDir, targets, lastSync] = await Promise.all([
    fetchAll<CallDailyRow>((a, b) =>
      supabase.from('call_daily').select('*').gte('report_date', fetchFrom).lte('report_date', to)
        .order('report_date').range(a, b)
    ),
    fetchAll<CallTeamRow>((a, b) =>
      supabase.from('call_team_daily').select('*').gte('report_date', fetchFrom).lte('report_date', to)
        .order('report_date').order('team').range(a, b)
    ),
    fetchAll<CallQueueRow>((a, b) =>
      supabase.from('call_queue_daily').select('*').gte('report_date', from).lte('report_date', to)
        .order('report_date').order('queue').range(a, b)
    ),
    fetchAll<CallSlotRow & { report_date: string }>((a, b) =>
      supabase.from('call_timeslot_daily').select('report_date, slot_start, offered, answered, answered_ai, abandoned')
        .gte('report_date', from).lte('report_date', to).order('report_date').order('slot_start').range(a, b)
    ),
    fetchAll<CallAgentRow & { report_date: string }>((a, b) =>
      supabase.from('call_agent_daily')
        .select('report_date, ext, agent_name, team, handled, answered_within_sl, talk_seconds, acw_seconds, fcr_count, qa_avg')
        .gte('report_date', from).lte('report_date', to).order('report_date').order('ext').range(a, b)
    ),
    fetchAll<QueueInfo>((from, to) =>
      supabase.from('call_queues').select('queue, display_name, sort_order, is_active').order('queue').range(from, to)
    ),
    fetchAll<{ ext: string; skill_group: string | null }>((from, to) =>
      supabase.from('agents').select('ext, skill_group').order('ext').range(from, to)
    ),
    fetchAll<{ code: string; value: number }>((from, to) =>
      supabase.from('kpi_targets').select('code, value').order('code').range(from, to)
    ),
    supabase.from('sync_log').select('run_at, status, message').order('run_at', { ascending: false }).limit(1),
  ]);

  if (lastSync.error) throw new Error(lastSync.error.message);

  const queues = groupSum(queueDays, (q) => q.queue, [
    'offered', 'abandoned', 'handled_inhouse', 'handled_os', 'handled_ai', 'answered_within_sl', 'handle_seconds',
    'csat_responses', 'csat_satisfied',
  ]);
  const slots = groupSum(slotDays, (s) => s.slot_start, ['offered', 'answered', 'answered_ai', 'abandoned'])
    .sort((a, b) => a.slot_start.localeCompare(b.slot_start));
  // Điểm QA là điểm trung bình → cộng theo trọng số số cuộc rồi chia lại
  const agents = groupSum(
    agentDays.map((r) => ({ ...r, qa_w: r.qa_avg == null ? null : r.qa_avg * r.handled, qa_h: r.qa_avg == null ? null : r.handled })),
    (r) => r.ext,
    ['handled', 'answered_within_sl', 'talk_seconds', 'acw_seconds', 'fcr_count', 'qa_w', 'qa_h']
  ).map(({ qa_w, qa_h, report_date, ...r }) => ({ ...r, qa_avg: qa_w != null && qa_h ? Math.round((qa_w / qa_h) * 10) / 10 : null }));

  return {
    from,
    to,
    availableDates,
    daily,
    team,
    queues,
    slots,
    agents,
    queueInfo: Object.fromEntries(queueInfo.map((q) => [q.queue, q])),
    skillGroups: Object.fromEntries(agentDir.filter((a) => a.skill_group).map((a) => [a.ext, a.skill_group as string])),
    targets: Object.fromEntries(targets.map((t) => [t.code, Number(t.value)])),
    lastSync: lastSync.data && lastSync.data[0] ? lastSync.data[0] : null,
  };
}

// ---------------------------------------------------------------------
// Tính chỉ số
// ---------------------------------------------------------------------

/** Tỷ lệ a/b; trả null khi không có mẫu số để hiển thị "—" thay vì 0%. */
export function ratio(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || !b) return null;
  return a / b;
}

export function sumBy<T>(rows: T[], pick: (r: T) => number | null | undefined): number {
  return rows.reduce((s, r) => s + (Number(pick(r)) || 0), 0);
}

/** Cộng một cột có thể NULL (chưa có nguồn): trả null nếu mọi dòng đều NULL. */
export function sumNullable<T>(rows: T[], pick: (r: T) => number | null | undefined): number | null {
  let seen = false;
  let total = 0;
  rows.forEach((r) => {
    const v = pick(r);
    if (v != null) {
      seen = true;
      total += Number(v);
    }
  });
  return seen ? total : null;
}

export interface DailyTotals {
  days: number;
  offered: number;
  answered: number;
  abandoned: number;
  callbackNeeded: number | null;
  callbackOnTime: number | null;
  qaCount: number | null;
  qaAvg: number | null;
  csatResponses: number | null;
  csatSatisfied: number | null;
}

/** Cộng call_daily của các ngày trong kỳ (điểm QA lấy trung bình theo số cuộc chấm). */
export function totalDaily(rows: CallDailyRow[]): DailyTotals {
  const qaRows = rows.filter((r) => r.qa_avg != null && r.qa_count);
  const qaCount = sumBy(qaRows, (r) => r.qa_count);
  return {
    days: rows.length,
    offered: sumBy(rows, (r) => r.offered),
    answered: sumBy(rows, (r) => r.answered),
    abandoned: sumBy(rows, (r) => r.abandoned),
    callbackNeeded: sumNullable(rows, (r) => r.callback_needed),
    callbackOnTime: sumNullable(rows, (r) => r.callback_on_time),
    qaCount: sumNullable(rows, (r) => r.qa_count),
    qaAvg: qaCount ? Math.round((sumBy(qaRows, (r) => (r.qa_avg as number) * (r.qa_count as number)) / qaCount) * 10) / 10 : null,
    csatResponses: sumNullable(rows, (r) => r.csat_responses),
    csatSatisfied: sumNullable(rows, (r) => r.csat_satisfied),
  };
}

export interface TeamSummary {
  team: TeamName;
  handled: number;
  share: number | null;
  sl: number | null;
  /** Đàm thoại TB (giây); null với Voice AI vì 3CX không ghi thời lượng cuộc AI */
  talkAvg: number | null;
  agentsOnDuty: number | null;
  callsPerAgent: number | null;
  fcr: number | null;
  csat: number | null;
}

export function summarizeTeams(rows: CallTeamRow[]): TeamSummary[] {
  const totalHandled = sumBy(rows, (r) => r.handled);
  return TEAMS.map((team) => {
    const tr = rows.filter((r) => r.team === team);
    const handled = sumBy(tr, (r) => r.handled);
    const agents = sumNullable(tr, (r) => r.agents_on_duty);
    return {
      team,
      handled,
      share: ratio(handled, totalHandled),
      sl: ratio(sumBy(tr, (r) => r.answered_within_sl), handled),
      talkAvg: team === 'Voice AI Bot' ? null : ratio(sumBy(tr, (r) => r.talk_seconds), handled),
      agentsOnDuty: agents,
      callsPerAgent: ratio(handled, agents),
      fcr: ratio(sumNullable(tr, (r) => r.fcr_count), handled),
      csat: ratio(sumNullable(tr, (r) => r.csat_satisfied), sumNullable(tr, (r) => r.csat_responses)),
    };
  });
}

/** SL của ĐTV (Inhouse + OS) – số chính hiển thị; SL toàn kênh (có Voice AI) để tham khảo. */
export function serviceLevels(rows: CallTeamRow[]): { agentSl: number | null; allSl: number | null } {
  const human = rows.filter((r) => r.team !== 'Voice AI Bot');
  return {
    agentSl: ratio(sumBy(human, (r) => r.answered_within_sl), sumBy(human, (r) => r.handled)),
    allSl: ratio(sumBy(rows, (r) => r.answered_within_sl), sumBy(rows, (r) => r.handled)),
  };
}

/** Đàm thoại TB / ACW TB của cuộc do ĐTV nghe (không chia cho cuộc AI). */
export function handleTimes(rows: CallTeamRow[]): { talkAvg: number | null; acwAvg: number | null } {
  const human = rows.filter((r) => r.team !== 'Voice AI Bot');
  const handled = sumBy(human, (r) => r.handled);
  return {
    talkAvg: ratio(sumBy(human, (r) => r.talk_seconds), handled),
    acwAvg: ratio(sumNullable(human, (r) => r.acw_seconds), handled),
  };
}

// ---------------------------------------------------------------------
// Định dạng hiển thị
// ---------------------------------------------------------------------

const WEEKDAYS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export function weekdayName(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

export function formatShortDate(date: string): string {
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
}

export function formatNumber(n: number | null | undefined): string {
  return n == null ? '—' : Math.round(n).toLocaleString('vi-VN');
}

export function formatPercent(r: number | null | undefined, digits = 1): string {
  return r == null ? '—' : `${(r * 100).toFixed(digits).replace('.', ',')}%`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
}
