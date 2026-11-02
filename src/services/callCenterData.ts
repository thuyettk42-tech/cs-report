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
  /** Gọi lại cuộc nhỡ theo Power BI (call_callback_daily) – không có khi ngày đó chưa có file */
  cb_missed?: number | null;
  cb_on_time?: number | null;
  cb_late?: number | null;
}

/** call_callback_daily: cuộc nhỡ cần gọi lại và kết quả gọi lại đúng / sai quy định, theo ngày × hàng đợi */
export interface CallbackRow {
  report_date: string;
  queue: string;
  queue_ext: string | null;
  missed: number;
  on_time: number;
  late: number;
  no_interaction: number;
}

/** call_qa_daily: điểm QA chấm theo ngày chấm × máy ĐTV (chỉ kênh Call) */
export interface QaRow {
  report_date: string;
  ext: string;
  qa_count: number;
  score_sum: number;
  good_count: number;
  fair_count: number;
  poor_count: number;
  resolved_count: number;
  repeat_count: number;
  /** Cuộc có ít nhất 1 lỗi, và số cuộc lỗi theo nhóm nghiêm trọng nhất của cuộc */
  error_calls: number;
  sev_attitude: number;
  sev_unresolved: number;
  sev_process: number;
  sev_communication: number;
  /** Cuộc được KH khen / hài lòng / đánh giá 5 sao (cột Điểm thưởng) */
  praise_count: number;
}

/** call_qa_reason_daily: số cuộc gặp từng lý do lỗi, theo ngày chấm × máy ĐTV */
export interface QaReasonRow {
  report_date: string;
  ext: string;
  criterion: string;
  reason: string;
  calls: number;
}

/** Nhóm lỗi QA, xếp từ nghiêm trọng nhất; criteria = tên cột tiêu chí trong file chấm */
export const QA_SEVERITY = [
  { key: 'sev_attitude', label: 'Thái độ', detail: 'Thái độ 1, Thái độ 2, Điểm liệt thái độ', criteria: ['Thái độ 1', 'Thái độ 2', 'Điểm liệt thái độ'] },
  { key: 'sev_unresolved', label: 'Không xử lý được vấn đề', detail: 'Đưa ra phương án giải quyết', criteria: ['Đưa ra phương án giải quyết'] },
  {
    key: 'sev_process',
    label: 'Quy trình',
    detail: 'Xác định vấn đề, Khai thác / Ghi nhận thông tin, Lỗi khác (SLA, quy trình)',
    criteria: ['Xác định vấn đề', 'Khai thác và xử lý thông tin', 'Ghi nhận thông tin, dữ liệu', 'Lỗi khác'],
  },
  {
    key: 'sev_communication',
    label: 'Giao tiếp',
    detail: 'Chào hỏi, Xưng hô, Ngữ điệu, Lắng nghe, Ngôn từ, Đồng cảm',
    criteria: ['Chào hỏi', 'Xưng hô', 'Ngữ điệu, giọng nói', 'Lắng nghe, tích cực giao tiếp', 'Ngôn từ, diên đạt', 'Sự đồng cảm, kết nối'],
  },
] as const;
export type QaSeverityKey = (typeof QA_SEVERITY)[number]['key'];

export interface QaSummary {
  count: number;
  score: number | null;
  errorCalls: number;
  praise: number;
  resolved: number;
  bySeverity: Record<QaSeverityKey, number>;
}

/** Cộng call_qa_daily của các dòng cho trước (điểm TB = tổng điểm / số cuộc chấm). */
export function summarizeQa(rows: QaRow[]): QaSummary {
  const count = sumBy(rows, (r) => r.qa_count);
  return {
    count,
    score: count ? Math.round((sumBy(rows, (r) => r.score_sum) / count) * 10) / 10 : null,
    errorCalls: sumBy(rows, (r) => r.error_calls),
    praise: sumBy(rows, (r) => r.praise_count),
    resolved: sumBy(rows, (r) => r.resolved_count),
    bySeverity: Object.fromEntries(QA_SEVERITY.map((s) => [s.key, sumBy(rows, (r) => r[s.key])])) as Record<QaSeverityKey, number>,
  };
}

