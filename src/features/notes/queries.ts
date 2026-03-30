import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/env";
import { syncAppUser, type AuthUser } from "@/features/auth/sync-user";

type DashboardFilters = {
  query?: string;
  tag?: string;
  sort?: string;
  page?: number;
};

type PublicNotesFilters = {
  sort?: string;
  page?: number;
};

type NormalizedSort = "latest" | "oldest";

type BaseNoteShape = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  isFavorited: boolean;
  isPinned: boolean;
  viewCount: number;
  noteTags: NoteTagItem[];
  updatedAt: Date;
};

export type NoteTagItem = {
  tag: {
    name: string;
  };
};

export type FallbackNote = BaseNoteShape & {
  summary: string;
};

export type NoteDetail = BaseNoteShape;

export type PublicNoteDetail = NoteDetail & {
  authorName: string;
};

export type PublicNoteSummary = {
  id: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  updatedAt: Date;
  authorName: string;
  viewCount: number;
  noteTags: NoteTagItem[];
};

export type DashboardData = {
  notes: Array<FallbackNote | NoteDetail>;
  isConnected: boolean;
  nickname: string;
  tags: string[];
  totalCount: number;
  totalPages: number;
  page: number;
  sort: NormalizedSort;
};

export type PublicNotesPageData = {
  notes: PublicNoteSummary[];
  totalCount: number;
  totalPages: number;
  page: number;
  sort: NormalizedSort;
};

const DASHBOARD_PAGE_SIZE = 8;
const PUBLIC_PAGE_SIZE = 6;

const fallbackNotes: FallbackNote[] = [
  {
    id: "seed-1",
    title: "Welcome to your knowledge base",
    summary: "Connect Supabase and PostgreSQL to start showing real notes here.",
    content:
      "This is demo data for now. Once the database connection is ready, your real knowledge cards will appear here.",
    coverImageUrl: null,
    visibility: "PRIVATE",
    isFavorited: false,
    isPinned: false,
    viewCount: 12,
    noteTags: [{ tag: { name: "intro" } }],
    updatedAt: new Date(),
  },
  {
    id: "seed-2",
    title: "Suggested next milestones",
    summary: "Authentication, user sync, note list, note creation, and deployment.",
    content:
      "You already connected login and note creation. The next step is to keep polishing detail, edit, and delete flows.",
    coverImageUrl: null,
    visibility: "PUBLIC",
    isFavorited: true,
    isPinned: true,
    viewCount: 28,
    noteTags: [{ tag: { name: "roadmap" } }],
    updatedAt: new Date(),
  },
];

function collectTagsFromNotes(notes: Array<FallbackNote | NoteDetail>) {
  return [...new Set(notes.flatMap((note) => note.noteTags.map((item) => item.tag.name)))].sort(
    (left, right) => left.localeCompare(right, "zh-CN"),
  );
}

function normalizePage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function normalizeSort(sort?: string): NormalizedSort {
  return sort === "oldest" ? "oldest" : "latest";
}

function createPagination(totalCount: number, pageSize: number, rawPage?: number) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(normalizePage(rawPage), totalPages);
  const skip = (page - 1) * pageSize;

  return { totalPages, page, skip };
}

function mapTags(noteTags: Array<{ tag: { name: string } }>): NoteTagItem[] {
  return noteTags.map((item) => ({
    tag: {
      name: item.tag.name,
    },
  }));
}

function mapNoteDetail(note: {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  isFavorited: boolean;
  isPinned: boolean;
  viewCount: number;
  updatedAt: Date;
  noteTags: Array<{ tag: { name: string } }>;
}): NoteDetail {
  return {
    id: note.id,
    title: note.title,
    summary: note.summary,
    content: note.content,
    coverImageUrl: note.coverImageUrl,
    visibility: note.visibility,
    isFavorited: note.isFavorited,
    isPinned: note.isPinned,
    viewCount: note.viewCount,
    updatedAt: note.updatedAt,
    noteTags: mapTags(note.noteTags),
  };
}

function mapPublicNoteSummary(note: {
  id: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  updatedAt: Date;
  viewCount: number;
  noteTags: Array<{ tag: { name: string } }>;
  user?: {
    nickname: string | null;
    email: string;
  };
}): PublicNoteSummary {
  return {
    id: note.id,
    title: note.title,
    summary: note.summary,
    coverImageUrl: note.coverImageUrl,
    updatedAt: note.updatedAt,
    authorName: note.user?.nickname ?? note.user?.email?.split("@")[0] ?? "My Knowledge",
    viewCount: note.viewCount,
    noteTags: mapTags(note.noteTags),
  };
}

function mapPublicNoteDetail(note: {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  isFavorited: boolean;
  isPinned: boolean;
  viewCount: number;
  updatedAt: Date;
  noteTags: Array<{ tag: { name: string } }>;
  user?: {
    nickname: string | null;
    email: string;
  };
}): PublicNoteDetail {
  return {
    ...mapNoteDetail(note),
    authorName: note.user?.nickname ?? note.user?.email?.split("@")[0] ?? "My Knowledge",
  };
}

function filterFallbackNotes(filters: DashboardFilters): FallbackNote[] {
  const query = filters.query?.trim().toLowerCase();
  const tag = filters.tag?.trim();
  const sort = normalizeSort(filters.sort);

  const filtered = fallbackNotes.filter((note) => {
    const matchesQuery =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.summary.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    const matchesTag = !tag || note.noteTags.some((item) => item.tag.name === tag);

    return matchesQuery && matchesTag;
  });

  return filtered.sort((left, right) =>
    sort === "oldest"
      ? left.updatedAt.getTime() - right.updatedAt.getTime()
      : right.updatedAt.getTime() - left.updatedAt.getTime(),
  );
}

