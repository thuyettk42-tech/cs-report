-- =====================================================================
-- BƯỚC 12 – NĂNG SUẤT NHÂN SỰ KAT
-- Thêm mã / tên / nhóm của NGƯỜI XỬ LÝ vào bảng kat_ticket (tên nhân viên nội bộ,
-- không phải thông tin khách hàng) và view tổng hợp theo ngày × người xử lý.
-- Đội KAT = người xử lý có mã tổng đài bắt đầu bằng 88 (web tự lọc).
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không xóa dữ liệu.
-- =====================================================================

alter table public.kat_ticket
  add column if not exists handler_code text,   -- mã tổng đài người xử lý, vd 8821
  add column if not exists handler_name text,   -- tên người xử lý
  add column if not exists handler_team text;   -- KAT / Outsourcing / CS <site> / …

create or replace view public.kat_agent_daily with (security_invoker = true) as
select
  report_date,
  coalesce(handler_code, '')                                                  as handler_code,
  max(handler_name)                                                            as handler_name,
  max(handler_team)                                                            as handler_team,
  count(*)::int                                                                as tickets,
  count(*) filter (where status_group = 'Hoàn thành')::int                     as done,
  count(*) filter (where status_group = 'Không xử lý')::int                    as rejected,
  count(*) filter (where channel like 'Call%')::int                            as calls,
  count(*) filter (where channel like 'Chat%')::int                            as chats,
  count(*) filter (where channel like 'Ticket%')::int                          as ticket_channel,
  count(*) filter (where channel like 'Ticket%' and status_group <> 'Không xử lý')::int as sla_base,
  count(*) filter (where channel like 'Ticket%' and status_group = 'Hoàn thành'
                     and coalesce(process_seconds, 0) <= 4 * 3600)::int      as within_sla,
  coalesce(sum(process_seconds) filter (where channel like 'Ticket%'), 0)::bigint as ticket_seconds
from public.kat_ticket
group by 1, 2;
grant select on public.kat_agent_daily to authenticated;

-- Mục tiêu năng suất: ticket / người / ngày làm việc. Sửa trong Table Editor → kpi_targets.
insert into public.kpi_targets (code, name, value, unit, direction, note) values
  ('KAT_TARGET_TICKETS_PER_DAY', 'Năng suất NV KAT (ticket/ngày)', 30, 'ticket', 'higher', 'Ngày làm việc = ngày có ít nhất 1 ticket')
on conflict (code) do nothing;
