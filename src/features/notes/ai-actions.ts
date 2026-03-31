"use server";

import { NoteAiRevisionKind, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/features/auth/server";
import { buildLocalPolishedContent, polishNoteContent } from "@/features/ai/polish";
import { buildLocalSummary, summarizeNoteContent } from "@/features/ai/summarize";
import { buildLocalTags, suggestTagsForNote } from "@/features/ai/tags";
import { buildLocalTitle, suggestTitleForNote } from "@/features/ai/title";
import { env, hasDatabaseUrl, hasOpenAIEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function dashboardMessage(message: string) {
  return `/dashboard?message=${encodeURIComponent(message)}`;
}

function noteMessage(id: string, message: string) {
  return `/notes/${id}?message=${encodeURIComponent(message)}`;
}

function isNextRedirectError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT"),
  );
}

function getAiErrorMessage(error: unknown, fallbackMessage = "AI 服务暂时不可用，请稍后重试。") {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
    return "当前 AI 服务配额不足，请检查 Billing、Usage 或更换可用的 API 项目。";
  }

  return error.message || fallbackMessage;
}

function getAiFallbackMessage(error: unknown, feature: "title" | "summary" | "tags" | "polish") {
  const suffix =
    feature === "summary"
      ? "摘要"
      : feature === "tags"
        ? "标签"
        : feature === "polish"
          ? "正文"
          : "标题";

  if (error instanceof Error && (error.message.includes("429") || error.message.toLowerCase().includes("quota"))) {
    return `AI 服务额度不足，已改用本地规则生成${suffix}。`;
  }

  return `AI 服务暂时不可用，已改用本地规则生成${suffix}。`;
}

function getUndoKindLabel(kind: NoteAiRevisionKind) {
  switch (kind) {
    case "TITLE":
      return "标题";
    case "SUMMARY":
      return "摘要";
    case "CONTENT":
      return "正文";
    case "TAGS":
      return "标签";
    default:
      return "AI 结果";
  }
}