function getFallbackDashboardData(user: AuthUser | null, filters: DashboardFilters): DashboardData {
  const filteredNotes = filterFallbackNotes(filters);
  const { page, totalPages, skip } = createPagination(
    filteredNotes.length,
    DASHBOARD_PAGE_SIZE,
    filters.page,
  );
  const sort = normalizeSort(filters.sort);

  return {
    notes: filteredNotes.slice(skip, skip + DASHBOARD_PAGE_SIZE),
    isConnected: false,
    nickname: user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "Developer",
    tags: collectTagsFromNotes(filteredNotes),
    totalCount: filteredNotes.length,
    totalPages,
    page,
    sort,
  };
}

function getFallbackPublicNotes(filters: PublicNotesFilters): PublicNotesPageData {
  const sort = normalizeSort(filters.sort);
  const notes = fallbackNotes
    .filter((note) => note.visibility === "PUBLIC")
    .sort((left, right) =>
      sort === "oldest"
        ? left.updatedAt.getTime() - right.updatedAt.getTime()
        : right.updatedAt.getTime() - left.updatedAt.getTime(),
    )
    .map((note) => mapPublicNoteSummary(note));
  const { totalPages, page, skip } = createPagination(notes.length, PUBLIC_PAGE_SIZE, filters.page);

  return {
    notes: notes.slice(skip, skip + PUBLIC_PAGE_SIZE),
    totalCount: notes.length,
    totalPages,
    page,
    sort,
  };
}

function getFallbackPublicNoteDetail(noteId: string): PublicNoteDetail {
  const fallback = fallbackNotes.find((note) => note.id === noteId && note.visibility === "PUBLIC");

  if (!fallback) {
    notFound();
  }

  return mapPublicNoteDetail(fallback);
}

export async function getDashboardData(
  user: AuthUser | null,
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  if (!user) {
    return getFallbackDashboardData(null, filters);
  }

  if (!hasDatabaseUrl || !prisma) {
    return getFallbackDashboardData(user, filters);
  }

  try {
    const appUser = await syncAppUser(user);
    const query = filters.query?.trim();
    const tag = filters.tag?.trim();
    const sort = normalizeSort(filters.sort);

    const where = {
      userId: appUser.id,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { summary: { contains: query, mode: "insensitive" as const } },
              { content: { contains: query, mode: "insensitive" as const } },
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
    };

    const totalCount = await prisma.note.count({ where });
    const { totalPages, page, skip } = createPagination(
      totalCount,
      DASHBOARD_PAGE_SIZE,
      filters.page,
    );

    const notesResult = await prisma.note.findMany({
      where,
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
      orderBy: [{ isPinned: "desc" }, { updatedAt: sort === "oldest" ? "asc" : "desc" }],
      skip,
      take: DASHBOARD_PAGE_SIZE,
    });

    const tagSource = await prisma.note.findMany({
      where,
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
      take: 100,
    });

    return {
      notes: notesResult.map((note) => mapNoteDetail(note)),
      isConnected: true,
      nickname: appUser.nickname ?? user.email?.split("@")[0] ?? "Developer",
      tags: collectTagsFromNotes(tagSource.map((note) => mapNoteDetail(note))),
      totalCount,
      totalPages,
      page,
      sort,
    };
  } catch (error) {
    console.error("Dashboard data query failed", error);
    return getFallbackDashboardData(user, filters);
  }
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

  return mapNoteDetail(note);
}

export async function getPublicNoteDetail(noteId: string): Promise<PublicNoteDetail> {
  if (!hasDatabaseUrl || !prisma) {
    return getFallbackPublicNoteDetail(noteId);
  }

  const db = prisma;

  try {
    const note = await db.note
      .update({
        where: { id: noteId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        include: {
          user: {
            select: {
              nickname: true,
              email: true,
            },
          },
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
      })
      .catch(async () => {
        return db.note.findFirst({
          where: {
            id: noteId,
            visibility: "PUBLIC",
          },
          include: {
            user: {
              select: {
                nickname: true,
                email: true,
              },
            },
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
      });

    if (!note || note.visibility !== "PUBLIC") {
      notFound();
    }

    return mapPublicNoteDetail(note);
  } catch (error) {
    console.error("Public note detail query failed", error);
    return getFallbackPublicNoteDetail(noteId);
  }
}

export async function getPublicNotes(
  filters: PublicNotesFilters = {},
): Promise<PublicNotesPageData> {
  if (!hasDatabaseUrl || !prisma) {
    return getFallbackPublicNotes(filters);
  }

  const sort = normalizeSort(filters.sort);

  try {
    const totalCount = await prisma.note.count({
      where: {
        visibility: "PUBLIC",
      },
    });
    const { totalPages, page, skip } = createPagination(totalCount, PUBLIC_PAGE_SIZE, filters.page);

    const notes = await prisma.note.findMany({
      where: {
        visibility: "PUBLIC",
      },
      include: {
        user: {
          select: {
            nickname: true,
            email: true,
          },
        },
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
      orderBy: [{ isPinned: "desc" }, { updatedAt: sort === "oldest" ? "asc" : "desc" }],
      skip,
      take: PUBLIC_PAGE_SIZE,
    });

    return {
      notes: notes.map((note) => mapPublicNoteSummary(note)),
      totalCount,
      totalPages,
      page,
      sort,
    };
  } catch (error) {
    console.error("Public notes query failed", error);
    return getFallbackPublicNotes(filters);
  }
}
