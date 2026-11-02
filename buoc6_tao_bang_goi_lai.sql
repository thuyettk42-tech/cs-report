-- =====================================================================
-- BƯỚC 6 – BẢNG SỐ LIỆU GỌI LẠI CUỘC NHỠ (nguồn: Power BI "QA call",
-- bảng "Chi tiết cuộc gọi MissCall", xuất file vào thư mục Drive "Goi lai")
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.call_callback_daily (
  report_date     date        not null,               -- ngày của cuộc nhỡ (call_start)
  queue           text        not null,               -- hàng đợi, vd CS_Line1_Feature_Retail
  queue_ext       text,                               -- số máy hàng đợi, vd 8024
  missed          integer     not null default 0,     -- cuộc nhỡ cần gọi lại
  on_time         integer     not null default 0,     -- gọi lại đúng quy định
  late            integer     not null default 0,     -- gọi lại sai quy định (trễ hạn hoặc không gọi)
  no_interaction  integer     not null default 0,     -- trong số đó: không có tương tác nào sau cuộc nhỡ
  source          text,
  updated_at      timestamptz not null default now(),
  primary key (report_date, queue)
);
alter table public.call_callback_daily enable row level security;

-- Người trong danh sách allowed_users được ĐỌC (giống các bảng call_* khác)
drop policy if exists "web_doc" on public.call_callback_daily;
create policy "web_doc" on public.call_callback_daily
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.call_callback_daily to authenticated;
