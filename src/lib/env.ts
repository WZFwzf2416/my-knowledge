const placeholderSupabaseUrl = "https://your-project.supabase.co";
const placeholderSupabaseAnonKey = "your-anon-key";

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? placeholderSupabaseUrl,
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? placeholderSupabaseAnonKey,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const hasSupabaseEnv =
  env.supabaseUrl !== placeholderSupabaseUrl &&
  env.supabaseAnonKey !== placeholderSupabaseAnonKey;

export const hasDatabaseUrl = Boolean(env.databaseUrl);
