"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setBusy(false);

    if (res?.error) {
      setError("That email/username or password doesn't match.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Sign in to Dispatch</h1>
      <p className="mt-1 text-sm text-muted">Catch up on the wire.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted">
            Email or username
          </label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
            required
          />
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary mt-2">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-wire hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
