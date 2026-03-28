import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseEnv, hasSupabaseServiceRole } from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!hasSupabaseEnv || !hasSupabaseServiceRole) {
    throw new Error("Supabase admin client is not configured.");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
