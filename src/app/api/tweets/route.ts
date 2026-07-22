import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const scope = req.nextUrl.searchParams.get("scope") ?? "all";

  let authorFilter: { authorId: { in: string[] } } | {} = {};

  if (scope === "following" && session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    const ids = following.map((f) => f.followingId);
    ids.push(session.user.id);
    authorFilter = { authorId: { in: ids } };
  }

  const tweets = await prisma.tweet.findMany({
    where: authorFilter,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      _count: { select: { likes: true } },
    },
  });

  const shaped = tweets.map((t) => ({
    id: t.id,
    content: t.content,
    createdAt: t.createdAt,
    author: t.author,
    likeCount: t._count.likes,
    likedByMe: session?.user?.id ? t.likes.length > 0 : false,
  }));

  return NextResponse.json({ tweets: shaped });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to post." }, { status: 401 });
  }

  const body = await req.json();
  const content = String(body?.content ?? "").trim();

  if (!content) {
    return NextResponse.json({ error: "A dispatch can't be empty." }, { status: 400 });
  }

  if (content.length > 280) {
    return NextResponse.json({ error: "Dispatches are capped at 280 characters." }, { status: 400 });
  }

  const tweet = await prisma.tweet.create({
    data: { content, authorId: session.user.id },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
    },
  });

  return NextResponse.json(
    {
      tweet: {
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        author: tweet.author,
        likeCount: 0,
        likedByMe: false,
      },
    },
    { status: 201 }
  );
}
