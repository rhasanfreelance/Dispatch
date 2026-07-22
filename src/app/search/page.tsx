import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
          Loading…
        </p>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
