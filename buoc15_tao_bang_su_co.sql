-- =====================================================================
-- BƯỚC 15 – SỰ CỐ SẢN PHẨM (DỰ ÁN KAT)
-- Nguồn: sheet "Sự cố KAT" trong file "Thống kê vấn đề sản phẩm"
-- (1FbY01DVNF_zhrCnHrUx4GIRHcE4WNTi_YELeyID-S7A), do quản lý tự ghi nhận.
-- Script dong_bo_su_co.gs đọc cả sheet mỗi sáng, xóa bảng rồi ghi lại (bảng nhỏ, vài chục dòng),
-- nên sửa / xóa dòng trong sheet thì sáng hôm sau web cũng đổi theo.
-- Không có tên gian hàng / số điện thoại trong sheet này.
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn. Không đụng bảng cũ.
-- =====================================================================

create table if not exists public.kat_incident (
  row_no           int         primary key,          -- số dòng trong sheet
  incident_date    date        not null,             -- cột B: thời gian phát sinh lỗi
  error_name       text        not null,             -- cột D: lỗi phát sinh (đã bỏ chữ "Lỗi KAT:" ở đầu)
  error_code       text,                             -- cột E: mã lỗi
  severity         text,                             -- cột H: Nghiêm trọng / Ảnh hưởng vận hành / Nhẹ (trống = chưa đánh giá)
  handle_time      text,                             -- cột I (gọn), trống thì lấy nguyên cột C
  stores_reported  int,                              -- số gian hàng báo lỗi (số đầu tiên ở cột F, hoặc cộng các số khi chia theo sản phẩm)
  stores_actual    int,                              -- số gian hàng thực tế / hệ thống phát hiện (nếu cột F có ghi)
  impact_text      text,                             -- nguyên văn cột F
  summary          text,                             -- cột J (tóm tắt), trống thì lấy nguyên cột G
  updated_at       timestamptz not null default now()
);
create index if not exists kat_incident_date on public.kat_incident (incident_date);
alter table public.kat_incident enable row level security;

drop policy if exists "web_doc" on public.kat_incident;
create policy "web_doc" on public.kat_incident
  for select to authenticated using ((select public.la_nguoi_xem_hop_le()));
grant select on public.kat_incident to authenticated;
