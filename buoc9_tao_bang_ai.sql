-- =====================================================================
-- BƯỚC 9 – BẢNG KẾT QUẢ CHẤM CALL VOICE AI
-- Nguồn: file "[OM] Báo cáo chất lượng call của AI Agent", các sheet
-- "Call Retail", "Call FnB", "Call Kỹ thuật", "Call HDDT" (cách tính như sheet "BÁO CÁO CALL").
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.call_ai_qa_daily (
  report_date    date        not null,             -- ngày của cuộc gọi (cột B "Ngày")
  line           text        not null,             -- Retail / FnB / Kỹ thuật / HDDT
  checked        integer     not null default 0,   -- Số AI call tiếp nhận (check): có cột "Phân loại"
  hangup         integer     not null default 0,   -- Phân loại = "KH ngắt máy ngang"
  transferred    integer     not null default 0,   -- Phân loại = "Chuyển DVKH"
  self_resolved  integer     not null default 0,   -- Action = "Tự xử lý"
  correct        integer     not null default 0,   -- Action = "Tự xử lý" và Action Result = "Pass"
  source         text,
  updated_at     timestamptz not null default now(),
  primary key (report_date, line)
);
alter table public.call_ai_qa_daily enable row level security;

drop policy if exists "web_doc" on public.call_ai_qa_daily;
create policy "web_doc" on public.call_ai_qa_daily
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.call_ai_qa_daily to authenticated;

-- Mục tiêu KPI Voice AI (đang áp dụng từ tháng 10/2026). Sửa trong Table Editor → kpi_targets khi đổi.
insert into public.kpi_targets (code, name, value, unit, direction, note) values
  ('TARGET_AI_SELF_RESOLVE', 'Mục tiêu tỷ lệ Voice AI tự xử lý', 0.5, '%', 'higher', 'Tự xử lý / (call check − KH ngắt máy), từ T10/2026'),
  ('TARGET_AI_CORRECT',      'Mục tiêu tỷ lệ Voice AI xử lý đúng', 0.8, '%', 'higher', 'Xử lý đúng / tự xử lý, từ T10/2026')
on conflict (code) do nothing;
