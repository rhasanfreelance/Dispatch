import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      tweets: {
        orderBy: { createdAt: "desc" },
        include: {
          likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: { select: { followers: true, following: true, tweets: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "This account doesn't exist." }, { status: 404 });
  }

  let isFollowedByMe = false;
  if (session?.user?.id && session.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
    });
    isFollowedByMe = !!follow;
  }

  const shaped = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarSeed: user.avatarSeed,
    createdAt: user.createdAt,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    tweetCount: user._count.tweets,
    isSelf: session?.user?.id === user.id,
    isFollowedByMe,
    tweets: user.tweets.map((t) => ({
      id: t.id,
      content: t.content,
      createdAt: t.createdAt,
      author: { username: user.username, displayName: user.displayName, avatarSeed: user.avatarSeed },
      likeCount: t._count.likes,
      commentCount: t._count.comments,
      likedByMe: session?.user?.id ? t.likes.length > 0 : false,
    })),
  };

  return NextResponse.json({ user: shaped });
}

export async function PATCH(req: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const target = await prisma.user.findUnique({ where: { username: params.username.toLowerCase() } });
  if (!target) {
    return NextResponse.json({ error: "This account doesn't exist." }, { status: 404 });
  }

  if (target.id !== session.user.id) {
    return NextResponse.json({ error: "You can only edit your own profile." }, { status: 403 });
  }

  const body = await req.json();
  const displayName = String(body?.displayName ?? "").trim();
  const bio = String(body?.bio ?? "").trim();

  if (!displayName) {
    return NextResponse.json({ error: "Display name can't be empty." }, { status: 400 });
  }

  if (displayName.length > 50) {
    return NextResponse.json({ error: "Display name is capped at 50 characters." }, { status: 400 });
  }

  if (bio.length > 160) {
    return NextResponse.json({ error: "Bio is capped at 160 characters." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName, bio },
    select: { username: true, displayName: true, bio: true },
  });

  return NextResponse.json({ user: updated });
}
