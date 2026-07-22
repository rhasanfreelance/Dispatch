"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Couldn't create your account.");
      setBusy(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      identifier: username,
      password,
      redirect: false,
    });

    setBusy(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Join Dispatch</h1>
      <p className="mt-1 text-sm text-muted">Send your first dispatch in under a minute.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-input"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="field-input"
            placeholder="lowercase, no spaces"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary mt-2">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already on Dispatch?{" "}
        <Link href="/login" className="font-semibold text-wire hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
