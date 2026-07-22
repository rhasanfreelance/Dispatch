"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TweetComposer from "./TweetComposer";
import TweetCard, { TweetData } from "./TweetCard";

export default function Feed() {
  const { data: session, status } = useSession();
  const [scope, setScope] = useState<"all" | "following">("all");
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/tweets?scope=${scope}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setTweets(data.tweets ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [scope]);

  function handlePosted(tweet: TweetData) {
    setTweets((prev) => [tweet, ...prev]);
  }

  function handleDeleted(id: string) {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="flex border-b border-line">
        <button
          onClick={() => setScope("all")}
          className={`flex-1 py-3 text-center font-mono text-xs uppercase tracking-widest transition-colors ${
            scope === "all" ? "border-b-2 border-wire text-ink" : "text-muted hover:text-ink"
          }`}
        >
          Everyone
        </button>
        {status === "authenticated" && (
          <button
            onClick={() => setScope("following")}
            className={`flex-1 py-3 text-center font-mono text-xs uppercase tracking-widest transition-colors ${
              scope === "following" ? "border-b-2 border-wire text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Following
          </button>
        )}
      </div>

      {status === "authenticated" && <TweetComposer onPosted={handlePosted} />}

      {loading ? (
        <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
          Loading dispatches…
        </p>
      ) : tweets.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-display text-lg text-ink">
            {scope === "following" ? "Nothing from your follows yet." : "No dispatches yet."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {scope === "following"
              ? "Follow a few people to fill this wire."
              : "Be the first to send one."}
          </p>
        </div>
      ) : (
        tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}
