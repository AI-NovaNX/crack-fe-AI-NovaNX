"use client";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartButton } from "@/components/shared/cart-button";
import { useCart } from "@/components/providers/cart-provider";
import { Star } from "lucide-react";
import type { BookDetail } from "@/services/books";
import type { Book } from "@/types/book";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { FavoriteButton } from "@/components/shared/favorite-button";

export function DetailContent({
  book,
  related,
  relatedError,
}: {
  book: BookDetail;
  related: Book[];
  relatedError: boolean;
}) {
  const [visible, setVisible] = useState(6);
  const router = useRouter();
  const { pending, isAdmin } = useCart();
  const unavailable = book.isAvailable === false || book.availableCopies <= 0;
  return (
    <>
      <BookHoverCard
        as="section"
        unstyled
        className="grid gap-6 rounded-[28px] border border-border bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)]"
      >
        <div className="mx-auto w-full max-w-[310px] self-start rounded-[22px] bg-gradient-to-br from-emerald-50 to-slate-200 p-5">
          <AnimatedBook {...book} />
        </div>
        <div className="min-w-0 py-1">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-skyblue">
            {book.category}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
            {book.title}
          </h1>
          <p className="mt-3 text-palette-slate-400">{book.author}</p>
          <p className="mt-4 text-yellow-700 dark:text-yellow-400">
            ★ {book.rating.toFixed(1)}
          </p>
          <dl className="my-6 flex gap-6 sm:gap-8">
            {[
              ["Pages", book.pageCount ?? "—"],
              ["Available copies", book.availableCopies],
              ["Reviews", book.reviewCount],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs text-palette-slate-400">{label}</dt>
                <dd className="text-xl font-extrabold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border pt-5">
            <h2 className="font-bold">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-palette-slate-400">
              {book.description || "No description available for this book."}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <CartButton book={book} showLabel />
            <button
              type="button"
              onClick={() =>
                router.push(`/checkout?bookId=${encodeURIComponent(book.id)}`)
              }
              disabled={isAdmin || pending.includes(book.id) || unavailable}
              className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-foreground transition-all duration-200 enabled:hover:bg-gradient-to-r enabled:hover:from-cyan-400 enabled:hover:to-violet-600 enabled:hover:shadow-[0_4px_16px_#22d3ee40] enabled:focus-visible:bg-gradient-to-r enabled:focus-visible:to-violet-600 enabled:focus-visible:from-cyan-400 enabled:focus-visible:to-violet-600 enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-4 enabled:focus-visible:outline-cyan-300 enabled:active:scale-[0.98] enabled:active:bg-gradient-to-r enabled:active:from-cyan-400 enabled:active:to-violet-600 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none"
            >
              {isAdmin
                ? "Admins cannot borrow"
                : unavailable
                  ? "Unavailable"
                  : "Borrow Book"}
            </button>
          </div>
          {unavailable && (
            <p className="mt-3 text-xs text-palette-slate-400">
              This book is currently unavailable to borrow.
            </p>
          )}
          <div className="mt-4">
            <FavoriteButton book={book} showLabel />
          </div>
        </div>
      </BookHoverCard>
      <section className="my-12 border-t border-border pt-8">
        <h2 className="text-2xl font-extrabold">Review</h2>
        <p className="mt-3 text-sm">
          ⭐ {book.rating.toFixed(1)} ({book.reviewCount} reviews)
        </p>
        {!book.reviews.length && (
          <p className="py-6 text-palette-slate-400">
            No reviews yet for this book.
          </p>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {book.reviews.slice(0, visible).map((review) => (
            <article
              key={review.id}
              className="rounded-[22px] border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 font-bold"
                >
                  {review.user.fullName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3 className="text-sm font-bold">{review.user.fullName}</h3>
                  <time
                    dateTime={review.createdAt}
                    className="text-xs text-palette-slate-400"
                  >
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(review.createdAt))}
                  </time>
                </div>
              </div>
              <div
                className="my-3 flex gap-1 text-yellow-700 dark:text-yellow-400"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    aria-hidden="true"
                    className={`size-4 ${n <= review.rating ? "fill-current" : "opacity-30"}`}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-palette-slate-400">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
        {visible < book.reviews.length && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setVisible((n) => n + 6)}
              className="rounded-full border border-border bg-secondary px-7 py-2 text-sm font-bold hover:bg-secondary"
            >
              Load More
            </button>
          </div>
        )}
      </section>
      <section className="mb-12 border-t border-border pt-8">
        <h2 className="mb-6 text-2xl font-extrabold">Related Books</h2>
        {relatedError ? (
          <CatalogUnavailable title="Related books could not be loaded" />
        ) : related.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((item) => (
              <BookHoverCard unstyled key={item.id} className="min-w-0">
                <Link
                  href={`/books/${encodeURIComponent(item.id)}`}
                  className="block h-full min-w-0 rounded-[20px] border border-border bg-card p-3 transition-colors hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
                >
                  <AnimatedBook {...item} />
                  <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
                  <p className="mt-2 text-xs text-palette-slate-400">
                    {item.author}
                  </p>
                  <p className="mt-3 text-xs text-yellow-700 dark:text-yellow-400">
                    ★ {item.rating.toFixed(1)}
                  </p>
                </Link>
              </BookHoverCard>
            ))}
          </div>
        ) : (
          <p className="text-palette-slate-400">
            No other books in this category yet.
          </p>
        )}
      </section>
    </>
  );
}
