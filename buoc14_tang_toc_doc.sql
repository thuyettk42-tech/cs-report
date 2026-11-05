-- =====================================================================
-- BƯỚC 14 – TĂNG TỐC ĐỌC SỐ (sửa lỗi "statement timeout" khi chọn Quý / Năm ở màn KAT)
-- Nguyên nhân: quy tắc quyền đọc "web_doc" gọi hàm la_nguoi_xem_hop_le() cho TỪNG dòng
-- (KAT có hàng chục nghìn ticket mỗi tháng). Viết lại thành (select …) để Supabase chỉ
-- kiểm tra quyền 1 lần cho cả câu truy vấn. Quyền xem KHÔNG đổi: vẫn chỉ người trong
-- danh sách allowed_users mới đọc được.
-- Chỉ đổi quy tắc quyền + thêm chỉ mục, không đụng dữ liệu. Chạy lại cũng an toàn.
-- =====================================================================

do $$
declare t text;
begin
  for t in
    select tablename from pg_policies
    where schemaname = 'public' and policyname = 'web_doc'
  loop
    execute format('drop policy if exists "web_doc" on public.%I', t);
    execute format(
      'create policy "web_doc" on public.%I for select to authenticated using ((select public.la_nguoi_xem_hop_le()))', t);
  end loop;
end $$;

-- Chỉ mục giúp lọc ticket KAT theo ngày nhanh hơn
create index if not exists kat_ticket_report_date on public.kat_ticket (report_date);
create index if not exists kat_jira_issue_open on public.kat_jira_issue (is_open);

-- Kiểm tra: liệt kê các bảng đã đổi quy tắc (cột qual phải có chữ "SELECT la_nguoi_xem_hop_le")
select tablename, qual from pg_policies where schemaname = 'public' and policyname = 'web_doc' order by 1;
