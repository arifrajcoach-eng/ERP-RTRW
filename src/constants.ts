export const PLAN_CONFIG = {
  STARTER: { id: 'starter', name: 'STARTER', focus: 'TRIAL', priceMonthly: 0, priceYearly: 0, features: ['Maks 50 Warga', 'Pencatatan Warga', 'Keuangan Dasar', 'Surat Standar'], systemKey: 'TRIAL' },
  FLASH: { id: 'flash', name: 'FLASH', focus: 'KHUSUS RT', priceMonthly: 55000, priceOldMonthly: 85000, priceYearly: 550000, features: ['Maks 300 Warga', 'Iuran & Data Warga Penuh', 'Surat, Inventaris, Tamu, SOS', 'AI Chatbot (50 chat/bln)'], systemKey: 'BASIC' },
  PRO: { id: 'pro', name: 'PRO', focus: 'KHUSUS RW', priceMonthly: 129000, priceOldMonthly: 169000, priceYearly: 1290000, features: ['Semua Fitur FLASH', 'Maks 1000 Warga', 'Buku Tamu, E-Voting, Keshling', 'AI Chatbot (200/bln)'], systemKey: 'PRO' },
  PREMIUM: { id: 'premium', name: 'PREMIUM LITE', focus: 'MULTI-TENANT', priceMonthly: 239000, priceOldMonthly: 479000, priceYearly: 2390000, features: ['6 Tenant (5 RT + 1 RW)', 'Maks 1000 Warga', 'Semua Fitur Shared', 'Tanpa AI Berat'], systemKey: 'PREMIUM', isBestSeller: true },
  ENTERPRISE: { id: 'enterprise', name: 'ENTERPRISE', focus: 'PERUMAHAN BESAR', priceMonthly: 2500000, priceOldMonthly: 4900000, priceYearly: 25000000, features: ['Multi RW / Skala Kelurahan', 'White Label & Custom DB', 'Big Data & Strategic AI', 'Maks 20.000 Warga'], systemKey: 'ENTERPRISE' },
};

export const ADDON_CONFIG = {
  AI_CHAT: { id: 'addon_ai', name: 'Extra AI Chat Quota (+100)', priceMonthly: 25000, featureKey: 'extraAi_100' },
  POSYANDU: { id: 'addon_posyandu', name: 'Modul Kesehatan (Posyandu)', priceMonthly: 15000, featureKey: 'posyandu' },
  EVOTING: { id: 'addon_evoting', name: 'Modul E-Voting & Pemilu', priceMonthly: 20000, featureKey: 'ePemilu' },
  BANK_SAMPAH: { id: 'addon_banksampah', name: 'Modul Bank Sampah', priceMonthly: 15000, featureKey: 'bankSampah' },
  CCTV: { id: 'addon_cctv', name: 'CCTV Integration', priceMonthly: 50000, featureKey: 'cctv' },
  ELAPAK: { id: 'addon_elapak', name: 'E-Lapak (Pasar Warga)', priceMonthly: 30000, featureKey: 'eLapakFull' },
  JUMLAH_WARGA: { id: 'addon_warga', name: 'Jumlah Warga', priceMonthly: 0, featureKey: 'jumlahWarga' },
  SOS: { id: 'addon_sos', name: 'Modul SOS', priceMonthly: 0, featureKey: 'modulSos' },
  BUKU_TAMU: { id: 'addon_buku_tamu', name: 'Buku Tamu', priceMonthly: 0, featureKey: 'bukuTamu' },
  INVENTARIS: { id: 'addon_inventaris', name: 'Inventaris', priceMonthly: 0, featureKey: 'inventaris' },
  PPOB: { id: 'addon_ppob', name: 'PPOB', priceMonthly: 0, featureKey: 'ppob' },
  AI_AGENT: { id: 'addon_ai_agent', name: 'AI Agent', priceMonthly: 0, featureKey: 'aiAgent' },
  GRUP_CHAT: { id: 'addon_grup_chat', name: 'Grup Chat', priceMonthly: 0, featureKey: 'grupChat' },
  KELUHAN: { id: 'addon_keluhan', name: 'Lapor Keluhan (Warga)', priceMonthly: 0, featureKey: 'complaint' },
  BOOKING: { id: 'addon_booking', name: 'Booking Fasilitas', priceMonthly: 5000, featureKey: 'booking' },
};
