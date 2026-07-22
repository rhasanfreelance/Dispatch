import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarSeed: true,
      _count: { select: { followers: true } },
    },
  });

  let followedIds = new Set<string>();
  if (session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    followedIds = new Set(following.map((f) => f.followingId));
  }

  return NextResponse.json({
    users: users.map((u) => ({
      username: u.username,
      displayName: u.displayName,
      bio: u.bio,
      avatarSeed: u.avatarSeed,
      followerCount: u._count.followers,
      isFollowedByMe: followedIds.has(u.id),
      isSelf: session?.user?.id === u.id,
    })),
  });
}
