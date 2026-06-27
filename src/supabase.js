import { createClient } from '@supabase/supabase-js';

// Suporta chaves vindo do .env ou salvas no localStorage (Setup Wizard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabaseUrl');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabaseAnonKey');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
