import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'kiotviet_supabase_url_v1';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'kiotviet_supabase_anon_key_v1';

// Default Demo / Placeholder Supabase configuration
const DEFAULT_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://kiotviet-care-portal.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.kiotviet-demo-anon-key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  try {
    const customUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY);
    return {
      url: customUrl || DEFAULT_SUPABASE_URL,
      anonKey: customKey || DEFAULT_SUPABASE_ANON_KEY,
    };
  } catch {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, anonKey.trim());
  } catch (err) {
    console.error('Failed to save Supabase credentials', err);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseCredentials();
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabaseInstance;
}

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- KIOTVIET CARE ENTERPRISE: SUPABASE DATABASE SCHEMA DEFINITION
-- ==============================================================

-- 1. Bảng danh sách User Admin được cấp quyền đăng nhập (Whitelist)
CREATE TABLE IF NOT EXISTS public.allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Quản lý CSKH',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed danh sách Admin cấp sẵn theo yêu cầu
INSERT INTO public.allowed_users (email, name, role)
VALUES 
  ('thuyet.vm@kiotviet.com', 'Vũ Minh Thuyết', 'Manager CS (Super Admin)'),
  ('lam.tran@kiotviet.com', 'Trần Lâm', 'Quản lý CSKH (Lead Admin)'),
  ('yen.nguyen@kiotviet.com', 'Nguyễn Thị Yến', 'Manager CS')
ON CONFLICT (email) DO NOTHING;

-- 2. Bảng lưu trữ Dữ liệu Báo cáo Đa Kênh từ Google Sheets / Excel
CREATE TABLE IF NOT EXISTS public.multichannel_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL,
  metric TEXT NOT NULL,
  year INT DEFAULT 2026,
  month_1 NUMERIC,
  month_2 NUMERIC,
  month_3 NUMERIC,
  month_4 NUMERIC,
  month_5 NUMERIC,
  month_6 NUMERIC,
  month_7 NUMERIC,
  month_8 NUMERIC,
  month_9 NUMERIC,
  month_10 NUMERIC,
  month_11 NUMERIC,
  month_12 NUMERIC,
  definition TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bảng Nhật ký Đồng bộ Dữ liệu (Audit Log)
CREATE TABLE IF NOT EXISTS public.sync_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  user_email TEXT NOT NULL,
  row_count INT DEFAULT 0,
  status TEXT DEFAULT 'success',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Kích hoạt Row Level Security (RLS) bảo mật dữ liệu
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multichannel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Chỉ user đã xác thực trong Whitelist mới có quyền đọc và ghi dữ liệu
CREATE POLICY "Allow whitelisted admins full access" 
ON public.multichannel_metrics
FOR ALL
USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.allowed_users WHERE is_active = TRUE));
`;
