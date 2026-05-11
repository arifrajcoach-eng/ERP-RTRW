export const PLAN_CONFIG = {
  STARTER: { id: 'starter', name: 'STARTER', focus: 'GRATIS / TRIAL', priceMonthly: 0, priceYearly: 0, features: ['Maks 50 Warga', 'Pembayaran PPOB (Bagi Hasil)', 'Pencatatan Warga & Keuangan', 'AI Scan (3/bln)', 'Surat Standar'], systemKey: 'TRIAL' },
  FLASH: { id: 'flash', name: 'FLASH', focus: 'KHUSUS RT', priceMonthly: 55000, priceOldMonthly: 85000, priceYearly: 550000, features: ['Maks 300 Warga', 'PPOB & Iuran Digital', 'Operasional: Surat, Tamu, SOS', 'Booking Fasilitas Umum', 'AI Chatbot (50 chat/bln)'], systemKey: 'BASIC' },
  PRO: { id: 'pro', name: 'PRO', focus: 'KHUSUS RW', priceMonthly: 129000, priceOldMonthly: 169000, priceYearly: 1290000, features: ['Semua Fitur FLASH', 'Maks 1000 Warga', 'Posyandu, Bank Sampah, Keshling', 'E-Voting (Pemilu Warga)', 'AI Chatbot (200/bln)'], systemKey: 'PRO' },
  PREMIUM: { id: 'premium', name: 'PREMIUM', focus: 'MULTI-TENANT RW', priceMonthly: 239000, priceOldMonthly: 479000, priceYearly: 2390000, features: ['6 Tenant (5 RT + 1 RW)', 'Dashboard Konsolidasi Data', 'Integrasi CCTV & Keamanan', 'AI Scan Struk (100/bln)', 'Prioritas Support'], systemKey: 'PREMIUM', isBestSeller: true },
  ENTERPRISE: { id: 'enterprise', name: 'ENTERPRISE', focus: 'PERUMAHAN BESAR', priceMonthly: 2500000, priceOldMonthly: 4900000, priceYearly: 25000000, features: ['Multi RW / Skala Kelurahan', 'White Label & Custom Domain', 'Full AI Strategic Insights', 'Dedicated Manager 24/7', 'Unlimited Warga'], systemKey: 'ENTERPRISE' },
};

export const ADDON_CONFIG = {
  AI_CHAT: { id: 'addon_ai', name: 'Extra AI Chat (100 chats)', hpp: 20000, priceMonthly: 49000, featureKey: 'extraAi_100' },
  POSYANDU: { id: 'addon_posyandu', name: 'Modul Kesehatan (Posyandu)', hpp: 15000, priceMonthly: 35000, featureKey: 'posyandu' },
  EVOTING: { id: 'addon_evoting', name: 'Modul E-Voting & Pemilu', hpp: 20000, priceMonthly: 45000, featureKey: 'ePemilu' },
  BANK_SAMPAH: { id: 'addon_banksampah', name: 'Modul Bank Sampah', hpp: 15000, priceMonthly: 35000, featureKey: 'bankSampah' },
  CCTV: { id: 'addon_cctv', name: 'CCTV Integration', hpp: 35000, priceMonthly: 80000, featureKey: 'cctv' },
  ELAPAK: { id: 'addon_elapak', name: 'E-Lapak (Pasar Warga)', hpp: 20000, priceMonthly: 50000, featureKey: 'eLapakFull' },
  PPOB: { id: 'addon_ppob', name: 'PPOB', hpp: 20000, priceMonthly: 50000, featureKey: 'ppob' },
  BOOKING: { id: 'addon_booking', name: 'Booking Fasilitas', hpp: 2000, priceMonthly: 5000, featureKey: 'booking' },
  JUMLAH_WARGA: { id: 'addon_warga', name: 'Jumlah Warga', priceMonthly: 0, featureKey: 'jumlahWarga' },
  SOS: { id: 'addon_sos', name: 'Modul SOS', priceMonthly: 0, featureKey: 'modulSos' },
  BUKU_TAMU: { id: 'addon_buku_tamu', name: 'Buku Tamu', priceMonthly: 0, featureKey: 'bukuTamu' },
  INVENTARIS: { id: 'addon_inventaris', name: 'Inventaris', priceMonthly: 0, featureKey: 'inventaris' },
  AI_AGENT: { id: 'addon_ai_agent', name: 'AI Agent', priceMonthly: 0, featureKey: 'aiAgent' },
  GRUP_CHAT: { id: 'addon_grup_chat', name: 'Grup Chat', priceMonthly: 0, featureKey: 'grupChat' },
  KELUHAN: { id: 'addon_keluhan', name: 'Lapor Keluhan (Warga)', priceMonthly: 0, featureKey: 'complaint' },
};
