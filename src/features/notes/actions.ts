"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseActionClient } from "@/lib/supabase/server";
import { hasDatabaseUrl, hasSupabaseEnv } from "@/lib/env";
import { syncAppUser } from "@/features/auth/sync-user";

function dashboardMessage(message: string) {
  return `/dashboard?message=${encodeURIComponent(message)}`;
}

function noteMessage(id: string, message: string) {
  return `/notes/${id}?message=${encodeURIComponent(message)}`;
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

async function syncNoteTags(noteId: string, userId: string, rawTags: string) {
  const tagNames = [...new Set(rawTags.split(/[，,]/).map((item) => item.trim()).filter(Boolean))];

  await prisma!.noteTag.deleteMany({
    where: { noteId },
  });

  for (const name of tagNames) {
    const tag = await prisma!.tag.upsert({
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

    await prisma!.noteTag.create({
      data: {
        noteId,
        tagId: tag.id,
      },
    });
  }
}

export async function createNoteAction(formData: FormData) {
  const { appUser } = await getRequiredUser();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "PRIVATE").trim();
  const rawTags = String(formData.get("tags") ?? "").trim();

  if (!title || !content) {
    redirect(dashboardMessage("标题和正文不能为空。"));
  }

  const note = await prisma!.note.create({
    data: {
      userId: appUser.id,
      title,
      summary: summary || null,
      content,
      visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    },
  });

  await syncNoteTags(note.id, appUser.id, rawTags);

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  redirect(dashboardMessage("Note 创建成功，已经写入数据库。"));
}

export async function updateNoteAction(formData: FormData) {
  const { appUser } = await getRequiredUser();

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

  const existing = await prisma!.note.findFirst({
    where: {
      id: noteId,
      userId: appUser.id,
    },
  });

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限编辑。"));
  }

  await prisma!.note.update({
    where: { id: noteId },
    data: {
      title,
      summary: summary || null,
      content,
      visibility: visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    },
  });

  await syncNoteTags(noteId, appUser.id, rawTags);

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
  redirect(noteMessage(noteId, "Note 已更新。"));
}

export async function deleteNoteAction(formData: FormData) {
  const { appUser } = await getRequiredUser();
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  const existing = await prisma!.note.findFirst({
    where: {
      id: noteId,
      userId: appUser.id,
    },
  });

  if (!existing) {
    redirect(dashboardMessage("这条 Note 不存在，或者你没有权限删除。"));
  }

  await prisma!.note.delete({
    where: { id: noteId },
  });

  revalidatePath("/dashboard");
  redirect(dashboardMessage("Note 已删除。"));
}
