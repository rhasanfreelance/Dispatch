"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Avatar from "./Avatar";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between border-x border-line px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">
            Dispatch
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">
            the wire
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="font-mono text-sm text-muted hover:text-wire"
          >
            Search
          </Link>

          {status === "authenticated" && session?.user ? (
            <>
              <Link
                href={`/profile/${session.user.username}`}
                className="flex items-center gap-2 text-sm font-medium text-ink hover:text-wire"
              >
                <Avatar seed={session.user.username} size={28} />
                <span className="hidden sm:inline">
                  @{session.user.username}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="font-mono text-xs uppercase tracking-widest text-muted hover:text-signal"
              >
                Sign out
              </button>
            </>
          ) : status === "loading" ? (
            <div className="h-8 w-20" />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-ink hover:text-wire"
              >
                Sign in
              </Link>
              <Link href="/register" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
