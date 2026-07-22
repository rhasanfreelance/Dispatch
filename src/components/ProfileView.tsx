"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import TweetCard, { TweetData } from "./TweetCard";

export type ProfileData = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  isSelf: boolean;
  isFollowedByMe: boolean;
  tweets: TweetData[];
};

export default function ProfileView({ user }: { user: ProfileData }) {
  const [followerCount, setFollowerCount] = useState(user.followerCount);
  const [tweets, setTweets] = useState(user.tweets);

  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function handleDeleted(id: string) {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="border-b border-line px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar seed={user.avatarSeed} size={64} />
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">{user.displayName}</h1>
              <p className="text-sm text-muted">@{user.username}</p>
            </div>
          </div>

          {!user.isSelf && (
            <FollowButton
              username={user.username}
              initialFollowed={user.isFollowedByMe}
              onChange={(_followed, count) => setFollowerCount(count)}
            />
          )}
        </div>

        {user.bio && <p className="mt-4 text-[15px] text-ink">{user.bio}</p>}

        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">Joined {joined}</p>

        <div className="mt-4 flex gap-5 font-mono text-xs">
          <span className="text-ink">
            <strong className="tabular-nums">{user.followingCount}</strong>{" "}
            <span className="text-muted">Following</span>
          </span>
          <span className="text-ink">
            <strong className="tabular-nums">{followerCount}</strong>{" "}
            <span className="text-muted">Followers</span>
          </span>
          <span className="text-ink">
            <strong className="tabular-nums">{user.tweetCount}</strong>{" "}
            <span className="text-muted">Dispatches</span>
          </span>
        </div>
      </div>

      {tweets.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-display text-lg text-ink">No dispatches yet.</p>
        </div>
      ) : (
        tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}
