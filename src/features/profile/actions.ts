"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { env, hasDatabaseUrl, hasSupabaseEnv, hasSupabaseServiceRole } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAppUser } from "@/features/auth/server";
import { profileSchema } from "@/features/profile/schema";

function profileMessage(message: string) {
  return `/profile?message=${encodeURIComponent(message)}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function updateProfileAction(formData: FormData) {
  if (!hasDatabaseUrl || !prisma) {
    redirect(profileMessage("请先配置数据库连接。"));
  }

  const { authUser, appUser } = await requireAppUser("请先登录后再编辑个人资料。");

  let avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const avatarFile = formData.get("avatarFile");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!hasSupabaseEnv || !hasSupabaseServiceRole) {
      redirect(profileMessage("请先配置 Supabase Service Role Key 后再上传头像。"));
    }

    if (!avatarFile.type.startsWith("image/")) {
      redirect(profileMessage("头像文件必须是图片格式。"));
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      redirect(profileMessage("头像文件不能超过 5MB。"));
    }

    const extension = avatarFile.name.split(".").pop() ?? "png";
    const baseName = avatarFile.name || `avatar.${extension}`;
    const path = `${authUser.id}/${Date.now()}-${sanitizeFileName(baseName)}`;
    const supabase = createSupabaseAdminClient();

    const { error: uploadError } = await supabase.storage.from(env.supabaseStorageBucket).upload(path, avatarFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: avatarFile.type,
    });

    if (uploadError) {
      redirect(profileMessage(uploadError.message || "头像上传失败，请检查 Storage 配置。"));
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(env.supabaseStorageBucket).getPublicUrl(path);

    avatarUrl = publicUrl;
  }

  const values = {
    nickname: String(formData.get("nickname") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    avatarUrl,
  };

  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message ?? "表单填写有误，请检查后重试。";
    redirect(profileMessage(firstMessage));
  }

  await prisma.user.update({
    where: { id: appUser.id },
    data: {
      nickname: parsed.data.nickname || null,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect(profileMessage("个人资料已更新。"));
}
