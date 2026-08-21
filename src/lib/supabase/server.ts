import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client: full DB access, bypasses RLS. Only ever import this
// from server components / API routes — never bundle it for the browser.
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Anon client for server-side reads of public catalog data.
export function createAnonSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
