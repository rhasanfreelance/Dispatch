import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TweetDetailView from "@/components/TweetDetailView";

export default async function TweetDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const tweet = await prisma.tweet.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
      likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!tweet) notFound();

  const comments = await prisma.comment.findMany({
    where: { tweetId: params.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true, displayName: true, avatarSeed: true } },
    },
  });

  const shapedTweet = {
    id: tweet.id,
    content: tweet.content,
    createdAt: tweet.createdAt.toISOString(),
    author: tweet.author,
    likeCount: tweet._count.likes,
    commentCount: tweet._count.comments,
    likedByMe: session?.user?.id ? tweet.likes.length > 0 : false,
  };

  const shapedComments = comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    author: c.author,
  }));

  return <TweetDetailView tweet={shapedTweet} initialComments={shapedComments} />;
}
