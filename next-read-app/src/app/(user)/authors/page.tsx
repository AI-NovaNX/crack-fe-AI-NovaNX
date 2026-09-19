import Image from "next/image";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { FavoriteAuthorButton } from "@/components/shared/favorite-author-button";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/error-message";
import { getAuthors } from "@/services/authors";

type AuthorsPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function formatBorrowCount(count: number) {
  if (count < 1000) return count.toString();
  const compactCount = count / 1000;
  return `${Number.isInteger(compactCount) ? compactCount : compactCount.toFixed(1)}K`;
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("page", String(page));
  return `/authors?${params}`;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const parsedPage = Number(params.page);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let authors;
  try {
    authors = await getAuthors({ q: query || undefined, page, limit: 12 });
  } catch (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1160px] px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
        <AppNav />
        <div className="pt-10">
          <CatalogUnavailable
            title="Author list could not be loaded"
            message={getApiErrorMessage(error)}
          />
        </div>
      </main>
    );
  }

  const totalPages = Math.max(1, authors.meta.totalPages);
  const currentPage = Math.min(page, totalPages);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />

      <section className="pt-10">
        <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
          Discover / Authors
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Explore Authors
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-palette-slate-400">
              Find your next favorite writer and explore every book in their
              collection.
            </p>
          </div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 font-mono text-[9px] font-semibold tracking-[0.16em] text-palette-cyan-300 uppercase">
            {authors.meta.total.toLocaleString("en-US")} authors
          </span>
        </div>

        <form
          action="/authors"
          method="get"
          className="mt-7 flex max-w-2xl gap-2"
        >
          <Input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search author name..."
            aria-label="Search authors"
            className="h-11 rounded-full border-palette-indigo-300-20 bg-gray-200 px-5 text-palette-slate-50 placeholder:text-palette-slate-400"
          />
          <Button
            type="submit"
            className="h-11 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 font-bold text-white hover:opacity-90"
          >
            Search
          </Button>
        </form>
      </section>

      {authors.data.length ? (
        <section
          aria-label="Author list"
          className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {authors.data.map((author) => (
            <Card
              key={author.id}
              className="rounded-[28px] border-palette-indigo-300-20 bg-gray-200 p-0 py-0 text-palette-slate-50 shadow-none ring-0 transition-colors hover:border-palette-cyan-300/70"
            >
              <CardContent className="relative p-5">
                <Link
                  href={`/authors/${author.id}`}
                  className="flex items-center gap-4 pr-10"
                >
                  <Image
                    src={author.avatar}
                    alt={`${author.name} avatar`}
                    className="size-16 shrink-0 rounded-full border border-palette-indigo-300-20 object-cover"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold">
                      {author.name}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-palette-slate-400">
                      {author.booksCount} books ·{" "}
                      {formatBorrowCount(author.borrowedBooksCount)} borrows
                    </p>
                    <p className="mt-2 text-xs text-amber-300">
                      ★ {author.rating.toFixed(1)} rating
                    </p>
                  </div>
                </Link>
                <div className="absolute top-5 right-5">
                  <FavoriteAuthorButton author={author} />
                </div>
                <Link
                  href={`/authors/${author.id}`}
                  className="mt-5 block border-t border-palette-indigo-300-20 pt-4 text-xs font-bold text-palette-cyan-300 transition-colors hover:text-white"
                >
                  View author profile →
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card className="mt-8 rounded-[28px] border-palette-indigo-300-20 bg-gray-200 py-0 text-center ring-0">
          <CardContent className="px-6 py-14 text-sm text-palette-slate-400">
            No authors found{query ? ` for “${query}”` : " yet"}.
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Author list pagination"
          className="flex items-center justify-end gap-3 pt-7 text-xs"
        >
          <Link
            href={pageHref(currentPage - 1, query)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "rounded-full border-palette-indigo-300-20 bg-gray-200 text-palette-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
            })}
          >
            Previous
          </Link>
          <span className="text-palette-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={pageHref(currentPage + 1, query)}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className:
                "rounded-full border-palette-indigo-300-20 bg-gray-200 text-palette-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
            })}
          >
            Next
          </Link>
        </nav>
      )}

      <div className="pt-16">
        <Footer />
      </div>
    </main>
  );
}
