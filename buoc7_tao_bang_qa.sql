-- =====================================================================
-- BƯỚC 7 – BẢNG ĐIỂM CHẤT LƯỢNG CUỘC GỌI DO QA CHẤM
-- Nguồn: file "QC Call Center (Responses)", sheet "Form Responses 2", chỉ kênh Call.
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.call_qa_daily (
  report_date      date        not null,             -- ngày QA chấm (cột Timestamp)
  ext              text        not null,             -- máy ĐTV (cột Line agent)
  qa_count         integer     not null default 0,   -- số cuộc được chấm
  score_sum        numeric     not null default 0,   -- tổng điểm (điểm TB = score_sum / qa_count)
  good_count       integer     not null default 0,   -- Chất lượng call = Tốt
  fair_count       integer     not null default 0,   -- = Khá
  poor_count       integer     not null default 0,   -- = Kém
  resolved_count   integer     not null default 0,   -- Đã giải quyết vấn đề = Có
  repeat_count     integer     not null default 0,   -- Có phát sinh call trùng vấn đề trong 1 tháng = Có
  source           text,
  updated_at       timestamptz not null default now(),
  primary key (report_date, ext)
);
alter table public.call_qa_daily enable row level security;

drop policy if exists "web_doc" on public.call_qa_daily;
create policy "web_doc" on public.call_qa_daily
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.call_qa_daily to authenticated;
