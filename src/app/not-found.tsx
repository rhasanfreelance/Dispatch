import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">This dispatch never ran.</h1>
      <p className="mt-2 text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Back to the wire
      </Link>
    </div>
  );
}
