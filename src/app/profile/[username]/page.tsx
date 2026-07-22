import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/ProfileView";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      tweets: {
        orderBy: { createdAt: "desc" },
        include: {
          likes: session?.user?.id ? { where: { userId: session.user.id } } : false,
          _count: { select: { likes: true } },
        },
      },
      _count: { select: { followers: true, following: true, tweets: true } },
    },
  });

  if (!user) notFound();

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
    createdAt: user.createdAt.toISOString(),
    followerCount: user._count.followers,
    followingCount: user._count.following,
    tweetCount: user._count.tweets,
    isSelf: session?.user?.id === user.id,
    isFollowedByMe,
    tweets: user.tweets.map((t) => ({
      id: t.id,
      content: t.content,
      createdAt: t.createdAt.toISOString(),
      author: { username: user.username, displayName: user.displayName, avatarSeed: user.avatarSeed },
      likeCount: t._count.likes,
      likedByMe: session?.user?.id ? t.likes.length > 0 : false,
    })),
  };

  return <ProfileView user={shaped} />;
}
