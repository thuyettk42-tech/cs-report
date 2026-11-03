-- =====================================================================
-- BƯỚC 11 – TỔNG HỢP TICKET KAT GỌN HƠN ĐỂ XEM THEO QUÝ / NĂM
-- Thay view kat_ticket_daily (bỏ chia theo giờ cho nhẹ) và thêm view kat_ticket_hourly
-- (chỉ chia theo giờ + nhóm nội dung). Chỉ tạo lại VIEW, không đụng dữ liệu ticket.
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn.
-- =====================================================================

drop view if exists public.kat_ticket_daily;
create view public.kat_ticket_daily with (security_invoker = true) as
select
  report_date,
  channel,
  content_group,
  status_group,
  count(*)::int                                                         as tickets,
  coalesce(sum(process_seconds), 0)::bigint                             as process_seconds,
  count(*) filter (where process_seconds > 0)::int                      as timed_tickets,
  count(*) filter (where status_group = 'Hoàn thành'
                     and coalesce(process_seconds, 0) <= 4 * 3600)::int as within_sla
from public.kat_ticket
group by 1, 2, 3, 4;
grant select on public.kat_ticket_daily to authenticated;

create or replace view public.kat_ticket_hourly with (security_invoker = true) as
select report_date, created_hour, content_group, count(*)::int as tickets
from public.kat_ticket
group by 1, 2, 3;
grant select on public.kat_ticket_hourly to authenticated;
