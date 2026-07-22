"use client";

import { useState } from "react";

export default function FollowButton({
  username,
  initialFollowed,
  onChange,
}: {
  username: string;
  initialFollowed: boolean;
  onChange?: (followed: boolean, followerCount: number) => void;
}) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const prev = followed;
    setFollowed(!prev);

    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFollowed(data.isFollowedByMe);
      onChange?.(data.isFollowedByMe, data.followerCount);
    } catch {
      setFollowed(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy} className={followed ? "btn-secondary" : "btn-primary"}>
      {followed ? "Following" : "Follow"}
    </button>
  );
}
