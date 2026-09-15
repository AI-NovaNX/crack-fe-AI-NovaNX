"use client";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { ReviewModal } from "@/components/shared/review-modal";
import { ProfileContent } from "@/components/shared/profile-content";
import { getBookCoverUrl } from "@/lib/book-covers";
import { cn } from "@/lib/utils";
import { getBookDetail } from "@/services/books";
import type { Book } from "@/types/book";

type LoanStatus = "active" | "returned" | "overdue";
type Loan = {
  id: number | string;
  book: Book;
  status: LoanStatus;
  dueDate: string | null;
  borrowedAt: string | null;
  durationDays: number | null;
};

const statuses: Array<{ label: string; value: "all" | LoanStatus }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Returned", value: "returned" },
  { label: "Overdue", value: "overdue" },
];
const ITEMS_PER_PAGE = 3;

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

function asString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function mapStatus(value: unknown, dueDate: string | null): LoanStatus {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized.includes("return")) return "returned";
  if (
    normalized.includes("overdue") ||
    (dueDate && new Date(dueDate) < new Date())
  )
    return "overdue";
  return "active";
}

function mapLoan(value: unknown, index: number): Loan | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const rawBook = (source.book ?? source.bookItem ?? source.item) as
    | Record<string, unknown>
    | undefined;
  if (!rawBook || typeof rawBook !== "object") return null;
  const author = rawBook.author;
  const category = rawBook.category;
  const book: Book = {
    id: String(rawBook.id ?? rawBook.bookId ?? index),
    title: String(rawBook.title ?? "Book title"),
    author:
      typeof author === "object" && author
        ? String((author as Record<string, unknown>).name ?? "Author name")
        : String(author ?? "Author name"),
    category:
      typeof category === "object" && category
        ? String((category as Record<string, unknown>).name ?? "Category")
        : String(category ?? "Category"),
    rating: Number(rawBook.rating ?? 0),
    coverUrl: getBookCoverUrl(
      asString(rawBook.coverUrl ?? rawBook.coverImage ?? rawBook.imageUrl),
    ),
    coverClassName: String(
      rawBook.coverClassName ?? "bg-gradient-to-br from-orange-500 to-red-500",
    ),
  };
  const dueDate = asString(source.dueDate ?? source.dueAt ?? source.returnDate);
  return {
    id: (source.id as number | string | undefined) ?? index,
    book,
    status: mapStatus(source.status, dueDate),
    dueDate,
    borrowedAt: asString(
      source.borrowedAt ?? source.borrowDate ?? source.createdAt,
    ),
    durationDays:
      typeof source.durationDays === "number" ? source.durationDays : null,
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: LoanStatus) {
  return status[0].toUpperCase() + status.slice(1);
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

function LoanCard({
  loan,
  reviewed,
  onReview,
}: {
  loan: Loan;
  reviewed: boolean;
  onReview: () => void;
}) {
  return (
    <BookHoverCard
      as="article"
      unstyled
      className="overflow-hidden rounded-[18px] border border-palette-indigo-300-20 bg-card shadow-[0_10px_24px_-18px_#000]"
    >
      <div className="flex items-center justify-between border-b border-palette-indigo-300-20 px-3 py-2 text-[9px] font-extrabold sm:px-4">
        <span>
          Status{" "}
          <b
            className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[8px]",
              loan.status === "active" && "bg-emerald-400/20 text-emerald-300",
              loan.status === "returned" &&
                "bg-cyan-400/20 text-cyan-700 dark:text-cyan-300",
              loan.status === "overdue" &&
                "bg-fuchsia-400/20 text-fuchsia-700 dark:text-fuchsia-300",
            )}
          >
            {statusLabel(loan.status)}
          </b>
        </span>
        <span>
          Due Date{" "}
          <b className="ml-1 rounded-full bg-fuchsia-400/20 px-2 py-0.5 text-[8px] text-fuchsia-700 dark:text-fuchsia-300">
            {formatDate(loan.dueDate)}
          </b>
        </span>
      </div>
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <div className="w-[60px] shrink-0 sm:w-[72px]">
          <AnimatedBook {...loan.book} compact />
        </div>
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[8px] font-bold text-cyan-700 dark:text-cyan-300">
            {loan.book.category}
          </span>
          <h2 className="mt-2 truncate text-xs font-extrabold">
            <Link
              href={`/books/${encodeURIComponent(loan.book.id)}`}
              className="hover:text-cyan-300"
            >
              {loan.book.title}
            </Link>
          </h2>
          <p className="mt-1 truncate text-[9px] text-palette-slate-400">
            {loan.book.author}
          </p>
          <p className="mt-1 text-[9px] font-bold">
            {formatDate(loan.borrowedAt)}{" "}
            {loan.durationDays ? `· Duration ${loan.durationDays} Days` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onReview}
          disabled={reviewed}
          className="shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-4 py-2 text-[9px] font-extrabold text-white shadow-[0_4px_16px_#22d3ee40] transition-transform enabled:hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reviewed ? "Reviewed" : "Give Review"}
        </button>
      </div>
    </BookHoverCard>
  );
}

