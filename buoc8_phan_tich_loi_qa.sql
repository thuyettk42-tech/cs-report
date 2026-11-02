-- =====================================================================
-- BƯỚC 8 – PHÂN TÍCH LỖI QA (bổ sung cho bảng call_qa_daily ở bước 7)
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không xóa dữ liệu cũ.
--
-- Cuộc lỗi = có ghi nhận ở ít nhất 1 cột G H I J K L M N O P Q R W X của
-- "Form Responses 2". Mỗi cuộc lỗi xếp vào 1 nhóm nghiêm trọng nhất:
--   1 Thái độ (K, W, X) > 2 Không xử lý được vấn đề (O)
--   > 3 Quy trình (N, P, Q, R) > 4 Giao tiếp (G, H, I, J, L, M)
-- =====================================================================

alter table public.call_qa_daily
  add column if not exists error_calls        integer not null default 0,  -- cuộc có ít nhất 1 lỗi
  add column if not exists sev_attitude       integer not null default 0,  -- nhóm 1: thái độ
  add column if not exists sev_unresolved     integer not null default 0,  -- nhóm 2: không xử lý được vấn đề
  add column if not exists sev_process        integer not null default 0,  -- nhóm 3: quy trình
  add column if not exists sev_communication  integer not null default 0,  -- nhóm 4: giao tiếp
  add column if not exists praise_count       integer not null default 0;  -- cột S: KH khen / hài lòng / 5 sao

-- Từng lý do lỗi (mỗi lựa chọn QA tick trong 1 cột), đếm số cuộc
create table if not exists public.call_qa_reason_daily (
  report_date  date        not null,   -- ngày QA chấm
  ext          text        not null,   -- máy ĐTV
  criterion    text        not null,   -- tên cột tiêu chí, vd "Chào hỏi"
  reason       text        not null,   -- lý do, vd "Chào đầu/kết thúc không đúng kịch bản"
  calls        integer     not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (report_date, ext, criterion, reason)
);
alter table public.call_qa_reason_daily enable row level security;

drop policy if exists "web_doc" on public.call_qa_reason_daily;
create policy "web_doc" on public.call_qa_reason_daily
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.call_qa_reason_daily to authenticated;
