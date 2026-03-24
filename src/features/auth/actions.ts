"use server";

import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

function withMessage(message: string) {
  return `/login?message=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  if (!hasSupabaseEnv) {
    redirect(withMessage("请先在 .env.local 中配置 Supabase 环境变量。"));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect(withMessage("请输入邮箱和密码。"));
  }

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(withMessage(error.message));
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  if (!hasSupabaseEnv) {
    redirect(withMessage("请先在 .env.local 中配置 Supabase 环境变量。"));
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    redirect(withMessage("注册需要邮箱和密码。"));
  }

  const supabase = await createSupabaseActionClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(withMessage(error.message));
  }

  redirect(withMessage("注册成功，请返回登录或检查邮箱确认。"));
}

export async function logoutAction() {
  if (!hasSupabaseEnv) {
    redirect("/");
  }

  const supabase = await createSupabaseActionClient();
  await supabase.auth.signOut();

  redirect("/login?message=" + encodeURIComponent("你已经退出登录。"));
}