type BorrowedListProps = {
  initialTab?: "profile" | "borrowed" | "reviews";
};

export function BorrowedList({ initialTab = "borrowed" }: BorrowedListProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "login" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | LoanStatus>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [reviewBook, setReviewBook] = useState<Loan["book"] | null>(null);
  const [reviewedLoanIds, setReviewedLoanIds] = useState<Set<Loan["id"]>>(
    new Set(),
  );
  const [activeTab, setActiveTab] = useState<
    "profile" | "borrowed" | "reviews"
  >(initialTab);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewEntries, setReviewEntries] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/borrowed", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json();
        if (response.status === 401) {
          setStatus("login");
          return;
        }
        if (!response.ok)
          throw new Error(body.message || "Borrowed list belum dapat dimuat.");
        const values: unknown[] = Array.isArray(body)
          ? body
          : Array.isArray(body.data)
            ? body.data
            : Array.isArray(body.loans)
              ? body.loans
              : [];
        setLoans(
          values
            .map((value, index) => mapLoan(value, index))
            .filter((loan): loan is Loan => loan !== null),
        );
        setStatus("ready");
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Periksa koneksi Anda.",
        );
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const filteredLoans = useMemo(
    () =>
      loans.filter(
        (loan) =>
          (filter === "all" || loan.status === filter) &&
          loan.book.title.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [filter, loans, query],
  );
  const visibleLoans = filteredLoans.slice(0, visibleCount);

  useEffect(() => {
    if (activeTab !== "reviews" || loans.length === 0) {
      return;
    }

    let isMounted = true;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError("");

      try {
        const reviewGroups = await Promise.all(
          loans.map(async (loan) => {
            const bookDetail = await getBookDetail(loan.book.id);
            if (!bookDetail?.reviews?.length) return [];

            return bookDetail.reviews.map((review) => ({
              id: String(review.id),
              date: formatDate(review.createdAt),
              title: bookDetail.title,
              author: bookDetail.author,
              category: bookDetail.category,
              rating: review.rating,
              comment: review.comment || "No comment provided.",
              coverUrl: bookDetail.coverUrl,
              coverClassName: bookDetail.coverClassName,
            }));
          }),
        );

        if (!isMounted) return;

        setReviewEntries(reviewGroups.flat());
      } catch (loadError) {
        if (!isMounted) return;
        setReviewsError(
          loadError instanceof Error
            ? loadError.message
            : "Review belum dapat dimuat.",
        );
        setReviewEntries([]);
      } finally {
        if (isMounted) setReviewsLoading(false);
      }
    }

    void loadReviews();
    return () => {
      isMounted = false;
    };
  }, [activeTab, loans]);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = reviewQuery.trim().toLowerCase();

    if (!normalizedQuery) return reviewEntries;

    return reviewEntries.filter(
      (review) =>
        review.title.toLowerCase().includes(normalizedQuery) ||
        review.author.toLowerCase().includes(normalizedQuery) ||
        review.category.toLowerCase().includes(normalizedQuery),
    );
  }, [reviewEntries, reviewQuery]);

  function renderLoanStatus() {
    if (status === "loading")
      return (
        <div
          role="status"
          className="h-96 animate-pulse rounded-[24px] bg-secondary"
        />
      );
    if (status === "error")
      return (
        <CatalogUnavailable
          title="Borrowed list belum dapat dimuat"
          message={error}
        />
      );
    if (status === "login")
      return (
        <section className="rounded-[24px] border border-border bg-secondary p-10 text-center">
          <h1 className="text-xl font-extrabold">
            Login untuk melihat borrowed list
          </h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-6 py-3 text-sm font-bold"
          >
            Login
          </Link>
        </section>
      );

    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[860px]">
      <nav
        aria-label="Profile navigation"
        className="mx-auto flex max-w-[250px] items-center justify-between rounded-full border border-border bg-secondary p-1 text-[9px] text-palette-slate-400"
      >
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          aria-pressed={activeTab === "profile"}
          className={cn(
            "rounded-full px-4 py-1.5",
            activeTab === "profile" &&
              "bg-accent font-extrabold text-foreground",
          )}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("borrowed")}
          className={cn(
            "rounded-full px-4 py-1.5",
            activeTab === "borrowed" &&
              "bg-accent font-extrabold text-foreground",
          )}
        >
          Borrowed List
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "rounded-full px-4 py-1.5",
            activeTab === "reviews" &&
              "bg-accent font-extrabold text-foreground",
          )}
        >
          Reviews
        </button>
      </nav>

      {activeTab === "profile" ? (
        <ProfileContent />
      ) : activeTab === "borrowed" && status !== "ready" ? (
        renderLoanStatus()
      ) : activeTab === "borrowed" ? (
        <>
          <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">
            Borrowed List
          </h1>
          <div className="relative mt-3 max-w-[250px]">
            <Search
              className="absolute top-1/2 left-3 size-3 -translate-y-1/2 text-cyan-700 dark:text-cyan-300"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              placeholder="Search book"
              aria-label="Search borrowed books"
              className="h-7 w-full rounded-full border border-border bg-secondary px-8 text-[9px] text-foreground outline-none placeholder:text-palette-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-300"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setFilter(item.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={cn(
                  "rounded-full border border-border bg-secondary px-3 py-1 text-[9px] font-bold text-palette-slate-400",
                  filter === item.value && "bg-cyan-300 text-[#06101c]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {visibleLoans.length ? (
            <div className="mt-3 space-y-2">
              {visibleLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  reviewed={reviewedLoanIds.has(loan.id)}
                  onReview={() => setReviewBook(loan.book)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-border bg-secondary p-8 text-center text-xs text-palette-slate-400">
              No borrowed books found.
            </div>
          )}
          {filteredLoans.length > visibleLoans.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + ITEMS_PER_PAGE)}
              className="mx-auto mt-4 block rounded-full border border-border bg-secondary px-5 py-2 text-[9px] font-bold text-foreground hover:bg-secondary"
            >
              Load More
            </button>
          )}
        </>
      ) : (
        <>
          <h1 className="mt-5 text-xl font-extrabold sm:text-2xl">Reviews</h1>

          <div className="relative mt-3 max-w-[250px]">
            <Search
              className="absolute top-1/2 left-3 size-3 -translate-y-1/2 text-cyan-700 dark:text-cyan-300"
              aria-hidden="true"
            />
            <input
              value={reviewQuery}
              onChange={(event) => setReviewQuery(event.target.value)}
              placeholder="Search reviews"
              aria-label="Search reviews"
              className="h-7 w-full rounded-full border border-border bg-secondary px-8 text-[9px] text-foreground outline-none placeholder:text-palette-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-300"
            />
          </div>

          <section className="mt-6 space-y-4">
            {reviewsLoading ? (
              <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
                Memuat review...
              </div>
            ) : reviewsError ? (
              <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
                {reviewsError}
              </div>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="rounded-[22px] border border-border bg-secondary px-5 py-8 text-center text-sm text-palette-slate-400">
                Tidak ada review yang cocok dengan pencarian Anda.
              </div>
            )}
          </section>
        </>
      )}

      {reviewBook ? (
        <ReviewModal
          book={reviewBook}
          onClose={() => setReviewBook(null)}
          onSubmitted={() => {
            const loan = loans.find((item) => item.book.id === reviewBook.id);
            if (loan)
              setReviewedLoanIds((current) => new Set(current).add(loan.id));
            setReviewBook(null);
          }}
        />
      ) : null}
    </div>
  );
}
