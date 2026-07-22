"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

export type UserResult = {
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
  followerCount: number;
  isFollowedByMe: boolean;
  isSelf: boolean;
};

export default function UserResultRow({ user }: { user: UserResult }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
      <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 gap-3">
        <Avatar seed={user.avatarSeed} size={44} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{user.displayName}</p>
          <p className="text-sm text-muted">@{user.username}</p>
          {user.bio && <p className="mt-1 truncate text-sm text-ink">{user.bio}</p>}
          <p className="mt-1 font-mono text-xs text-muted">{user.followerCount} followers</p>
        </div>
      </Link>

      {!user.isSelf && <FollowButton username={user.username} initialFollowed={user.isFollowedByMe} />}
    </div>
  );
}
