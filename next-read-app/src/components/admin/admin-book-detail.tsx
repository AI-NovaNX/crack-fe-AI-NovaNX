"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BookDetail } from "@/services/books";
import type { Book } from "@/types/book";

export function AdminBookDetail({
  book,
  related,
  relatedError,
}: {
  book: BookDetail;
  related: Book[];
  relatedError: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [visible, setVisible] = useState(6);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteBook() {
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: book.id }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Book belum dapat dihapus.");
      toast({
        title: "Book berhasil dihapus",
        description: book.title,
        variant: "success",
      });
      setDeleteOpen(false);
      router.push("/admin/books");
      router.refresh();
    } catch (error) {
      toast({
        title: "Gagal menghapus book",
        description:
          error instanceof Error ? error.message : "Silakan coba kembali.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

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
          <h1 className="mt-4 text-2xl leading-tight font-extrabold sm:text-3xl">
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
              {book.description || "Deskripsi buku belum tersedia."}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/admin/books/${encodeURIComponent(book.id)}/edit`}
              className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_#22d3ee40] transition hover:opacity-90"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-red-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400"
            >
              Delete
            </button>
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
            Belum ada ulasan untuk buku ini.
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
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    aria-hidden="true"
                    className={`size-4 ${rating <= review.rating ? "fill-current" : "opacity-30"}`}
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
              onClick={() => setVisible((value) => value + 6)}
              className="rounded-full border border-border bg-secondary px-7 py-2 text-sm font-bold"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      <section className="mb-12 border-t border-border pt-8">
        <h2 className="mb-6 text-2xl font-extrabold">Related Books</h2>
        {relatedError ? (
          <CatalogUnavailable title="Buku terkait belum dapat dimuat" />
        ) : related.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((item) => (
              <BookHoverCard unstyled key={item.id} className="min-w-0">
                <Link
                  href={`/admin/books/${encodeURIComponent(item.id)}`}
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
            Belum ada buku lain dalam kategori ini.
          </p>
        )}
      </section>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md bg-white text-slate-950">
          <AlertDialogTitle className="text-lg font-extrabold">
            Delete Data
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-sm text-slate-600">
            Once deleted, you won&apos;t be able to recover this data.
          </AlertDialogDescription>
          <div className="grid grid-cols-2 gap-3 pt-7">
            <AlertDialogCancel
              disabled={deleting}
              className="h-11 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-950 hover:bg-slate-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteBook();
              }}
              className="h-11 rounded-full bg-pink-600 text-sm font-bold text-white hover:bg-pink-700"
            >
              {deleting ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
