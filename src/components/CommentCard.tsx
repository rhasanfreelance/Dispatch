"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import { formatDispatchTime } from "@/lib/time";

export type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  author: { username: string; displayName: string; avatarSeed: string };
};

export default function CommentCard({
  comment,
  onDeleted,
}: {
  comment: CommentData;
  onDeleted?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);
  const [removed, setRemoved] = useState(false);

  const isOwner = session?.user?.username === comment.author.username;

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      if (res.ok) {
        setRemoved(true);
        onDeleted?.(comment.id);
      }
    } finally {
      setBusy(false);
    }
  }

  if (removed) return null;

  return (
    <article className="flex gap-3 border-b border-line px-4 py-3">
      <Link href={`/profile/${comment.author.username}`} className="shrink-0">
        <Avatar seed={comment.author.avatarSeed} size={32} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 text-sm">
          <Link href={`/profile/${comment.author.username}`} className="font-semibold text-ink hover:underline">
            {comment.author.displayName}
          </Link>
          <span className="text-muted">@{comment.author.username}</span>
          <span className="text-muted">·</span>
          <span className="font-mono text-xs uppercase tracking-wide text-muted">
            {formatDispatchTime(comment.createdAt)}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-snug text-ink">
          {comment.content}
        </p>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={busy}
            className="mt-1 font-mono text-xs uppercase tracking-widest text-muted hover:text-signal"
          >
            Remove
          </button>
        )}
      </div>
    </article>
  );
}
