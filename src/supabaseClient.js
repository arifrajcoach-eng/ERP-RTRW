// Konfigurasi Supabase Client
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://lckuphfejjpdeargwsqz.supabase.co"
const SUPABASE_PUBLIC_KEY = "sb_publishable_o8BiGYMnNB-ivzTU-isKnQ_APCF1gQ0"

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
