import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { tweetId: params.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.author,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to reply." }, { status: 401 });
  }

  const tweet = await prisma.tweet.findUnique({ where: { id: params.id } });
  if (!tweet) {
    return NextResponse.json({ error: "Dispatch not found." }, { status: 404 });
  }

  const body = await req.json();
  const content = String(body?.content ?? "").trim();

  if (!content) {
    return NextResponse.json({ error: "A reply can't be empty." }, { status: 400 });
  }

  if (content.length > 280) {
    return NextResponse.json({ error: "Replies are capped at 280 characters." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { content, authorId: session.user.id, tweetId: params.id },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
    },
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
      },
    },
    { status: 201 }
  );
}
