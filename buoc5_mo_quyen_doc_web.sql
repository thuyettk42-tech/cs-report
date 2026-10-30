-- =====================================================================
-- BƯỚC 5 – MỞ QUYỀN CHO TRANG BÁO CÁO ĐỌC DỮ LIỆU SUPABASE
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn.
-- Chỉ người đăng nhập Google bằng email có trong bảng allowed_users
-- (và is_active = true) mới ĐỌC được số liệu. Không ai ghi được từ web;
-- chỉ Apps Script (dùng khóa secret) mới ghi.
-- =====================================================================

-- 1. Danh sách người được xem báo cáo. Thêm / tắt người xem: sửa bảng này trong Table Editor.
create table if not exists public.allowed_users (
  email       text primary key check (email = lower(email)),
  name        text not null,
  role        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table public.allowed_users enable row level security;

insert into public.allowed_users (email, name, role) values
  ('yendao@kiotviet.com',     'Yến Đào',        'Manager CS'),
  ('thuyet.vm@kiotviet.com',  'Vũ Minh Thuyết', 'Manager CS (Super Admin)'),
  ('thuyettk42@gmail.com',    'Vũ Minh Thuyết', 'Manager CS (Super Admin)'),
  ('hai.nguyen@kiotviet.com', 'Hải Nguyễn',     'Giám Đốc / Quản Lý CSKH'),
  ('lam.hn@kiotviet.com',     'Lâm HN',         'Quản Lý Vận Hành CSKH')
on conflict (email) do nothing;

-- 2. Hàm kiểm tra: người đang đăng nhập có trong danh sách được xem không
create or replace function public.la_nguoi_xem_hop_le()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.allowed_users u
    where u.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and u.is_active
  );
$$;
revoke execute on function public.la_nguoi_xem_hop_le() from public, anon;
grant execute on function public.la_nguoi_xem_hop_le() to authenticated;

-- 3. Mỗi người chỉ đọc được dòng của chính mình trong allowed_users (để web biết tên, vai trò)
drop policy if exists "doc_dong_cua_minh" on public.allowed_users;
create policy "doc_dong_cua_minh" on public.allowed_users
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
grant select on public.allowed_users to authenticated;

-- 4. Người trong danh sách được ĐỌC các bảng báo cáo
do $$
declare t text;
begin
  foreach t in array array['call_daily', 'call_team_daily', 'call_queue_daily', 'call_timeslot_daily',
                           'call_agent_daily', 'agents', 'call_queues', 'kpi_targets', 'sync_log']
  loop
    execute format('drop policy if exists "web_doc" on public.%I', t);
    execute format('create policy "web_doc" on public.%I for select to authenticated using (public.la_nguoi_xem_hop_le())', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
