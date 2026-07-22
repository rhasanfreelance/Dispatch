import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to follow accounts." }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { username: params.username.toLowerCase() } });
  if (!target) {
    return NextResponse.json({ error: "This account doesn't exist." }, { status: 404 });
  }

  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: session.user.id, followingId: target.id } });
  }

  const followerCount = await prisma.follow.count({ where: { followingId: target.id } });

  return NextResponse.json({ isFollowedByMe: !existing, followerCount });
}
