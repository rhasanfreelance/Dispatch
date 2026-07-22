"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import type { TweetData } from "./TweetCard";

const MAX_LEN = 280;

export default function TweetComposer({ onPosted }: { onPosted: (tweet: TweetData) => void }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user) return null;

  const remaining = MAX_LEN - content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || busy || remaining < 0) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Couldn't send that dispatch.");
        return;
      }

      onPosted(data.tweet);
      setContent("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 border-b border-line px-4 py-4">
      <Avatar seed={session.user.username} size={40} />

      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's the news?"
          rows={3}
          className="w-full resize-none border-none bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />

        {error && <p className="mt-1 text-sm text-signal">{error}</p>}

        <div className="mt-2 flex items-center justify-between">
          <span
            className={`font-mono text-xs tabular-nums ${
              remaining < 0 ? "text-signal" : remaining < 20 ? "text-signal/70" : "text-muted"
            }`}
          >
            {remaining}
          </span>
          <button type="submit" disabled={!content.trim() || busy || remaining < 0} className="btn-primary">
            {busy ? "Sending…" : "Dispatch"}
          </button>
        </div>
      </div>
    </form>
  );
}
