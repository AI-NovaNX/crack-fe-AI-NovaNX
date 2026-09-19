"use client";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";
import { cn } from "@/lib/utils";

type ReviewItem = {
  id: string;
  date: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  comment: string;
  coverUrl?: string;
  coverClassName: string;
};

type ApiReview = {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  book: {
    title: string;
    coverUrl?: string | null;
    coverClassName?: string | null;
    author: { name: string };
    category: { name: string };
  };
};

type ReviewsResponse = {
  data: ApiReview[];
  meta: { page: number; totalPages: number };
};

function mapReview(review: ApiReview): ReviewItem {
  return {
    id: String(review.id),
    date: new Intl.DateTimeFormat("en-GB", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(review.createdAt)),
    title: review.book.title,
    author: review.book.author.name,
    category: review.book.category.name,
    rating: review.rating,
    comment: review.comment || "No comment provided.",
    coverUrl: getBookCoverUrl(review.book.coverUrl),
    coverClassName: getBookCoverClassName(review.book.coverClassName),
  };
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <BookHoverCard
      as="article"
      unstyled
      className="rounded-[22px] border border-palette-indigo-300-20 bg-secondary p-4 shadow-[0_10px_24px_-18px_#000] sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-[72px] shrink-0 sm:w-[88px]">
          <AnimatedBook {...review} compact />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-palette-slate-400">
                {review.date}
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-palette-slate-50">
                {review.title}
              </h2>
            </div>
            <span className="inline-flex w-fit rounded-full bg-cyan-400/15 px-2.5 py-1 text-[9px] font-bold text-cyan-700 dark:text-cyan-300">
              {review.category}
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold text-palette-slate-400">
            {review.author}
          </p>

          <div className="mt-3 flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={`${review.id}-star-${index}`}
                className={cn(
                  "size-3.5 fill-current",
                  index < review.rating ? "text-amber-400" : "text-white/20",
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          <p className="mt-3 text-sm leading-6 text-palette-slate-300">
            {review.comment}
          </p>
        </div>
      </div>
    </BookHoverCard>
  );
}

export default function ReviewsPage() {
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<"loading" | "ready" | "login" | "error">(
    "loading",
  );
  const [error, setError] = useState("");

  const loadReviews = useCallback(async (nextPage: number, append = false) => {
    try {
      const response = await fetch(`/api/reviews?page=${nextPage}&limit=10`, {
        cache: "no-store",
      });
      const body = await response.json();
      if (response.status === 401) {
        setStatus("login");
        return;
      }
      if (!response.ok)
        throw new Error(body?.message || "Reviews could not be loaded.");

      const payload = body as ReviewsResponse;
      const items = Array.isArray(payload.data)
        ? payload.data.map(mapReview)
        : [];
      setReviews((current) => (append ? [...current, ...items] : items));
      setPage(payload.meta?.page ?? nextPage);
      setTotalPages(payload.meta?.totalPages ?? 1);
      setStatus("ready");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Check your connection.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadReviews(1), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return reviews;

    return reviews.filter(
      (review) =>
        review.title.toLowerCase().includes(normalizedQuery) ||
        review.author.toLowerCase().includes(normalizedQuery) ||
        review.category.toLowerCase().includes(normalizedQuery),
    );
  }, [query, reviews]);

  return (
    <main className="mx-auto w-full max-w-[860px] px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <nav
        aria-label="Profile navigation"
        className="mx-auto flex max-w-[250px] items-center justify-between rounded-full border border-border bg-secondary p-1 text-[9px] text-palette-slate-400"
      >
        <Link href="/profile" className="rounded-full px-4 py-1.5">
          Profile
        </Link>
        <Link href="/borrowed" className="rounded-full px-4 py-1.5">
          Borrowed List
        </Link>
        <span className="rounded-full bg-accent px-4 py-1.5 font-extrabold text-foreground">
          Reviews
        </span>
      </nav>

      <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">Reviews</h1>

      <div className="relative mt-3 max-w-[250px]">
        <Search
          className="absolute top-1/2 left-3 size-3 -translate-y-1/2 text-cyan-700 dark:text-cyan-300"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reviews"
          aria-label="Search reviews"
          className="h-7 w-full rounded-full border border-border bg-secondary px-8 text-[9px] text-foreground outline-none placeholder:text-palette-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-300"
        />
      </div>

      <section className="mt-6 space-y-4">
        {status === "loading" && reviews.length === 0 ? (
          <div
            role="status"
            className="h-40 animate-pulse rounded-[22px] bg-secondary"
          />
        ) : status === "login" ? (
          <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
            Please{" "}
            <Link href="/login" className="font-bold text-cyan-300 underline">
              login
            </Link>{" "}
            to see your reviews.
          </div>
        ) : status === "error" && reviews.length === 0 ? (
          <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setError("");
                void loadReviews(1);
              }}
              className="mt-3 rounded-full bg-accent px-4 py-2 font-bold text-foreground"
            >
              Try again
            </button>
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
            No reviews match your search.
          </div>
        )}
        {status !== "login" && page < totalPages && (
          <button
            type="button"
            disabled={status === "loading"}
            onClick={() => {
              setStatus("loading");
              setError("");
              void loadReviews(page + 1, true);
            }}
            className="mx-auto block rounded-full border border-border bg-secondary px-5 py-2 text-xs font-bold text-foreground disabled:opacity-50"
          >
            {status === "loading" ? "Loading..." : "Load More"}
          </button>
        )}
      </section>
    </main>
  );
}
