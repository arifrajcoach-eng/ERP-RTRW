export const PLAN_CONFIG = {
  STARTER: { id: 'starter', name: 'STARTER', focus: 'GRATIS / TRIAL', priceMonthly: 0, priceYearly: 0, features: ['Cetak Surat Pengantar dalam hitungan detik', 'Ubah Biaya jadi Income Kas RT dengan Fitur PPOB Bagi-Hasil', 'Coba keajaiban AI : Foto struk langsung jadi laporan (Batas 3x/Bulan)'], systemKey: 'TRIAL' },
  FLASH: { id: 'flash', name: 'FLASH', focus: 'KHUSUS RT', priceMonthly: 55000, priceOldMonthly: 85000, priceYearly: 550000, features: ['Maks 300 Warga', 'PPOB & Iuran Digital Integrasi', 'Surat Digital, Buku Tamu Digital, SOS', 'Booking Fasilitas Umum', 'AI Chatbot (50x/bln)'], systemKey: 'BASIC' },
  PRO: { id: 'pro', name: 'PRO', focus: 'KHUSUS RW', priceMonthly: 129000, priceOldMonthly: 169000, priceYearly: 1290000, features: ['Semua Fitur FLASH', 'Maks 1000 Warga', 'Modul Posyandu', 'Modul Bank Sampah', 'Modul E-Voting (Pemilu Warga)', 'AI Chatbot (200x/bln)'], systemKey: 'PRO' },
  PREMIUM: { id: 'premium', name: 'PREMIUM', focus: 'MULTI-TENANT RW', priceMonthly: 239000, priceOldMonthly: 479000, priceYearly: 2390000, features: ['Available 6 Tenant (Multi-Tenant RW -> 5 RT + 1 RW)', 'Dashboard Konsolidasi Data RW', 'Integrasi CCTV Keamanan', 'AI Scan Struk (100x/bln)', 'Prioritas Layanan Support'], systemKey: 'PREMIUM', isBestSeller: true },
  ENTERPRISE: { id: 'enterprise', name: 'ENTERPRISE', focus: 'PERUMAHAN BESAR', priceMonthly: 4500000, priceOldMonthly: 5900000, priceYearly: 25000000, features: ['Multi-RW / Skala Kelurahan/ Perumahan Besar', 'Custom Domain / White Labeling', 'AI Strategic & Big Data Insights', 'Warga Tanpa Batas (Unlimited)', 'Dedicated CS Manager 24/7'], systemKey: 'ENTERPRISE' },
};

export const ADDON_CONFIG = {
  AI_CHAT: { id: 'addon_ai', name: 'Extra AI Chat (100 chats) - 49k/ bln', hpp: 20000, priceMonthly: 49000, featureKey: 'extraAi_100' },
  POSYANDU: { id: 'addon_posyandu', name: 'Modul Kesehatan (Posyandu) - 35k/ bln', hpp: 15000, priceMonthly: 35000, featureKey: 'posyandu' },
  EVOTING: { id: 'addon_evoting', name: 'Modul E-Voting & Pemilu - 45k/ bln', hpp: 20000, priceMonthly: 45000, featureKey: 'ePemilu' },
  BANK_SAMPAH: { id: 'addon_banksampah', name: 'Modul Bank Sampah - 35k/ bln', hpp: 15000, priceMonthly: 35000, featureKey: 'bankSampah' },
  CCTV: { id: 'addon_cctv', name: 'CCTV Integration - 80k/ bln', hpp: 35000, priceMonthly: 80000, featureKey: 'cctv' },
  ELAPAK: { id: 'addon_elapak', name: 'E-Lapak (Pasar Warga) - 50k/ bln', hpp: 20000, priceMonthly: 50000, featureKey: 'eLapakFull' },
  PPOB: { id: 'addon_ppob', name: 'Modul PPOB (Payment Point Online Bank) - 50k/ bln', hpp: 20000, priceMonthly: 50000, featureKey: 'ppob' },
  BOOKING: { id: 'addon_booking', name: 'Modul Booking Fasilitas - 5k/ bln', hpp: 2000, priceMonthly: 5000, featureKey: 'booking' },
  JUMLAH_WARGA_100: { id: 'addon_warga_100', name: 'Ekstra +100 Warga - 15k/ bln', hpp: 5000, priceMonthly: 15000, featureKey: 'warga_100' },
  JUMLAH_WARGA_500: { id: 'addon_warga_500', name: 'Ekstra +500 Warga - 50k/ bln', hpp: 20000, priceMonthly: 50000, featureKey: 'warga_500' },
  SOS: { id: 'addon_sos', name: 'Modul SOS - 29k/ bln', hpp: 10000, priceMonthly: 29000, featureKey: 'modulSos' },
  BUKU_TAMU: { id: 'addon_buku_tamu', name: 'Buku Tamu Digital - 19k/ bln', priceMonthly: 19000, featureKey: 'bukuTamu' },
  INVENTARIS: { id: 'addon_inventaris', name: 'Modul Inventaris - 15k/ bln', priceMonthly: 15000, featureKey: 'inventaris' },
  AI_AGENT: { id: 'addon_ai_agent', name: 'AI Agent (Asisten 24/7) - 59k/ bln', priceMonthly: 59000, featureKey: 'aiAgent' },
  GRUP_CHAT: { id: 'addon_grup_chat', name: 'Grup Chat Warga - 25k/ bln', priceMonthly: 25000, featureKey: 'grupChat' },
  KELUHAN: { id: 'addon_keluhan', name: 'Lapor Keluhan (Warga)', priceMonthly: 0, featureKey: 'complaint' },
};
