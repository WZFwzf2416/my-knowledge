import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/env";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    name?: string;
    full_name?: string;
    user_name?: string;
    avatar_url?: string;
  };
};

type DashboardFilters = {
  query?: string;
  tag?: string;
};

export type NoteTagItem = {
  tag: {
    name: string;
  };
};

export type FallbackNote = {
  id: string;
  title: string;
  summary: string;
  content: string;
  visibility: "PRIVATE" | "PUBLIC";
  noteTags: NoteTagItem[];
  updatedAt: Date;
};

export type NoteDetail = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  visibility: "PRIVATE" | "PUBLIC";
  noteTags: NoteTagItem[];
  updatedAt: Date;
};

export type DashboardData = {
  notes: Array<FallbackNote | NoteDetail>;
  isConnected: boolean;
  nickname: string;
  tags: string[];
};

const fallbackNotes: FallbackNote[] = [
  {
    id: "seed-1",
    title: "欢迎来到你的知识库",
    summary: "下一步把 Supabase 和 PostgreSQL 连接起来，这里就会展示真实数据。",
    content: "当前还是演示数据。等数据库连接生效后，这里会展示你自己的知识卡片详情。",
    visibility: "PRIVATE",
    noteTags: [{ tag: { name: "入门" } }],
    updatedAt: new Date(),
  },
  {
    id: "seed-2",
    title: "建议先完成的链路",
    summary: "登录、用户同步、Note 列表、Note 新建、部署上线。",
    content: "你现在已经完成登录和新建，下一步就是把编辑、删除和详情页补完整。",
    visibility: "PUBLIC",
    noteTags: [{ tag: { name: "路线" } }],
    updatedAt: new Date(),
  },
];

function filterFallbackNotes(filters: DashboardFilters): FallbackNote[] {
  const query = filters.query?.trim().toLowerCase();
  const tag = filters.tag?.trim();

  return fallbackNotes.filter((note) => {
    const matchesQuery =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.summary.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    const matchesTag = !tag || note.noteTags.some((item) => item.tag.name === tag);

    return matchesQuery && matchesTag;
  });
}

export async function getDashboardData(
  user: AuthUser | null,
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  if (!user) {
    const notes = filterFallbackNotes(filters);

    return {
      notes,
      isConnected: false,
      nickname: "开发者",
      tags: ["入门", "路线"],
    };
  }

  if (!hasDatabaseUrl || !prisma) {
    const notes = filterFallbackNotes(filters);

    return {
      notes,
      isConnected: false,
      nickname: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "开发者",
      tags: ["入门", "路线"],
    };
  }

  const appUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? "",
      nickname:
        user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.user_name ??
        user.email?.split("@")[0] ??
        null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    create: {
      id: user.id,
      email: user.email ?? "",
      nickname:
        user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.user_name ??
        user.email?.split("@")[0] ??
        null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

  const query = filters.query?.trim();
  const tag = filters.tag?.trim();

  const notesResult = await prisma.note.findMany({
    where: {
      userId: user.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag
        ? {
            noteTags: {
              some: {
                tag: {
                  name: tag,
                },
              },
            },
          }
        : {}),
    },
    include: {
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
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 20,
  });

  const notes: DashboardData["notes"] = notesResult.map((note: NoteDetail) => ({
    id: note.id,
    title: note.title,
    summary: note.summary,
    content: note.content,
    visibility: note.visibility,
    updatedAt: note.updatedAt,
    noteTags: note.noteTags.map((item: NoteTagItem) => ({
      tag: {
        name: item.tag.name,
      },
    })),
  }));

  const userTags = await prisma.tag.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return {
    notes,
    isConnected: true,
    nickname: appUser.nickname ?? user.email?.split("@")[0] ?? "开发者",
    tags: userTags.map((item) => item.name),
  };
}

export async function getNoteDetail(noteId: string, userId: string): Promise<NoteDetail> {
  if (!hasDatabaseUrl || !prisma) {
    const fallback = fallbackNotes.find((note) => note.id === noteId);

    if (!fallback) {
      notFound();
    }

    return fallback;
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
    include: {
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

  if (!note) {
    notFound();
  }

  return {
    id: note.id,
    title: note.title,
    summary: note.summary,
    content: note.content,
    visibility: note.visibility,
    updatedAt: note.updatedAt,
    noteTags: note.noteTags.map((item: NoteTagItem) => ({
      tag: {
        name: item.tag.name,
      },
    })),
  };
}
