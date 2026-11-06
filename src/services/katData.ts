import { getSupabaseClient } from './supabaseClient';
import { AI_EXT_QUEUE, LINES, fetchAll } from './callCenterData';

/** Cuộc gọi line KAT = line HĐĐT trên 3CX (hàng đợi 8009 + cuộc Voice AI của máy gán về 8009), theo ngày */
export interface KatCallDay {
  report_date: string;
  offered: number;
  abandoned: number;
}

const KAT_LINE = LINES.find((l) => l.key === 'hddt')!;

export async function loadKatCalls(from: string, to: string): Promise<KatCallDay[]> {
  const s = getSupabaseClient();
  const aiExts = Object.keys(AI_EXT_QUEUE).filter((ai) => KAT_LINE.queues.some((q) => q.ext === AI_EXT_QUEUE[ai]));
  const [queues, ai] = await Promise.all([
    fetchAll<{ report_date: string; offered: number; abandoned: number }>((a, b) =>
      s.from('call_queue_daily').select('report_date, offered, abandoned')
        .in('queue', KAT_LINE.queues.map((q) => q.name))
        .gte('report_date', from).lte('report_date', to).order('report_date').range(a, b)
    ),
    fetchAll<{ report_date: string; handled: number }>((a, b) =>
      s.from('call_agent_daily').select('report_date, handled').in('ext', aiExts)
        .gte('report_date', from).lte('report_date', to).order('report_date').range(a, b)
    ),
  ]);
  // Giống bảng "Cuộc gọi theo Line" màn Call Center: cuộc đến của line gồm cả cuộc AI nghe
  const byDay = new Map<string, KatCallDay>();
  const day = (d: string) => byDay.get(d) || (byDay.set(d, { report_date: d, offered: 0, abandoned: 0 }), byDay.get(d)!);
  queues.forEach((q) => { const x = day(q.report_date); x.offered += q.offered; x.abandoned += q.abandoned; });
  ai.forEach((a) => { day(a.report_date).offered += a.handled; });
  return [...byDay.values()];
}

/** Một dòng của view kat_ticket_daily: số ticket theo ngày × kênh × nhóm nội dung × nhóm trạng thái */
export interface KatDailyRow {
  report_date: string;
  channel: string;
  content_group: string;
  status_group: string;
  tickets: number;
  process_seconds: number;
  timed_tickets: number;
  within_sla: number;
}

/** Một dòng của view kat_ticket_hourly: số ticket theo ngày × giờ tạo × nhóm nội dung */
export interface KatHourRow {
  report_date: string;
  created_hour: number;
  content_group: string;
  tickets: number;
}

export const KAT_CONTENT = ['HĐĐT', 'CKS', 'Thuế – Kế toán', 'Khác'] as const;
export const KAT_CHANNELS = [
  'Call',
  'Call – Miss call',
  'Chat – Freshchat',
  'Chat – Zalo',
  'Ticket – DVKH',
  'Ticket – Sale',
  'Ticket – AI ElevenLabs',
  'Khác',
] as const;
/** Gộp kênh cho biểu đồ: Call (gồm miss call) / Chat / Ticket / Khác */
export const KAT_CHANNEL_GROUPS = ['Call', 'Chat', 'Ticket', 'Khác'] as const;
export const channelGroup = (c: string) => (c.startsWith('Call') ? 'Call' : c.startsWith('Chat') ? 'Chat' : c.startsWith('Ticket') ? 'Ticket' : 'Khác');
export const isTicketChannel = (c: string) => c.startsWith('Ticket');

/** Ngày cũ nhất và mới nhất có ticket */
export async function loadKatDates(): Promise<{ oldest: string; latest: string } | null> {
  const s = getSupabaseClient();
  const [a, b] = await Promise.all([
    s.from('kat_ticket').select('report_date').order('report_date', { ascending: true }).limit(1),
    s.from('kat_ticket').select('report_date').order('report_date', { ascending: false }).limit(1),
  ]);
  if (a.error) throw new Error(a.error.message);
  if (b.error) throw new Error(b.error.message);
  if (!a.data?.length || !b.data?.length) return null;
  return { oldest: a.data[0].report_date, latest: b.data[0].report_date };
}

