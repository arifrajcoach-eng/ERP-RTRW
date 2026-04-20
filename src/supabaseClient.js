// Konfigurasi Supabase Client
import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fallback defaults (Project "RW 26 BERJUANG")
  const defaultUrl = "https://lckuphfejjpdeargwsqz.supabase.co";
  const defaultKey = "sb_publishable_o8BiGYMnNB-ivzTU-isKnQ_APCF1gQ0";

  let finalUrl = defaultUrl;
  let finalKey = defaultKey;

  if (url && url.startsWith('http')) {
    finalUrl = url;
  } else if (url) {
    console.warn("Supabase URL provided in environment is invalid. Please ensure it starts with http/https. Using fallback.");
  }

  if (key && key.trim().length > 0) {
    finalKey = key;
  } else if (key) {
     console.warn("Supabase Key provided in environment is empty or invalid. Using fallback.");
  }

  try {
    supabaseInstance = createClient(finalUrl, finalKey);
    return supabaseInstance;
  } catch (error) {
    console.error("Critical Supabase Initialization Error:", error);
    // If even the fallback fails, we create a dummy client to prevent total crash
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: { message: "Supabase not configured correctly" } }),
        insert: () => Promise.resolve({ error: { message: "Supabase not configured correctly" } }),
        update: () => Promise.resolve({ error: { message: "Supabase not configured correctly" } }),
        delete: () => Promise.resolve({ error: { message: "Supabase not configured correctly" } }),
        upsert: () => Promise.resolve({ error: { message: "Supabase not configured correctly" } }),
      }),
      auth: {
        onAuthStateChanged: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null } }),
      }
    };
  }
};

// Export the instance
export const supabase = getSupabase();
