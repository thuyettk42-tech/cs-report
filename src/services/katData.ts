import { getSupabaseClient } from './supabaseClient';
import { fetchAll } from './callCenterData';

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

export function loadKatDaily(from: string, to: string): Promise<KatDailyRow[]> {
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