/**
 * Chia khoảng ngày thành từng tháng và đọc song song (tối đa 4 tháng một lúc), để mỗi lần
 * Supabase chỉ phải tổng hợp ticket của 1 tháng – chọn Quý / Năm không bị quá thời gian.
 */
async function perMonth<T>(from: string, to: string, load: (a: string, b: string) => Promise<T[]>): Promise<T[]> {
  const ranges: [string, string][] = [];
  let start = from;
  while (start <= to) {
    const [y, m] = start.split('-').map(Number);
    const monthEnd = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const end = monthEnd < to ? monthEnd : to;
    ranges.push([start, end]);
    start = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  }
  const out: T[][] = new Array(ranges.length);
  for (let i = 0; i < ranges.length; i += 4) {
    const part = await Promise.all(ranges.slice(i, i + 4).map(([a, b]) => load(a, b)));
    part.forEach((rows, j) => { out[i + j] = rows; });
  }
  return out.flat();
}

/** Lần đồng bộ KAT gần nhất (ticket CRM hoặc Jira) trong nhật ký sync_log */
export async function loadKatLastSync(): Promise<{ run_at: string; status: string; message: string | null } | null> {
  const { data } = await getSupabaseClient()
    .from('sync_log')
    .select('run_at, status, message')
    .ilike('message', '%KAT%')
    .order('run_at', { ascending: false })
    .limit(1);
  return data && data[0] ? data[0] : null;
}

export function loadKatDaily(from: string, to: string): Promise<KatDailyRow[]> {
  return perMonth(from, to, loadKatDailyRange);
}

function loadKatDailyRange(from: string, to: string): Promise<KatDailyRow[]> {
  return fetchAll<KatDailyRow>((a, b) =>
    getSupabaseClient()
      .from('kat_ticket_daily')
      .select('report_date, channel, content_group, status_group, tickets, process_seconds, timed_tickets, within_sla')
      .gte('report_date', from)
      .lte('report_date', to)
      .order('report_date')
      .order('channel')
      .order('content_group')
      .order('status_group')
      .range(a, b)
  );
}

export function loadKatHourly(from: string, to: string): Promise<KatHourRow[]> {
  return perMonth(from, to, loadKatHourlyRange);
}

function loadKatHourlyRange(from: string, to: string): Promise<KatHourRow[]> {
  return fetchAll<KatHourRow>((a, b) =>
    getSupabaseClient()
      .from('kat_ticket_hourly')
      .select('report_date, created_hour, content_group, tickets')
      .gte('report_date', from)
      .lte('report_date', to)
      .order('report_date')
      .order('created_hour')
      .order('content_group')
      .range(a, b)
  );
}

/** Một dòng của view kat_agent_daily: ticket theo ngày × người xử lý */
export interface KatAgentDay {
  report_date: string;
  handler_code: string;
  handler_name: string | null;
  handler_team: string | null;
  tickets: number;
  done: number;
  rejected: number;
  calls: number;
  chats: number;
  ticket_channel: number;
  sla_base: number;
  within_sla: number;
  ticket_seconds: number;
}

/** Đội KAT = người xử lý có mã tổng đài bắt đầu bằng 88 */
export const isKatAgent = (code: string) => /^88\d{2}$/.test(code || '');
export const KAT_DEFAULT_TARGET_PER_DAY = 30;

export function loadKatAgents(from: string, to: string): Promise<KatAgentDay[]> {
  return perMonth(from, to, loadKatAgentsRange);
}

function loadKatAgentsRange(from: string, to: string): Promise<KatAgentDay[]> {
  return fetchAll<KatAgentDay>((a, b) =>
    getSupabaseClient()
      .from('kat_agent_daily')
      .select('report_date, handler_code, handler_name, handler_team, tickets, done, rejected, calls, chats, ticket_channel, sla_base, within_sla, ticket_seconds')
      .gte('report_date', from)
      .lte('report_date', to)
      .order('report_date')
      .order('handler_code')
      .range(a, b)
  );
}

