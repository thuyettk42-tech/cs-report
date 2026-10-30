-- =====================================================================
-- BÁO CÁO CALL CENTER HOTLINE 1900 6522 – TẠO BẢNG DỮ LIỆU TRÊN SUPABASE
-- Chạy 1 lần trong SQL Editor. Chạy lại cũng an toàn: bảng đã có sẽ giữ nguyên.
-- Chỉ lưu số tổng hợp theo ngày, KHÔNG lưu số điện thoại khách hàng.
-- =====================================================================

-- 1. Tổng toàn kênh theo ngày (giống sheet NHAP_TONG_NGAY)
create table if not exists public.call_daily (
  report_date       date primary key,
  offered           integer not null default 0,   -- tổng cuộc đến = đã nghe + nhỡ
  answered          integer not null default 0,   -- đã nghe (ĐTV + Voice AI)
  abandoned         integer not null default 0,   -- cuộc nhỡ
  deducted          integer,                      -- cuộc loại trừ (spam, gọi nhầm…)
  callback_needed   integer,                      -- cuộc nhỡ cần gọi lại (đã loại trùng)
  callback_on_time  integer,                      -- gọi lại trong hạn (chưa có nguồn)
  talk_seconds      bigint  not null default 0,   -- tổng giây đàm thoại
  hold_seconds      bigint,                       -- tổng giây giữ máy (chưa có nguồn)
  acw_seconds       bigint,                       -- tổng giây sau cuộc gọi (chưa có nguồn)
  qa_count          integer,                      -- số cuộc chấm QA
  qa_avg            numeric(5,2),                 -- điểm QA trung bình
  csat_responses    integer,                      -- số khảo sát phản hồi
  csat_satisfied    integer,                      -- số khảo sát hài lòng
  source            text not null default 'Tự động',
  note              text,
  updated_at        timestamptz not null default now()
);

-- 2. Theo đội ngũ: Inhouse / OS Partner / Voice AI Bot (giống NHAP_DOI_NGU)
create table if not exists public.call_team_daily (
  report_date           date not null,
  team                  text not null check (team in ('Inhouse', 'OS Partner', 'Voice AI Bot')),
  agents_on_duty        integer,                  -- số ĐTV có nghe máy trong ngày
  handled               integer not null default 0,
  answered_within_sl    integer not null default 0, -- trả lời trong ngưỡng SL (20 giây)
  talk_seconds          bigint  not null default 0,
  acw_seconds           bigint,
  fcr_count             integer,                  -- giải quyết ngay lần đầu
  transferred_to_agent  integer,                  -- Voice AI chuyển cho ĐTV
  csat_responses        integer,
  csat_satisfied        integer,
  source                text not null default 'Tự động',
  updated_at            timestamptz not null default now(),
  primary key (report_date, team)
);

-- 3. Theo hàng đợi 3CX (giống NHAP_HANG_DOI)
create table if not exists public.call_queue_daily (
  report_date         date not null,
  queue               text not null,              -- tên queue trên 3CX, vd CS_Line4_HDDT_CKS
  offered             integer not null default 0,
  abandoned           integer not null default 0,
  handled_inhouse     integer not null default 0,
  handled_os          integer not null default 0,
  handled_ai          integer not null default 0,
  answered_within_sl  integer not null default 0,
  handle_seconds      bigint  not null default 0,
  csat_responses      integer,
  csat_satisfied      integer,
  source              text not null default 'Tự động',
  updated_at          timestamptz not null default now(),
  primary key (report_date, queue)
);

-- 4. Theo khung 30 phút (giống NHAP_KHUNG_GIO, chi tiết hơn để thấy cao điểm 09:30–11:30)
create table if not exists public.call_timeslot_daily (
  report_date  date not null,
  slot_start   time not null,                     -- 09:00, 09:30, 10:00…
  offered      integer not null default 0,
  answered     integer not null default 0,
  answered_ai  integer not null default 0,
  abandoned    integer not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (report_date, slot_start)
);

-- 5. Theo điện thoại viên (giống NHAP_DTV)
create table if not exists public.call_agent_daily (
  report_date         date not null,
  ext                 text not null,              -- máy lẻ, vd 8641
  agent_name          text,
  team                text,
  handled             integer not null default 0,
  answered_within_sl  integer not null default 0,
  talk_seconds        bigint  not null default 0,
  acw_seconds         bigint,
  fcr_count           integer,
  qa_count            integer,
  qa_avg              numeric(5,2),
  csat_responses      integer,
  csat_satisfied      integer,
  source              text not null default 'Tự động',
  note                text,
  updated_at          timestamptz not null default now(),
  primary key (report_date, ext)
);