/** Nhóm nghiêm trọng của một tiêu chí (tên cột) */
export function severityOfCriterion(criterion: string): QaSeverityKey | null {
  const norm = (x: string) => x.normalize('NFC').trim().toLowerCase();
  const c = norm(criterion);
  const s = QA_SEVERITY.find((g) => g.criteria.some((x) => norm(x) === c));
  return s ? s.key : null;
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
  queue_ext: string | null;
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
  /** call_daily của các khoảng ngày cần dùng (kỳ này, kỳ so sánh, biểu đồ theo ngày, lũy kế tháng), sắp tăng dần */
  daily: CallDailyRow[];
  /** call_team_daily / call_queue_daily / cuộc Voice AI theo máy – cùng các khoảng ngày như daily */
  team: CallTeamRow[];
  queueDays: CallQueueRow[];
  aiDays: AiDayRow[];
  callbackDays: CallbackRow[];
  qaDays: QaRow[];
  qaReasons: QaReasonRow[];
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

export function maxDate(...dates: string[]): string {
  return dates.reduce((a, b) => (b > a ? b : a));
}

export function minDate(...dates: string[]): string {
  return dates.reduce((a, b) => (b < a ? b : a));
}

/** Lùi/tiến n tháng, giữ ngày trong tháng (31/10 lùi 1 tháng → 30/09). */
export function shiftMonths(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
  const last = Number(monthEnd(first).slice(8));
  return first.slice(0, 8) + String(Math.min(d, last)).padStart(2, '0');
}

/** Gộp các khoảng ngày chồng hoặc liền nhau để không đọc trùng; kết quả sắp tăng dần. */
export function mergeRanges(ranges: [string, string][]): [string, string][] {
  const out: [string, string][] = [];
  [...ranges].sort((a, b) => a[0].localeCompare(b[0])).forEach(([a, b]) => {
    const last = out[out.length - 1];
    if (last && a <= addDays(last[1], 1)) {
      if (b > last[1]) last[1] = b;
    } else out.push([a, b]);
  });
  return out;
}

export interface AiDayRow {
  report_date: string;
  ext: string;
  handled: number;
}

export interface DayDetail {
  daily: CallDailyRow[];
  team: CallTeamRow[];
  queueDays: CallQueueRow[];
  aiDays: AiDayRow[];
  callbackDays: CallbackRow[];
  qaDays: QaRow[];
  qaReasons: QaReasonRow[];
}

/** Bảng gọi lại / QA có thể chưa được tạo trên Supabase → coi như chưa có dữ liệu thay vì làm hỏng cả trang. */
async function fetchOptional<T>(table: string, columns: string, order: string, lo: string, hi: string): Promise<T[]> {
  try {
    return await fetchAll<T>((a, b) =>
      getSupabaseClient().from(table).select(columns)
        .gte('report_date', lo).lte('report_date', hi).order('report_date').order(order).range(a, b) as any
    );
  } catch (err) {
    console.warn(`Không đọc được ${table}:`, err);
    return [];
  }
}

/** Số theo ngày (tổng, đội, hàng đợi, cuộc Voice AI theo máy, gọi lại) cho các khoảng ngày. */
async function loadDayDetail(ranges: [string, string][]): Promise<DayDetail> {
  const supabase = getSupabaseClient();
  const parts = await Promise.all(
    mergeRanges(ranges).map(([lo, hi]) =>
      Promise.all([
        fetchAll<CallDailyRow>((a, b) =>
          supabase.from('call_daily').select('*').gte('report_date', lo).lte('report_date', hi).order('report_date').range(a, b)
        ),
        fetchAll<CallTeamRow>((a, b) =>
          supabase.from('call_team_daily').select('*').gte('report_date', lo).lte('report_date', hi)
            .order('report_date').order('team').range(a, b)
        ),
        fetchAll<CallQueueRow>((a, b) =>
          supabase.from('call_queue_daily').select('*').gte('report_date', lo).lte('report_date', hi)
            .order('report_date').order('queue').range(a, b)
        ),
        fetchAll<AiDayRow>((a, b) =>
          supabase.from('call_agent_daily').select('report_date, ext, handled').eq('team', 'Voice AI Bot')
            .gte('report_date', lo).lte('report_date', hi).order('report_date').order('ext').range(a, b)
        ),
        fetchOptional<CallbackRow>('call_callback_daily', 'report_date, queue, queue_ext, missed, on_time, late, no_interaction', 'queue', lo, hi),
        fetchOptional<QaRow>('call_qa_daily',
          'report_date, ext, qa_count, score_sum, good_count, fair_count, poor_count, resolved_count, repeat_count, ' +
            'error_calls, sev_attitude, sev_unresolved, sev_process, sev_communication, praise_count', 'ext', lo, hi),
        fetchOptional<QaReasonRow>('call_qa_reason_daily', 'report_date, ext, criterion, reason, calls', 'ext', lo, hi),
      ])
    )
  );
  const callbackDays = parts.flatMap((p) => p[4]);
  // Cột phân tích lỗi có thể chưa được thêm (chưa chạy SQL bước 8) → để 0
  const qaDays = parts.flatMap((p) => p[5]).map((q) => ({
    ...q,
    score_sum: Number(q.score_sum) || 0,
    error_calls: q.error_calls ?? 0,
    sev_attitude: q.sev_attitude ?? 0,
    sev_unresolved: q.sev_unresolved ?? 0,
    sev_process: q.sev_process ?? 0,
    sev_communication: q.sev_communication ?? 0,
    praise_count: q.praise_count ?? 0,
  }));
  const qaReasons = parts.flatMap((p) => p[6]);
  const cbMap = new Map(groupSum(callbackDays, (c) => c.report_date, ['missed', 'on_time', 'late']).map((c) => [c.report_date, c]));
  const qaMap = new Map(groupSum(qaDays, (q) => q.report_date, ['qa_count', 'score_sum']).map((q) => [q.report_date, q]));
  return {
    daily: parts.flatMap((p) => p[0]).map((d) => {
      const cb = cbMap.get(d.report_date);
      const qa = qaMap.get(d.report_date);
      return {
        ...d,
        ...(cb ? { cb_missed: cb.missed, cb_on_time: cb.on_time, cb_late: cb.late } : {}),
        // Điểm QA theo ngày chấm; totalDaily cộng theo trọng số số cuộc chấm
        ...(qa && qa.qa_count ? { qa_count: qa.qa_count, qa_avg: Number(qa.score_sum) / qa.qa_count } : {}),
      };
    }),
    team: parts.flatMap((p) => p[1]),
    queueDays: parts.flatMap((p) => p[2]),
    aiDays: parts.flatMap((p) => p[3]),
    callbackDays,
    qaDays,
    qaReasons,
  };
}

/** Số theo ngày cho biểu đồ xu hướng theo tháng. */
export function loadMonthlyTrend(from: string, to: string): Promise<DayDetail> {
  return loadDayDetail([[from, to]]);
}

/**
 * ranges: các khoảng ngày cần số theo ngày (kỳ này, kỳ so sánh, biểu đồ theo ngày, lũy kế tháng).
 * from..to: kỳ đang xem – hàng đợi, khung giờ, ĐTV được cộng dồn các ngày trong kỳ.
 */
export async function loadCallCenterData(ranges: [string, string][], from: string, to: string, availableDates: string[]): Promise<CallCenterData> {
  const supabase = getSupabaseClient();

  const [detail, slotDays, agentDays, queueInfo, agentDir, targets, lastSync] = await Promise.all([
    loadDayDetail([...ranges, [from, to]]),
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
      supabase.from('call_queues').select('queue, queue_ext, display_name, sort_order, is_active').order('queue').range(from, to)
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

  const { daily, team, queueDays, aiDays, callbackDays } = detail;
  const queues = groupSum(queueDays.filter((q) => q.report_date >= from && q.report_date <= to), (q) => q.queue, [
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
  // Điểm QA từ file chấm của QA (call_qa_daily) – cộng các ngày chấm trong kỳ
  const qaByExt = new Map(
    groupSum(detail.qaDays.filter((q) => q.report_date >= from && q.report_date <= to), (q) => q.ext, ['qa_count', 'score_sum'])
      .filter((q) => q.qa_count)
      .map((q) => [q.ext, Math.round((Number(q.score_sum) / q.qa_count) * 10) / 10])
  );
  agents.forEach((a) => {
    if (qaByExt.has(a.ext)) a.qa_avg = qaByExt.get(a.ext) as number;
  });

  return {
    from,
    to,
    availableDates,
    daily,
    team,
    queueDays,
    aiDays,
    callbackDays,
    qaDays: detail.qaDays,
    qaReasons: detail.qaReasons,
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
  /** Gọi lại theo Power BI: null khi kỳ chưa có ngày nào có file */
  cbMissed: number | null;
  cbOnTime: number | null;
  cbLate: number | null;
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
    cbMissed: sumNullable(rows, (r) => r.cb_missed),
    cbOnTime: sumNullable(rows, (r) => r.cb_on_time),
    cbLate: sumNullable(rows, (r) => r.cb_late),
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
// Line (nhóm hàng đợi) và cuộc Voice AI theo line
// ---------------------------------------------------------------------

export interface LineQueue {
  ext: string;
  name: string;
  label: string;
}

export interface LineDef {
  key: string;
  name: string;
  queues: LineQueue[];
}

export const LINES: LineDef[] = [
  {
    key: 'software',
    name: 'Phần mềm',
    queues: [
      { ext: '8024', name: 'CS_Line1_Feature_Retail', label: 'Retail' },
      { ext: '8025', name: 'CS_Line1_Feature_F&B', label: 'F&B' },
      { ext: '8026', name: 'CS_Line1_Feature_Salon', label: 'Salon' },
      { ext: '8028', name: 'CS_Line1_Feature_Hotel', label: 'Hotel' },
    ],
  },
  {
    key: 'tech',
    name: 'Kỹ thuật',
    queues: [
      { ext: '8001', name: 'CS_Line2_Technology', label: 'Technology' },
      { ext: '8027', name: 'CS_Line2_Warranty', label: 'Warranty' },
    ],
  },
  { key: 'hddt', name: 'HĐĐT', queues: [{ ext: '8009', name: 'CS_Line4_HDDT_CKS', label: 'HĐĐT – CKS' }] },
];

/** Máy Voice AI → hàng đợi AI hỗ trợ. 8400005 (CS_Line_Knote) không thống kê theo line. */
export const AI_EXT_QUEUE: Record<string, string> = {
  '8400001': '8024',
  '8400002': '8025',
  '8400003': '8026',
  '8400004': '8028',
  '8400006': '8001',
  '8400007': '8009',
};

export interface QueueStat {
  offered: number;
  abandoned: number;
  /** Cuộc ĐTV nghe (Inhouse + OS) */
  human: number;
  /** Cuộc Voice AI nghe, đã gán về hàng đợi theo máy AI */
  ai: number;
  /** Cuộc ĐTV nghe trong 20 giây */
  sl: number;
  talk: number;
  /** CSAT – để 0 khi chưa có nguồn, hiển thị "—" vì không có lượt khảo sát */
  csatResponses: number;
  csatSatisfied: number;
  /** Gọi lại theo Power BI – cbMissed = 0 nghĩa là chưa có file, hiển thị "—" */
  cbMissed: number;
  cbLate: number;
}

export function emptyStat(): QueueStat {
  return { offered: 0, abandoned: 0, human: 0, ai: 0, sl: 0, talk: 0, csatResponses: 0, csatSatisfied: 0, cbMissed: 0, cbLate: 0 };
}

export function addStat(a: QueueStat, b: QueueStat): QueueStat {
  return {
    offered: a.offered + b.offered,
    abandoned: a.abandoned + b.abandoned,
    human: a.human + b.human,
    ai: a.ai + b.ai,
    sl: a.sl + b.sl,
    talk: a.talk + b.talk,
    csatResponses: a.csatResponses + b.csatResponses,
    csatSatisfied: a.csatSatisfied + b.csatSatisfied,
    cbMissed: a.cbMissed + b.cbMissed,
    cbLate: a.cbLate + b.cbLate,
  };
}

/**
 * Số theo ngày × máy nhánh hàng đợi của các line. Cuộc AI nghe được cộng vào hàng đợi theo AI_EXT_QUEUE
 * (vừa tính cuộc đến, vừa tính đã nghe). Hàng đợi chung VOICE_AI_BOT và hàng đợi ngoài line bị bỏ qua.
 */
export function queueStatsByDay(
  queueDays: CallQueueRow[],
  aiDays: AiDayRow[],
  queueInfo: Record<string, QueueInfo>,
  callbackDays: CallbackRow[] = []
): Map<string, Record<string, QueueStat>> {
  const extByName: Record<string, string> = {};
  LINES.forEach((l) => l.queues.forEach((q) => (extByName[q.name] = q.ext)));
  const lineExts = new Set(Object.values(extByName));
  const out = new Map<string, Record<string, QueueStat>>();
  const cell = (date: string, ext: string) => {
    const day = out.get(date) || {};
    out.set(date, day);
    return (day[ext] = day[ext] || emptyStat());
  };
  queueDays.forEach((q) => {
    const ext = extByName[q.queue] || queueInfo[q.queue]?.queue_ext || '';
    if (!lineExts.has(ext)) return;
    const s = cell(q.report_date, ext);
    s.offered += q.offered;
    s.abandoned += q.abandoned;
    s.human += q.handled_inhouse + q.handled_os;
    s.ai += q.handled_ai;
    s.sl += q.answered_within_sl;
    s.talk += q.handle_seconds;
    s.csatResponses += q.csat_responses || 0;
    s.csatSatisfied += q.csat_satisfied || 0;
  });
  aiDays.forEach((a) => {
    const ext = AI_EXT_QUEUE[a.ext];
    if (!ext) return;
    const s = cell(a.report_date, ext);
    s.offered += a.handled;
    s.ai += a.handled;
  });
  // Tên hàng đợi bên Power BI có thể khác 3CX (vd "CS_LIne4…") → gán theo số máy
  callbackDays.forEach((c) => {
    const ext = c.queue_ext || extByName[c.queue] || '';
    if (!lineExts.has(ext)) return;
    const s = cell(c.report_date, ext);
    s.cbMissed += c.missed;
    s.cbLate += c.late;
  });
  return out;
}

/** Cộng số các hàng đợi (exts) trong những ngày thỏa điều kiện. */
export function sumStats(byDay: Map<string, Record<string, QueueStat>>, exts: string[], keep: (date: string) => boolean): QueueStat {
  let total = emptyStat();
  byDay.forEach((day, date) => {
    if (!keep(date)) return;
    exts.forEach((e) => {
      if (day[e]) total = addStat(total, day[e]);
    });
  });
  return total;
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
