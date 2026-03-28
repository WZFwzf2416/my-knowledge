import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { syncAppUser } from "@/features/auth/sync-user";

export async function getOptionalAuthUser() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createSupabaseServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireAuthUser(message: string) {
  const user = await getOptionalAuthUser();

  if (!user) {
    redirect(`/login?message=${encodeURIComponent(message)}`);
  }

  return user;
}

export async function getOptionalAppUser() {
  const user = await getOptionalAuthUser();

  if (!user) {
    return null;
  }

  const appUser = await syncAppUser(user);

  return { authUser: user, appUser };
}

export async function requireAppUser(message: string) {
  const user = await requireAuthUser(message);
  const appUser = await syncAppUser(user);

  return { authUser: user, appUser };
}
