"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TweetCard, { TweetData } from "./TweetCard";
import CommentComposer from "./CommentComposer";
import CommentCard, { CommentData } from "./CommentCard";

export default function TweetDetailView({
  tweet,
  initialComments,
}: {
  tweet: TweetData;
  initialComments: CommentData[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [removed, setRemoved] = useState(false);

  function handlePosted(comment: CommentData) {
    setComments((prev) => [...prev, comment]);
  }

  function handleCommentDeleted(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  function handleTweetDeleted() {
    setRemoved(true);
    router.push("/");
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link href="/" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Back
        </Link>
        <h1 className="font-display text-lg font-semibold text-ink">Dispatch</h1>
      </div>

      {!removed && <TweetCard tweet={tweet} linkToDetail={false} onDeleted={handleTweetDeleted} />}

      <CommentComposer tweetId={tweet.id} onPosted={handlePosted} />

      {comments.length === 0 ? (
        <p className="px-4 py-10 text-center font-mono text-xs uppercase tracking-widest text-muted">
          No replies yet.
        </p>
      ) : (
        comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} onDeleted={handleCommentDeleted} />
        ))
      )}
    </div>
  );
}
