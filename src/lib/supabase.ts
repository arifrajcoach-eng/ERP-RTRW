import { createClient } from "@supabase/supabase-js";

// Helper to get Supabase credentials dynamically (pre-configured env or user-supplied local state)
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const localUrl = localStorage.getItem("supabase_url");
  const localKey = localStorage.getItem("supabase_anon_key");

  const metaEnv = (import.meta as any).env || {};
  return {
    url: localUrl || metaEnv.VITE_SUPABASE_URL || "",
    anonKey: localKey || metaEnv.VITE_SUPABASE_ANON_KEY || "",
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem("supabase_url", url);
  else localStorage.removeItem("supabase_url");
  
  if (anonKey) localStorage.setItem("supabase_anon_key", anonKey);
  else localStorage.removeItem("supabase_anon_key");
}

let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClientInstance;
}

// Reset client instance when credentials change
export function resetSupabaseClient() {
  supabaseClientInstance = null;
}

/**
 * SQL Schema script to instantly construct the PostgreSQL database structure inside Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- SmartRW AI - Complete Supabase Schema Migration Script
-- Copy and paste this script into your Supabase Dashboard > SQL Editor, then click "Run"

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants (RT/RW) Table
create table if not exists public.tenants (
  id text primary key,
  parent_id text,
  name text not null,
  type text not null, -- 'RT' | 'RW'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users / Pengurus Table
create table if not exists public.users (
  id text primary key,
  email text,
  name text not null,
  role text not null, -- 'Warga' | 'RT' | 'RW' | 'Satpam'
  tenant_id text references public.tenants(id) on delete cascade,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Data Warga Table
create table if not exists public.data_warga (
  id text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  no_kk text,
  nik text not null,
  nama_lengkap text not null,
  jenis_kelamin text,
  tempat_lahir text,
  tanggal_lahir text,
  agama text,
  status_perkawinan text,
  pekerjaan text,
  no_hp text,
  status_tinggal text, -- 'Tetap' | 'Kontrak' | 'Kos'
  blok_rumah text,
  nomor_rumah text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Keuangan (Kas) Table
create table if not exists public.keuangan (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  tipe text not null, -- 'MASUK' | 'KELUAR'
  nominal numeric not null default 0,
  tanggal text not null,
  kategori text,
  keterangan text,
  pembuat_nama text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Iuran (Dues Tracker) Table
create table if not exists public.iuran (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  warga_id text references public.data_warga(id) on delete set null,
  tahun integer not null,
  bulan integer not null,
  nominal numeric not null default 0,
  status text not null, -- 'LUNAS' | 'BELUM'
  tanggal_bayar text,
  metode_pembayaran text,
  catatan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Surat (Digital Letters) Table
create table if not exists public.surat (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  pemohon_id text references public.data_warga(id) on delete set null,
  jenis text not null,
  keperluan text,
  status text default 'PENDING' not null, -- 'PENDING' | 'DISETUJUI' | 'DITOLAK'
  catatan_admin text,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Keamanan (SOS Alerts & Guest Book)
create table if not exists public.sos_alerts (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  reporter_id text,
  reporter_name text not null,
  latitude double precision,
  longitude double precision,
  status text default 'ACTIVE' not null, -- 'ACTIVE' | 'RESOLVED'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.buku_tamu (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  nama_tamu text not null,
  keperluan text,
  tujuan_blok text,
  tujuan_nomor text,
  identitas_jenis text,
  identitas_no text,
  status_kunjungan text default 'MASUK', -- 'MASUK' | 'KELUAR'
  waktu_masuk text,
  waktu_keluar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. E-Toko (Product & Orders)
create table if not exists public.toko_products (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  nama_produk text not null,
  deskripsi text,
  harga numeric not null default 0,
  stok integer default 0,
  image_url text,
  penjual_nama text,
  no_wa text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.toko_orders (
  id text default uuid_generate_v4()::text primary key,
  tenant_id text references public.tenants(id) on delete cascade,
  produk_id text references public.toko_products(id) on delete set null,
  pembeli_nama text not null,
  pembeli_wa text not null,
  jumlah integer default 1,
  total_harga numeric not null,
  status text default 'NEW', -- 'NEW' | 'PROSES' | 'DIKIRIM' | 'SELESAI' | 'BATAL'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime for all tables to maintain instantaneous experience
alter publication supabase_realtime add table tenants;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table data_warga;
alter publication supabase_realtime add table keuangan;
alter publication supabase_realtime add table iuran;
alter publication supabase_realtime add table surat;
alter publication supabase_realtime add table sos_alerts;
alter publication supabase_realtime add table buku_tamu;
alter publication supabase_realtime add table toko_products;
alter publication supabase_realtime add table toko_orders;
`;
