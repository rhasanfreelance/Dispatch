"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserResultRow, { UserResult } from "./UserResultRow";

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setQuery(q);

    if (!q) {
      setUsers([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUsers(data.users ?? []);
          setSearched(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <div className="border-b border-line px-4 py-4">
        <h1 className="mb-3 font-display text-xl font-semibold text-ink">Search</h1>
        <form onSubmit={handleSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people by name or username"
            className="field-input"
          />
        </form>
      </div>

      {loading ? (
        <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
          Searching…
        </p>
      ) : searched && users.length === 0 ? (
        <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
          No accounts found.
        </p>
      ) : (
        users.map((user) => <UserResultRow key={user.username} user={user} />)
      )}
    </div>
  );
}
