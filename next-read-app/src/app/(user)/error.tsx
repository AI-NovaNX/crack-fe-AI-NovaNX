"use client";

import { AppNav } from "@/components/layout/app-nav";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />
      <div role="alert" className="flex flex-1 items-center py-12">
        <CatalogUnavailable title="Konten belum dapat dimuat" onRetry={reset} />
      </div>
    </main>
  );
}
