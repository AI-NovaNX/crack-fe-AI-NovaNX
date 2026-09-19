"use client";

import Image from "next/image";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { FavoriteAuthorButton } from "@/components/shared/favorite-author-button";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { Author } from "@/types/author";

function formatBorrowCount(count: number) {
  if (count < 1000) {
    return count.toString();
  }

  const compactCount = count / 1000;
  return `${Number.isInteger(compactCount) ? compactCount : compactCount.toFixed(1)}K`;
}

function FavoriteAuthorCard({ author }: { author: Author }) {
  return (
    <li className="rounded-[28px] border border-palette-indigo-300-20 bg-card p-4 shadow-none ring-0">
      <div className="flex items-center gap-4">
        <Link
          href={`/authors/${author.id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div className="size-14 shrink-0 overflow-hidden rounded-full border border-palette-indigo-300-20 bg-palette-cyan-300-10">
            <Image
              src={author.avatar}
              alt={`${author.name} avatar`}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-extrabold text-palette-slate-50">
              {author.name}
            </h2>
            <p className="pt-1 text-xs font-semibold text-palette-slate-400">
              <span aria-hidden="true">📚</span> {author.booksCount} Books{" "}
              <span className="text-palette-indigo-300-20">•</span>{" "}
              <span aria-hidden="true">🔥</span>{" "}
              {formatBorrowCount(author.borrowedBooksCount)} Borrows
            </p>
          </div>
        </Link>

        <FavoriteAuthorButton author={author} />
      </div>
    </li>
  );
}

export default function FavoriteAuthorPage() {
  const { authors, status, error, retry } = useFavorites();

  if (status === "loading") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[1160px] flex-col px-5 py-7 font-outfit text-palette-slate-50 sm:px-8">
        <AppNav />
        <section className="flex-1 py-9">
          <div className="mt-7 h-64 animate-pulse rounded-3xl bg-secondary p-6" />
        </section>
        <Footer />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[1160px] flex-col px-5 py-7 font-outfit text-palette-slate-50 sm:px-8">
        <AppNav />
        <section className="flex-1 py-9">
          <CatalogUnavailable
            title="Favorite author list could not be loaded"
            message={error}
            onRetry={retry}
          />
        </section>
        <Footer />
      </main>
    );
  }

  if (status === "guest") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[1160px] flex-col px-5 py-7 font-outfit text-palette-slate-50 sm:px-8">
        <AppNav />
        <section className="flex-1 py-9">
          <div className="my-10 rounded-3xl border border-border bg-secondary p-10 text-center">
            <h2 className="text-xl font-bold">
              Login to view your favorite authors
            </h2>
            <Link
              href="/login"
              className="mt-5 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-8 py-3 font-bold"
            >
              Login
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[1160px] flex-col px-5 py-7 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />

      <section className="flex-1 py-9">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Favorite Author</h1>
        <p className="mt-3 text-sm text-palette-slate-400">
          The list of authors you have marked as favorites.
        </p>

        {!authors.length ? (
          <div className="my-8 rounded-3xl border border-border bg-secondary p-12 text-center">
            <h2 className="text-xl font-bold">No favorite authors yet</h2>
            <p className="mt-3 text-palette-slate-400">
              Click the heart icon on an author to save them here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-7 py-3 font-bold"
            >
              Browse Authors
            </Link>
          </div>
        ) : (
          <ul className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {authors.map((author) => (
              <FavoriteAuthorCard key={author.id} author={author} />
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
  );
}
