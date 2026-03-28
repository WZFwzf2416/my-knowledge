const placeholderSupabaseUrl = "https://your-project.supabase.co";
const placeholderSupabaseAnonKey = "your-anon-key";
const placeholderServiceRoleKey = "your-service-role-key";

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? placeholderSupabaseUrl,
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? placeholderSupabaseAnonKey,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? placeholderServiceRoleKey,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseStorageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "avatars",
  supabaseNoteCoverBucket: process.env.NEXT_PUBLIC_SUPABASE_NOTE_COVER_BUCKET ?? "note-covers",
};

export const hasSupabaseEnv =
  env.supabaseUrl !== placeholderSupabaseUrl &&
  env.supabaseAnonKey !== placeholderSupabaseAnonKey;

export const hasSupabaseServiceRole = env.supabaseServiceRoleKey !== placeholderServiceRoleKey;

export const hasDatabaseUrl = Boolean(env.databaseUrl);