async function getOwnedNoteForAi(noteId: string, userId: string) {
  return prisma!.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      noteTags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

async function saveLatestAiRevision(
  tx: Prisma.TransactionClient,
  noteId: string,
  kind: NoteAiRevisionKind,
  payload: {
    previousTitle?: string | null;
    previousSummary?: string | null;
    previousContent?: string | null;
    previousTags?: string | null;
  },
) {
  await tx.noteAiRevision.deleteMany({
    where: {
      noteId,
      kind,
    },
  });

  await tx.noteAiRevision.create({
    data: {
      noteId,
      kind,
      previousTitle: payload.previousTitle ?? null,
      previousSummary: payload.previousSummary ?? null,
      previousContent: payload.previousContent ?? null,
      previousTags: payload.previousTags ?? null,
    },
  });
}

async function syncGeneratedTags(
  tx: Prisma.TransactionClient,
  noteId: string,
  userId: string,
  tags: string[],
) {
  await tx.noteTag.deleteMany({
    where: { noteId },
  });

  for (const name of tags) {
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

export async function generateTitleAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(noteMessage(noteId, "请先连接数据库后再使用 AI 标题优化。"));
  }

  if (!hasOpenAIEnv) {
    redirect(noteMessage(noteId, "AI 功能尚未配置，请先填写 OPENAI_API_KEY。"));
  }

  const { appUser } = await requireAppUser("请先登录后再使用 AI 标题功能。");
  const note = await getOwnedNoteForAi(noteId, appUser.id);

  if (!note) {
    redirect(dashboardMessage("这条 Note 不存在，或你没有权限操作。"));
  }

  let title = "";
  let successMessage = "";

  try {
    const result = await suggestTitleForNote({
      title: note.title,
      content: note.content,
    });

    title = result.data;
    successMessage = `AI 标题已生成，当前模型：${env.openAiModel}。`;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Generate title failed", error);
    title = buildLocalTitle({
      title: note.title,
      content: note.content,
    });

    if (!title) {
      redirect(noteMessage(note.id, getAiErrorMessage(error, "标题生成失败，请稍后重试。")));
    }

    successMessage = getAiFallbackMessage(error, "title");
  }

  await prisma!.$transaction(async (tx) => {
    await saveLatestAiRevision(tx, note.id, "TITLE", {
      previousTitle: note.title,
    });

    await tx.note.update({
      where: { id: note.id },
      data: {
        title,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  revalidatePath("/public");
  revalidatePath(`/share/${note.id}`);

  redirect(noteMessage(note.id, successMessage));
}

export async function generateSummaryAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(noteMessage(noteId, "请先连接数据库后再使用 AI 摘要。"));
  }

  if (!hasOpenAIEnv) {
    redirect(noteMessage(noteId, "AI 功能尚未配置，请先填写 OPENAI_API_KEY。"));
  }

  const { appUser } = await requireAppUser("请先登录后再使用 AI 摘要功能。");
  const note = await getOwnedNoteForAi(noteId, appUser.id);

  if (!note) {
    redirect(dashboardMessage("这条 Note 不存在，或你没有权限操作。"));
  }

  if (note.content.trim().length < 40) {
    redirect(noteMessage(note.id, "正文内容太短，暂不建议生成摘要。"));
  }

  let summary = "";
  let successMessage = "";

  try {
    const result = await summarizeNoteContent({
      title: note.title,
      content: note.content,
    });

    summary = result.data;
    successMessage = `AI 摘要已生成，当前模型：${env.openAiModel}。`;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Generate summary failed", error);
    summary = buildLocalSummary({
      title: note.title,
      content: note.content,
    });

    if (!summary) {
      redirect(noteMessage(note.id, getAiErrorMessage(error, "摘要生成失败，请稍后重试。")));
    }

    successMessage = getAiFallbackMessage(error, "summary");
  }

  await prisma!.$transaction(async (tx) => {
    await saveLatestAiRevision(tx, note.id, "SUMMARY", {
      previousSummary: note.summary,
    });

    await tx.note.update({
      where: { id: note.id },
      data: {
        summary,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  revalidatePath("/public");
  revalidatePath(`/share/${note.id}`);

  redirect(noteMessage(note.id, successMessage));
}

export async function generatePolishAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(noteMessage(noteId, "请先连接数据库后再使用 AI 正文润色。"));
  }

  if (!hasOpenAIEnv) {
    redirect(noteMessage(noteId, "AI 功能尚未配置，请先填写 OPENAI_API_KEY。"));
  }

  const { appUser } = await requireAppUser("请先登录后再使用 AI 正文润色功能。");
  const note = await getOwnedNoteForAi(noteId, appUser.id);

  if (!note) {
    redirect(dashboardMessage("这条 Note 不存在，或你没有权限操作。"));
  }

  if (note.content.trim().length < 30) {
    redirect(noteMessage(note.id, "正文内容太短，暂不建议进行 AI 润色。"));
  }

  let content = "";
  let successMessage = "";

  try {
    const result = await polishNoteContent({
      title: note.title,
      content: note.content,
    });

    content = result.data;
    successMessage = `AI 正文已润色，当前模型：${env.openAiModel}。`;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Generate polish failed", error);
    content = buildLocalPolishedContent({
      title: note.title,
      content: note.content,
    });

    if (!content) {
      redirect(noteMessage(note.id, getAiErrorMessage(error, "正文润色失败，请稍后重试。")));
    }

    successMessage = getAiFallbackMessage(error, "polish");
  }

  await prisma!.$transaction(async (tx) => {
    await saveLatestAiRevision(tx, note.id, "CONTENT", {
      previousContent: note.content,
    });

    await tx.note.update({
      where: { id: note.id },
      data: {
        content,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  revalidatePath("/public");
  revalidatePath(`/share/${note.id}`);

  redirect(noteMessage(note.id, successMessage));
}

export async function generateTagsAction(formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "").trim();

  if (!noteId) {
    redirect(dashboardMessage("缺少 Note ID。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(noteMessage(noteId, "请先连接数据库后再使用 AI 标签。"));
  }

  if (!hasOpenAIEnv) {
    redirect(noteMessage(noteId, "AI 功能尚未配置，请先填写 OPENAI_API_KEY。"));
  }

  const { appUser } = await requireAppUser("请先登录后再使用 AI 标签功能。");
  const note = await getOwnedNoteForAi(noteId, appUser.id);

  if (!note) {
    redirect(dashboardMessage("这条 Note 不存在，或你没有权限操作。"));
  }

  let tags: string[] = [];
  let successMessage = "";

  try {
    const result = await suggestTagsForNote({
      title: note.title,
      content: note.content,
    });

    tags = result.data;
    successMessage = `AI 标签已生成，当前模型：${env.openAiModel}。`;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error("Generate tags failed", error);
    tags = buildLocalTags({
      title: note.title,
      content: note.content,
    });

    if (tags.length === 0) {
      redirect(noteMessage(note.id, getAiErrorMessage(error, "标签生成失败，请稍后重试。")));
    }

    successMessage = getAiFallbackMessage(error, "tags");
  }

  const previousTags = note.noteTags.map((item) => item.tag.name).join(", ");

  await prisma!.$transaction(async (tx) => {
    await saveLatestAiRevision(tx, note.id, "TAGS", {
      previousTags,
    });

    await syncGeneratedTags(tx, note.id, appUser.id, tags);
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${note.id}`);
  revalidatePath("/public");
  revalidatePath(`/share/${note.id}`);

  redirect(noteMessage(note.id, `${successMessage} 当前标签：${tags.join("、")}。`));
}

export async function undoLatestAiAction(
  noteId: string,
  kind: NoteAiRevisionKind,
  _formData: FormData,
) {
  if (!noteId || !kind) {
    redirect(dashboardMessage("缺少 AI 回退参数。"));
  }

  if (!hasDatabaseUrl || !prisma) {
    redirect(noteMessage(noteId, "请先连接数据库后再使用 AI 回退。"));
  }

  const { appUser } = await requireAppUser("请先登录后再撤销 AI 结果。");
  const note = await getOwnedNoteForAi(noteId, appUser.id);

  if (!note) {
    redirect(dashboardMessage("这条 Note 不存在，或你没有权限操作。"));
  }

  const latestRevision = await prisma.noteAiRevision.findFirst({
    where: {
      noteId,
      kind,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestRevision) {
    redirect(noteMessage(noteId, `${getUndoKindLabel(kind)}当前没有可撤销的 AI 结果。`));
  }

  await prisma!.$transaction(async (tx) => {
    if (kind === "TITLE") {
      await tx.note.update({
        where: { id: noteId },
        data: {
          title: latestRevision.previousTitle ?? note.title,
        },
      });
    }

    if (kind === "SUMMARY") {
      await tx.note.update({
        where: { id: noteId },
        data: {
          summary: latestRevision.previousSummary,
        },
      });
    }

    if (kind === "CONTENT") {
      await tx.note.update({
        where: { id: noteId },
        data: {
          content: latestRevision.previousContent ?? note.content,
        },
      });
    }

    if (kind === "TAGS") {
      const previousTags = latestRevision.previousTags
        ? latestRevision.previousTags
            .split(/[，,]/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      await syncGeneratedTags(tx, noteId, appUser.id, previousTags);
    }

    await tx.noteAiRevision.delete({
      where: { id: latestRevision.id },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/public");
  revalidatePath(`/share/${noteId}`);

  redirect(noteMessage(noteId, `${getUndoKindLabel(kind)}已恢复到上一次 AI 修改前的状态。`));
}
