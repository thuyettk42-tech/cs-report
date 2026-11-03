-- =====================================================================
-- BƯỚC 10 – TICKET DỰ ÁN KAT (xuất từ CRM)
-- Lưu MỖI TICKET 1 dòng nhưng chỉ các thông tin để thống kê: mã ticket, thời gian tạo,
-- kênh, nhóm nội dung, trạng thái, nguồn, thời gian xử lý. KHÔNG lưu tên gian hàng,
-- số điện thoại, mô tả. File xuất sau ghi đè trạng thái mới theo mã ticket.
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.kat_ticket (
  ticket_id        text        primary key,          -- vd TT9122460
  created_at       timestamp   not null,             -- giờ Việt Nam, như trong CRM
  report_date      date        not null,             -- ngày tạo
  created_hour     smallint    not null,             -- giờ tạo 0–23
  channel          text        not null,             -- Call / Call – Miss call / Chat – Freshchat / Chat – Zalo / Ticket – DVKH / Ticket – Sale / Ticket – AI ElevenLabs / Khác
  channel_inferred boolean     not null default false, -- true = CRM không ghi kênh, script tự dò theo nhân viên
  content_group    text        not null,             -- HĐĐT / CKS / Thuế – Kế toán / Khác
  status           text,                             -- trạng thái gốc trong CRM
  status_group     text        not null,             -- Hoàn thành / Không xử lý / Đang treo
  source           text,                             -- Nguồn tiếp nhận (DVKH, Sales, AI ElevenLabs…)
  creator_team     text,                             -- KAT / Outsourcing / CS <site> / AI ElevenLabs / Administrator
  process_seconds  integer,                          -- Tổng thời gian xử lý (giây)
  updated_at       timestamptz not null default now()
);
create index if not exists kat_ticket_report_date on public.kat_ticket (report_date);
alter table public.kat_ticket enable row level security;

drop policy if exists "web_doc" on public.kat_ticket;
create policy "web_doc" on public.kat_ticket
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.kat_ticket to authenticated;

-- Bảng tổng hợp theo ngày × giờ × kênh × nhóm × trạng thái để web đọc nhanh (tôn trọng quyền đọc ở trên)
create or replace view public.kat_ticket_daily with (security_invoker = true) as
select
  report_date,
  created_hour,
  channel,
  content_group,
  status_group,
  count(*)::int                                                         as tickets,
  coalesce(sum(process_seconds), 0)::bigint                             as process_seconds,
  count(*) filter (where process_seconds > 0)::int                      as timed_tickets,
  count(*) filter (where status_group = 'Hoàn thành'
                     and coalesce(process_seconds, 0) <= 4 * 3600)::int as within_sla
from public.kat_ticket
group by 1, 2, 3, 4, 5;
grant select on public.kat_ticket_daily to authenticated;

-- Mốc SLA kênh Ticket (giờ). Đổi trong Table Editor → kpi_targets; cột within_sla ở trên đang dùng 4 giờ.
insert into public.kpi_targets (code, name, value, unit, direction, note) values
  ('KAT_TICKET_SLA_HOURS', 'SLA xử lý ticket KAT (kênh Ticket)', 4,    'giờ', 'neutral', 'Call/Chat xử lý ngay, không tính SLA'),
  ('KAT_TARGET_SLA_RATE',  'Mục tiêu % ticket KAT đúng SLA',     0.95, '%',   'higher',  'Chờ xác nhận')
on conflict (code) do nothing;
