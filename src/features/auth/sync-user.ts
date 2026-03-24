import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    name?: string;
    full_name?: string;
    user_name?: string;
    avatar_url?: string;
  };
};

function getProfileData(user: AuthUser) {
  return {
    email: user.email ?? "",
    nickname:
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.user_name ??
      user.email?.split("@")[0] ??
      null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}

export async function syncAppUser(user: AuthUser) {
  if (!prisma) {
    throw new Error("Prisma client is not available.");
  }

  const profile = getProfileData(user);

  const existingById = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (existingById) {
    return prisma.user.update({
      where: { id: existingById.id },
      data: profile,
    });
  }

  if (profile.email) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
        },
      });
    }
  }

  return prisma.user.create({
    data: {
      id: user.id,
      ...profile,
    },
  });
}