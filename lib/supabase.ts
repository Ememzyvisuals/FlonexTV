import { createClient, SupabaseClient } from "@supabase/supabase-js";

const URL_  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const ANON  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SVC   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const HAS_SUPABASE = URL_.length > 10;

// Browser client
export const supabase = HAS_SUPABASE ? createClient(URL_, ANON) : null;

// Server-side admin client (lazy init)
let _admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      URL_ || "https://placeholder.supabase.co",
      SVC  || "placeholder",
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}
