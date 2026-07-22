"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import { formatDispatchTime } from "@/lib/time";

export type TweetData = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; displayName: string; avatarSeed: string };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

export default function TweetCard({
  tweet,
  onDeleted,
  linkToDetail = true,
}: {
  tweet: TweetData;
  onDeleted?: (id: string) => void;
  linkToDetail?: boolean;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(tweet.likedByMe);
  const [likeCount, setLikeCount] = useState(tweet.likeCount);
  const [busy, setBusy] = useState(false);
  const [removed, setRemoved] = useState(false);

  const isOwner = session?.user?.username === tweet.author.username;

  async function toggleLike() {
    if (!session?.user || busy) return;
    setBusy(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/tweets/${tweet.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.likedByMe);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tweets/${tweet.id}`, { method: "DELETE" });
      if (res.ok) {
        setRemoved(true);
        onDeleted?.(tweet.id);
      }
    } finally {
      setBusy(false);
    }
  }

  if (removed) return null;

  return (
    <article className="flex gap-3 border-b border-line px-4 py-4">
      <Link href={`/profile/${tweet.author.username}`} className="shrink-0">
        <Avatar seed={tweet.author.avatarSeed} size={40} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 text-sm">
          <Link href={`/profile/${tweet.author.username}`} className="font-semibold text-ink hover:underline">
            {tweet.author.displayName}
          </Link>
          <span className="text-muted">@{tweet.author.username}</span>
          <span className="text-muted">·</span>
          <span className="font-mono text-xs uppercase tracking-wide text-muted">
            {formatDispatchTime(tweet.createdAt)}
          </span>
        </div>

        {linkToDetail ? (
          <Link href={`/tweet/${tweet.id}`}>
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug text-ink">
              {tweet.content}
            </p>
          </Link>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug text-ink">
            {tweet.content}
          </p>
        )}

        <div className="mt-3 flex items-center gap-5">
          {linkToDetail ? (
            <Link
              href={`/tweet/${tweet.id}`}
              className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted transition-colors hover:text-wire"
            >
              <span>💬</span>
              <span>{tweet.commentCount}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-muted">
              <span>💬</span>
              <span>{tweet.commentCount}</span>
            </span>
          )}

          <button
            onClick={toggleLike}
            disabled={!session?.user || busy}
            className={`flex items-center gap-1.5 font-mono text-xs tabular-nums transition-colors disabled:cursor-not-allowed ${
              liked ? "text-signal" : "text-muted hover:text-signal"
            }`}
          >
            <span>{liked ? "♥" : "♡"}</span>
            <span>{likeCount}</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={busy}
              className="font-mono text-xs uppercase tracking-widest text-muted hover:text-signal"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