/** Mục tiêu ticket / người / ngày (kpi_targets KAT_TARGET_TICKETS_PER_DAY), mặc định 30 */
export async function loadKatTargetPerDay(): Promise<number> {
  const { data } = await getSupabaseClient().from('kpi_targets').select('value').eq('code', 'KAT_TARGET_TICKETS_PER_DAY').limit(1);
  return data && data[0] ? Number(data[0].value) : KAT_DEFAULT_TARGET_PER_DAY;
}

/** Một issue Jira chuyển sản phẩm (bảng kat_jira_issue) */
export interface KatJiraIssue {
  issue_key: string;
  /** Incident (Sự cố) được tính vào Bug */
  kind: 'Bug' | 'Support' | 'Case';
  product: 'KVE' | 'HKD' | 'Khác';
  priority: string | null;
  status: string | null;
  /** Đã xong / Từ chối / Đang treo */
  status_group: string;
  is_open: boolean;
  created_at: string;
  created_date: string;
  resolved_at: string | null;
  /** Status category changed – lần cập nhật trạng thái gần nhất */
  changed_at: string | null;
  impact_scope: number | null;
  topic: string | null;
  service: string | null;
  feature_title: string | null;
}

/** Issue đang mở (bất kể ngày tạo) + issue tạo trong khoảng ngày, bỏ trùng */
export async function loadKatJira(from: string, to: string): Promise<KatJiraIssue[]> {
  const cols =
    'issue_key, kind, product, priority, status, status_group, is_open, created_at, created_date, resolved_at, changed_at, impact_scope, topic, service, feature_title';
  const s = getSupabaseClient();
  const [open, inRange] = await Promise.all([
    fetchAll<KatJiraIssue>((a, b) => s.from('kat_jira_issue').select(cols).eq('is_open', true).order('issue_key').range(a, b)),
    fetchAll<KatJiraIssue>((a, b) =>
      s.from('kat_jira_issue').select(cols).gte('created_date', from).lte('created_date', to).order('issue_key').range(a, b)
    ),
  ]);
  const m = new Map<string, KatJiraIssue>();
  [...open, ...inRange].forEach((x) => m.set(x.issue_key, x));
  // Dữ liệu nạp trước 05/11 có thể còn kind "Sự cố" → gộp vào Bug
  return [...m.values()].map((x) => ((x.kind as string) === 'Sự cố' ? { ...x, kind: 'Bug' as const } : x));
}

export async function loadKatJiraSlaDays(): Promise<number> {
  const { data } = await getSupabaseClient().from('kpi_targets').select('value').eq('code', 'KAT_JIRA_SLA_DAYS').limit(1);
  return data && data[0] ? Number(data[0].value) : 5;
}

export interface KatSummary {
  tickets: number;
  done: number;
  rejected: number;
  pending: number;
  /** Chỉ kênh Ticket: số ticket, số tính SLA (bỏ Từ chối / Trùng lặp), đúng SLA, tổng giây xử lý */
  ticketChannel: number;
  slaBase: number;
  withinSla: number;
  ticketSeconds: number;
  /** Số ticket theo nhóm kênh Call / Chat / Ticket / Khác */
  byGroup: Record<string, number>;
}

export function summarizeKat(rows: KatDailyRow[]): KatSummary {
  const s: KatSummary = {
    tickets: 0, done: 0, rejected: 0, pending: 0, ticketChannel: 0, slaBase: 0, withinSla: 0, ticketSeconds: 0,
    byGroup: { Call: 0, Chat: 0, Ticket: 0, Khác: 0 },
  };
  rows.forEach((r) => {
    s.tickets += r.tickets;
    s.byGroup[channelGroup(r.channel)] += r.tickets;
    if (r.status_group === 'Hoàn thành') s.done += r.tickets;
    else if (r.status_group === 'Không xử lý') s.rejected += r.tickets;
    else s.pending += r.tickets;
    if (isTicketChannel(r.channel)) {
      s.ticketChannel += r.tickets;
      if (r.status_group !== 'Không xử lý') s.slaBase += r.tickets;
      s.withinSla += r.within_sla;
      s.ticketSeconds += Number(r.process_seconds) || 0;
    }
  });
  return s;
}
