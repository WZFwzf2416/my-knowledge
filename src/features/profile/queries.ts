import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/env";
import { requireAppUser } from "@/features/auth/server";

export type ProfilePageData = {
  email: string;
  nickname: string;
  bio: string;
  avatarUrl: string;
  stats: Array<{ label: string; value: string }>;
};

export async function getProfilePageData(): Promise<ProfilePageData> {
  const { authUser, appUser } = await requireAppUser("请先登录后再查看个人资料。");

  if (!hasDatabaseUrl || !prisma) {
    return {
      email: authUser.email ?? "",
      nickname: appUser.nickname ?? "",
      bio: appUser.bio ?? "",
      avatarUrl: appUser.avatarUrl ?? "",
      stats: [
        { label: "全部卡片", value: "0" },
        { label: "公开内容", value: "0" },
        { label: "标签数量", value: "0" },
      ],
    };
  }

  const [noteCount, publicCount, tagCount] = await Promise.all([
    prisma.note.count({ where: { userId: appUser.id } }),
    prisma.note.count({ where: { userId: appUser.id, visibility: "PUBLIC" } }),
    prisma.tag.count({ where: { userId: appUser.id } }),
  ]);

  return {
    email: authUser.email ?? appUser.email,
    nickname: appUser.nickname ?? "",
    bio: appUser.bio ?? "",
    avatarUrl: appUser.avatarUrl ?? "",
    stats: [
      { label: "全部卡片", value: String(noteCount) },
      { label: "公开内容", value: String(publicCount) },
      { label: "标签数量", value: String(tagCount) },
    ],
  };
}
