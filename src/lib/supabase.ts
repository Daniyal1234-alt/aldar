import { createClient } from '@supabase/supabase-js';

// Use placeholder values during build time to avoid errors
// The real values will be available at runtime from Vercel env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
