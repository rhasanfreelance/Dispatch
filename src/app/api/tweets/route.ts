import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankTweets } from "@/lib/ranking";

const FOR_YOU_POOL_SIZE = 300;
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const scope = req.nextUrl.searchParams.get("scope") ?? "foryou";

  if (scope === "following") {
    let authorFilter: { authorId: { in: string[] } } | {} = {};

    if (session?.user?.id) {
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
      take: PAGE_SIZE,
      include: {
        author: { select: { username: true, displayName: true, avatarSeed: true } },
        likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ tweets: tweets.map((t) => shapeTweet(t, session?.user?.id)) });
  }

  const pool = await prisma.tweet.findMany({
    orderBy: { createdAt: "desc" },
    take: FOR_YOU_POOL_SIZE,
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      _count: { select: { likes: true, comments: true } },
    },
  });

  let followingIds = new Set<string>();
  if (session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    followingIds = new Set(following.map((f) => f.followingId));
  }

  const ranked = rankTweets(
    pool.map((t) => ({
      ...t,
      likeCount: t._count.likes,
      commentCount: t._count.comments,
    })),
    { followingIds }
  ).slice(0, PAGE_SIZE);

  return NextResponse.json({ tweets: ranked.map((t) => shapeTweet(t, session?.user?.id)) });
}

function shapeTweet(
  t: {
    id: string;
    content: string;
    createdAt: Date;
    author: { username: string; displayName: string; avatarSeed: string };
    likes?: { userId: string }[] | false;
    _count: { likes: number; comments: number };
  },
  viewerId?: string
) {
  return {
    id: t.id,
    content: t.content,
    createdAt: t.createdAt,
    author: t.author,
    likeCount: t._count.likes,
    commentCount: t._count.comments,
    likedByMe: viewerId ? Array.isArray(t.likes) && t.likes.length > 0 : false,
  };
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
        commentCount: 0,
        likedByMe: false,
      },
    },
    { status: 201 }
  );
}
