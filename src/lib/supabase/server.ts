import "server-only";
import { createClient } from "@supabase/supabase-js";

// All Cybernook tables live in their own Postgres schema, isolated from the
// unrelated hardware-store POS schema already in this Supabase project.
const SCHEMA = "cybernook";

// Service-role client: full DB access, bypasses RLS. Only ever import this
// from server components / API routes — never bundle it for the browser.
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, db: { schema: SCHEMA } }
  );
}

// Anon client for server-side reads of public catalog data.
export function createAnonSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false }, db: { schema: SCHEMA } }
  );
}
