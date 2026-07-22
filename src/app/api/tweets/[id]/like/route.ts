import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to like a dispatch." }, { status: 401 });
  }

  const tweet = await prisma.tweet.findUnique({ where: { id: params.id } });
  if (!tweet) {
    return NextResponse.json({ error: "Dispatch not found." }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_tweetId: { userId: session.user.id, tweetId: params.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: session.user.id, tweetId: params.id } });
  }

  const likeCount = await prisma.like.count({ where: { tweetId: params.id } });

  return NextResponse.json({ likedByMe: !existing, likeCount });
}