-- 6. Danh mục điện thoại viên (giống DM_NHAN_SU) – script tự thêm ĐTV mới
create table if not exists public.agents (
  ext          text primary key,
  agent_name   text not null,
  team         text,                              -- Inhouse / OS Partner
  site         text,                              -- HNI, HCM, DNG, CTO, KAT, CTV, OUT (theo 3CX)
  skill_group  text,                              -- nhóm chuyên môn
  status       text not null default 'Đang làm',
  updated_at   timestamptz not null default now()
);

-- 7. Danh mục hàng đợi – script tự thêm queue mới, bạn sửa tên hiển thị nếu muốn
create table if not exists public.call_queues (
  queue         text primary key,
  queue_ext     text,
  display_name  text,
  sort_order    integer,
  is_active     boolean not null default true
);

-- 8. Mục tiêu KPI (giống CAU_HINH) – sửa trực tiếp trong Table Editor khi cần
create table if not exists public.kpi_targets (
  code        text primary key,
  name        text not null,
  value       numeric not null,
  unit        text,
  direction   text check (direction in ('higher', 'lower', 'neutral')),
  note        text,
  updated_at  timestamptz not null default now()
);

insert into public.kpi_targets (code, name, value, unit, direction, note) values
  ('SL_THRESHOLD_SEC',      'Ngưỡng trả lời tính Service Level', 20,    'giây', 'neutral', 'Chuẩn 80/20'),
  ('CALLBACK_DEADLINE_MIN', 'Thời hạn gọi lại cuộc nhỡ',         30,    'phút', 'neutral', null),
  ('TARGET_ANSWER_RATE',    'Mục tiêu tỷ lệ phục vụ',            0.95,  '%',    'higher',  'Mặc định – cần xác nhận'),
  ('TARGET_ABANDON_RATE',   'Mục tiêu tỷ lệ nhỡ (tối đa)',       0.03,  '%',    'lower',   'Theo bảng tổng hợp khối tổng đài 2026'),
  ('TARGET_CALLBACK',       'Mục tiêu gọi lại đúng hạn',         0.90,  '%',    'higher',  null),
  ('TARGET_SL',             'Mục tiêu Service Level',            0.80,  '%',    'higher',  'Mặc định – cần xác nhận'),
  ('TARGET_AHT_SEC',        'Mục tiêu AHT (tối đa)',             210,   'giây', 'lower',   'Mặc định – cần xác nhận'),
  ('TARGET_QA',             'Mục tiêu điểm QA',                  90,    'điểm', 'higher',  'Mặc định – cần xác nhận'),
  ('TARGET_CSAT',           'Mục tiêu CSAT',                     0.92,  '%',    'higher',  'Theo bảng tổng hợp khối tổng đài 2026'),
  ('TARGET_FCR',            'Mục tiêu FCR',                      0.83,  '%',    'higher',  'Theo bảng tổng hợp khối tổng đài 2026'),
  ('COST_PER_AGENT_CALL',   'Chi phí TB 1 cuộc do ĐTV xử lý',    43000, 'VNĐ',  'neutral', 'Ước tính – cần xác nhận')
on conflict (code) do nothing;

-- 9. Nhật ký mỗi lần đồng bộ
create table if not exists public.sync_log (
  id            bigint generated always as identity primary key,
  run_at        timestamptz not null default now(),
  report_date   date,
  status        text not null,                    -- success / error
  rows_written  integer,
  message       text
);

-- 10. Bảo mật: khóa toàn bộ bảng. Chỉ script đồng bộ (dùng khóa secret) được đọc/ghi.
--     Quyền đọc cho trang báo cáo sẽ được mở ở bước nối web.
alter table public.call_daily          enable row level security;
alter table public.call_team_daily     enable row level security;
alter table public.call_queue_daily    enable row level security;
alter table public.call_timeslot_daily enable row level security;
alter table public.call_agent_daily    enable row level security;
alter table public.agents              enable row level security;
alter table public.call_queues         enable row level security;
alter table public.kpi_targets         enable row level security;
alter table public.sync_log            enable row level security;
