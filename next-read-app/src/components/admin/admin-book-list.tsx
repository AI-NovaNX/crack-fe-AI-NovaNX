"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";
import { cn } from "@/lib/utils";

type AdminBook = {
  id: string;
  title: string;
  rating: number;
  coverUrl?: string | null;
  coverClassName?: string | null;
  isAvailable: boolean;
  totalCopies: number;
  availableCopies: number;
  author: { name: string };
  category: { name: string };
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type BooksResponse = { data: AdminBook[]; meta: PaginationMeta };
type AvailabilityFilter = "all" | "available" | "unavailable";
const PAGE_SIZE = 8;

function normalizeBooksResponse(body: unknown): BooksResponse {
  if (!body || typeof body !== "object") {
    throw new Error("Respons daftar buku tidak valid.");
  }

  const response = body as Partial<BooksResponse>;
  if (!Array.isArray(response.data) || !response.meta) {
    throw new Error("Respons daftar buku tidak lengkap.");
  }

  const data = response.data.filter((book): book is AdminBook =>
    Boolean(
      book &&
      typeof book === "object" &&
      typeof book.id === "string" &&
      typeof book.title === "string" &&
      book.author &&
      typeof book.author.name === "string" &&
      book.category &&
      typeof book.category.name === "string",
    ),
  );

  return { data, meta: response.meta };
}

export function AdminBookList() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [filter, setFilter] = useState<AvailabilityFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<AdminBook | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBooks() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (query) params.set("title", query);
      if (filter !== "all")
        params.set("available", String(filter === "available"));
      try {
        const response = await fetch(`/api/admin/books?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as
          | BooksResponse
          | { message?: string }
          | null;
        if (!response.ok)
          throw new Error(
            body && "message" in body && body.message
              ? body.message
              : "Book list belum dapat dimuat.",
          );
        const result = normalizeBooksResponse(body);
        setBooks(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setBooks([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Book list belum dapat dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadBooks();
    return () => controller.abort();
  }, [attempt, filter, page, query]);

  async function deleteBook() {
    if (!bookToDelete || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/books", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookToDelete.id }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Book belum dapat dihapus.");
      setBookToDelete(null);
      if (books.length === 1 && page > 1) setPage((value) => value - 1);
      else setAttempt((value) => value + 1);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Book belum dapat dihapus.",
      );
      setBookToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
            Administration / Collection
          </p>
          <h1
            id="book-list-title"
            className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Book List
          </h1>
        </div>
        <Link
          href="/admin/books/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Book
        </Link>
      </div>

      <div className="relative mt-5 max-w-xl">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-palette-cyan-300"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search books"
          aria-label="Search books"
          className="h-11 w-full rounded-full border border-palette-indigo-300-20 bg-gray-200 pr-4 pl-11 text-xs text-palette-slate-50 outline-none placeholder:text-palette-slate-400 focus:border-palette-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        />
      </div>

      <div
        className="mt-3 flex flex-wrap gap-2"
        aria-label="Filter books by availability"
      >
        {(["all", "available", "unavailable"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-[10px] font-bold capitalize transition-colors",
              filter === value
                ? "border-cyan-300 bg-cyan-300 text-slate-950"
                : "border-palette-indigo-300-20 bg-gray-200 text-palette-slate-400 hover:border-cyan-300/50 hover:text-palette-slate-50",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[24px] border border-palette-indigo-300-20 bg-gray-200"
            />
          ))
        ) : error ? (
          <div className="rounded-[24px] border border-red-400/20 bg-red-400/5 px-6 py-12 text-center text-sm text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-4 rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-xs font-bold"
            >
              Try again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-[24px] border border-palette-indigo-300-20 bg-gray-200 px-6 py-14 text-center text-sm text-palette-slate-400">
            Tidak ada buku yang cocok.
          </div>
        ) : (
          books.map((book) => (
            <article
              key={book.id}
              className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 rounded-[24px] border border-palette-indigo-300-20 bg-gray-200 p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)] sm:grid-cols-[82px_minmax(0,1fr)_auto] sm:p-5"
            >
              <BookHoverCard className="w-[72px] border-0 sm:w-[82px]">
                <AnimatedBook
                  title={book.title}
                  author={book.author.name}
                  coverUrl={getBookCoverUrl(book.coverUrl)}
                  coverClassName={getBookCoverClassName(book.coverClassName)}
                  compact
                />
              </BookHoverCard>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-palette-slate-400">
                  {book.category.name}
                </p>
                <h2 className="mt-1 truncate text-sm font-extrabold sm:text-base">
                  {book.title}
                </h2>
                <p className="mt-1 text-xs text-palette-slate-400">
                  {book.author.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
                  <span className="text-amber-400">
                    ★ {book.rating.toFixed(1)}
                  </span>
                  <span
                    className={
                      book.isAvailable ? "text-emerald-300" : "text-rose-300"
                    }
                  >
                    {book.availableCopies}/{book.totalCopies} copies available
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex flex-wrap justify-end gap-2 sm:col-span-1">
                <Link
                  href={`/admin/books/${encodeURIComponent(book.id)}`}
                  className="rounded-full border border-palette-indigo-300-20 bg-white/5 px-4 py-2 text-[10px] font-bold hover:border-cyan-300/50"
                >
                  Book Detail
                </Link>
                <Link
                  href={`/admin/books/${encodeURIComponent(book.id)}/edit`}
                  className="rounded-full border border-palette-indigo-300-20 bg-white/5 px-4 py-2 text-[10px] font-bold hover:border-cyan-300/50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setBookToDelete(book)}
                  className="rounded-full border border-red-400/25 bg-red-400/5 px-4 py-2 text-[10px] font-bold text-red-300 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {!loading && !error && meta.totalPages > 1 && (
        <nav
          aria-label="Book list pagination"
          className="mt-5 flex items-center justify-end gap-3 text-xs"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="pagination-button disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-palette-slate-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((value) => value + 1)}
            className="pagination-button disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}

      <AlertDialog
        open={bookToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setBookToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="text-xl font-extrabold">
            Delete this book?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-sm leading-6 text-palette-slate-400">
            {bookToDelete
              ? `“${bookToDelete.title}” will be archived. Books with active loans cannot be deleted.`
              : "This action cannot be undone."}
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 pt-6">
            <AlertDialogCancel
              disabled={deleting}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteBook();
              }}
              className={buttonVariants({ variant: "destructive" })}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
