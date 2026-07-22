"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BIO_MAX = 160;
const NAME_MAX = 50;

export default function EditProfileForm({
  initialDisplayName,
  initialBio,
  username,
}: {
  initialDisplayName: string;
  initialBio: string;
  username: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/users/${username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't update your profile.");
      return;
    }

    router.push(`/profile/${username}`);
    router.refresh();
  }

  return (
    <div className="px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Edit profile</h1>
      <p className="mt-1 text-sm text-muted">This is what other people on Dispatch will see.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.slice(0, NAME_MAX))}
            className="field-input"
            required
          />
          <p className="mt-1 text-right font-mono text-xs text-muted">
            {NAME_MAX - displayName.length}
          </p>
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={3}
            className="field-input resize-none"
          />
          <p className="mt-1 text-right font-mono text-xs text-muted">{BIO_MAX - bio.length}</p>
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={busy || !displayName.trim()} className="btn-primary">
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
