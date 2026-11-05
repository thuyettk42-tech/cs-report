-- =====================================================================
-- BƯỚC 13 – TICKET JIRA CHUYỂN SẢN PHẨM (DỰ ÁN KAT)
-- Nguồn: file CSV xuất từ Jira (Support / Bug / New Feature / Incident của dự án KTS; từ Q4/2026
-- thêm file "BS case" = New Feature dự án PST). Bỏ các dòng của dự án Dev KVEIN-… / KAT-….
-- Trạng thái: Đã xong = Status category Done (Resolved, Closed, Đã xử lý triệt để, Đã báo khách
-- triệt để) + Waiting for customer, Đã xử lý tạm; Từ chối = Rejected, Invalid, Duplicated;
-- còn lại Đang treo (Open, New, Pending, Accept, Return, In Progress, Considering…).
-- Mỗi issue 1 dòng, ghi đè theo mã (Issue key) nên file sau cập nhật trạng thái mới.
-- KHÔNG lưu mô tả. Tiêu đề chỉ lưu cho Đề xuất tính năng (New Feature), đã bỏ phần [ … ] đầu
-- thường chứa tên gian hàng. Vấn đề Bug / Support chỉ lưu nhóm vấn đề đã khái quát.
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.kat_jira_issue (
  issue_key        text        primary key,          -- vd KTS-14462
  issue_type       text        not null,             -- Support / Production Bug / Sub_Bug / New Feature / Sub_Support / Sub_Case
  kind             text        not null,             -- Bug / Support / Case / Sự cố (Incident)
  product          text        not null,             -- KVE (liên kết KVEIN-…) / HKD (liên kết KAT-…) / Khác
  dev_key          text,                             -- mã ticket bên Dev được liên kết
  priority         text,
  status           text,
  status_category  text,                             -- Done / In Progress / To Do
  status_group     text        not null,             -- Đã xong / Từ chối / Đang treo
  is_open          boolean     not null,             -- = Đang treo
  created_at       timestamp   not null,
  created_date     date        not null,
  resolved_at      timestamp,                        -- cột Resolved
  changed_at       timestamp,                        -- cột Status category changed (lần cập nhật trạng thái gần nhất)
  impact_scope     numeric,                          -- số gian hàng ảnh hưởng / yêu cầu
  topic            text,                             -- nhóm vấn đề đã khái quát (Bug / Support)
  service          text,                             -- HĐĐT / CKS / Thuế – Kế toán / Khác
  feature_title    text,                             -- chỉ New Feature / Sub_Case: tiêu đề đã bỏ tên gian hàng
  updated_at       timestamptz not null default now()
);
-- (lỡ đã tạo bảng bằng bản cũ của file này thì thêm cột mới)
alter table public.kat_jira_issue
  add column if not exists status_group text,
  add column if not exists changed_at   timestamp;
create index if not exists kat_jira_issue_created on public.kat_jira_issue (created_date);
alter table public.kat_jira_issue enable row level security;

drop policy if exists "web_doc" on public.kat_jira_issue;
create policy "web_doc" on public.kat_jira_issue
  for select to authenticated using (public.la_nguoi_xem_hop_le());
grant select on public.kat_jira_issue to authenticated;

-- Mốc SLA Dev xử lý (ngày). Sửa trong Table Editor → kpi_targets.
insert into public.kpi_targets (code, name, value, unit, direction, note) values
  ('KAT_JIRA_SLA_DAYS', 'SLA Dev xử lý ticket Jira KAT', 5, 'ngày', 'lower', 'Ticket mở quá số ngày này cần đôn đốc')
on conflict (code) do nothing;
