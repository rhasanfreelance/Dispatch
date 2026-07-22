import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const tweet = await prisma.tweet.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!tweet) {
    return NextResponse.json({ error: "Dispatch not found." }, { status: 404 });
  }

  return NextResponse.json({
    tweet: {
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.createdAt,
      author: tweet.author,
      likeCount: tweet._count.likes,
      commentCount: tweet._count.comments,
      likedByMe: session?.user?.id ? tweet.likes.length > 0 : false,
    },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const tweet = await prisma.tweet.findUnique({ where: { id: params.id } });
  if (!tweet) {
    return NextResponse.json({ error: "Dispatch not found." }, { status: 404 });
  }

  if (tweet.authorId !== session.user.id) {
    return NextResponse.json({ error: "You can only delete your own dispatches." }, { status: 403 });
  }

  await prisma.tweet.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
