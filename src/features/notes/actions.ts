"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, hasDatabaseUrl, hasSupabaseEnv, hasSupabaseServiceRole } from "@/lib/env";
import { syncAppUser } from "@/features/auth/sync-user";

function dashboardMessage(message: string) {
  return `/dashboard?message=${encodeURIComponent(message)}`;
}

function noteMessage(id: string, message: string) {
  return `/notes/${id}?message=${encodeURIComponent(message)}`;
}

function resolveReturnTo(formData: FormData, fallbackPath: string) {
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  return returnTo || fallbackPath;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function getRequiredUser() {
  if (!hasSupabaseEnv) {
    redirect("/login?message=" + encodeURIComponent("请先配置 Supabase 环境变量。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(dashboardMessage("请先配置数据库连接。"));
  }

  const supabase = await createSupabaseActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=" + encodeURIComponent("请先登录后再继续。"));
  }

  const appUser = await syncAppUser(user);

  return { authUser: user, appUser };
}

async function getOwnedNote(noteId: string, userId: string) {
  return prisma!.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });
}

async function syncNoteTags(
  tx: Prisma.TransactionClient,
  noteId: string,
  userId: string,
  rawTags: string,
) {
  const tagNames = [
    ...new Set(
      rawTags
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  await tx.noteTag.deleteMany({
    where: { noteId },
  });

  for (const name of tagNames) {
    const tag = await tx.tag.upsert({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      update: {},
      create: {
        userId,
        name,
      },
    });

    await tx.noteTag.create({
      data: {
        noteId,
        tagId: tag.id,
      },
    });
  }
}

async function resolveCoverImageUrl(
  formData: FormData,
  authUserId: string,
  currentCoverImageUrl = "",
) {
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const coverImageFile = formData.get("coverImageFile");

  if (!(coverImageFile instanceof File) || coverImageFile.size === 0) {
    return coverImageUrl || currentCoverImageUrl || null;
  }

  if (!hasSupabaseEnv || !hasSupabaseServiceRole) {
    redirect(dashboardMessage("请先配置 Supabase Service Role Key 后再上传封面图。"));
  }

  if (!coverImageFile.type.startsWith("image/")) {
    redirect(dashboardMessage("封面图文件必须是图片格式。"));
  }

  if (coverImageFile.size > 8 * 1024 * 1024) {
    redirect(dashboardMessage("封面图文件不能超过 8MB。"));
  }

  const extension = coverImageFile.name.split(".").pop() ?? "png";
  const baseName = coverImageFile.name || `cover.${extension}`;
  const path = `${authUserId}/${Date.now()}-${sanitizeFileName(baseName)}`;
  const supabase = createSupabaseAdminClient();

  const { error: uploadError } = await supabase.storage
    .from(env.supabaseNoteCoverBucket)
    .upload(path, coverImageFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: coverImageFile.type,
    });

  if (uploadError) {
    redirect(dashboardMessage(uploadError.message || "封面图上传失败，请检查 Storage 配置。"));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(env.supabaseNoteCoverBucket).getPublicUrl(path);

  return publicUrl;
}

export async function createNoteAction(formData: FormData) {
  const { authUser, appUser } = await getRequiredUser();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "PRIVATE").trim();
  const rawTags = String(formData.get("tags") ?? "").trim();
  const coverImageUrl = await resolveCoverImageUrl(formData, authUser.id);

  if (!title || !content) {
    redirect(dashboardMessage("标题和正文不能为空。"));
  }

  const note = await prisma!.$transaction(async (tx) => {
    const createdNote = await tx.note.create({
      data: {
        userId: appUser.id,
        title,
        summary: summary || null,
        content,
        coverImageUrl,
        visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      },
    });

    await syncNoteTags(tx, createdNote.id, appUser.id, rawTags);

    return createdNote;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  revalidatePath("/public");
  revalidatePath(`/share/${note.id}`);
  redirect(dashboardMessage("Note 创建成功，已经写入数据库。"));
}

export async function updateNoteAction(formData: FormData) {
  const { authUser, appUser } = await getRequiredUser();

  const noteId = String(formData.get("noteId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "PRIVATE").trim();
  const rawTags = String(formData.get("tags") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  if (!title || !content) {
    redirect(noteMessage(noteId, "标题和正文不能为空。"));
  }

  const existing = await getOwnedNote(noteId, appUser.id);

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限编辑。"));
  }

  const coverImageUrl = await resolveCoverImageUrl(
    formData,
    authUser.id,
    existing.coverImageUrl ?? "",
  );

  await prisma!.$transaction(async (tx) => {
    await tx.note.update({
      where: { id: noteId },
      data: {
        title,
        summary: summary || null,
        content,
        coverImageUrl,
        visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
      },
    });

    await syncNoteTags(tx, noteId, appUser.id, rawTags);
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/public");
  revalidatePath(`/share/${noteId}`);
  redirect(noteMessage(noteId, "Note 已更新。"));
}

export async function toggleFavoriteAction(formData: FormData) {
  const { appUser } = await getRequiredUser();
  const noteId = String(formData.get("noteId") ?? "").trim();
  const returnTo = resolveReturnTo(formData, "/dashboard");

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  const existing = await getOwnedNote(noteId, appUser.id);

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限操作。"));
  }

  await prisma!.note.update({
    where: { id: noteId },
    data: {
      isFavorited: !existing.isFavorited,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/public");
  revalidatePath(`/share/${noteId}`);
  redirect(returnTo);
}

export async function togglePinnedAction(formData: FormData) {
  const { appUser } = await getRequiredUser();
  const noteId = String(formData.get("noteId") ?? "").trim();
  const returnTo = resolveReturnTo(formData, "/dashboard");

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  const existing = await getOwnedNote(noteId, appUser.id);

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限操作。"));
  }

  await prisma!.note.update({
    where: { id: noteId },
    data: {
      isPinned: !existing.isPinned,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/public");
  revalidatePath(`/share/${noteId}`);
  redirect(returnTo);
}

export async function deleteNoteAction(formData: FormData) {
  const { appUser } = await getRequiredUser();
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  const existing = await getOwnedNote(noteId, appUser.id);

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限删除。"));
  }

  await prisma!.note.delete({
    where: { id: noteId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/public");
  revalidatePath(`/share/${noteId}`);
  redirect(dashboardMessage("Note 已删除。"));
}
