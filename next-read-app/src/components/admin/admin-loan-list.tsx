"use client";

import { CheckCircle2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminReturnApprovalModal } from "@/components/admin/admin-return-approval-modal";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";
import { cn } from "@/lib/utils";

type LoanStatus = "ACTIVE" | "RETURN_REQUESTED" | "RETURNED";
type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "OVERDUE";

type AdminLoan = {
  id: number;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  book: {
    id: string;
    title: string;
    coverUrl?: string | null;
    coverClassName?: string | null;
    author?: { name?: string };
    category?: { name?: string };
  };
  user: {
    fullName: string;
    email: string;
  };
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type LoansResponse = {
  data: AdminLoan[];
  meta: PaginationMeta;
};

const PAGE_SIZE = 6;
const filters: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending Return", value: "RETURN_REQUESTED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Overdue", value: "OVERDUE" },
];

const statusStyles = {
  ACTIVE: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  RETURN_REQUESTED: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  RETURNED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  OVERDUE: "border-rose-400/30 bg-rose-400/10 text-rose-300",
} as const;

function displayStatus(loan: AdminLoan) {
  if (
    loan.status !== "RETURNED" &&
    new Date(loan.dueAt).getTime() < Date.now()
  ) {
    return "OVERDUE" as const;
  }
  return loan.status;
}

function formatStatus(status: keyof typeof statusStyles) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function loanDuration(loan: AdminLoan) {
  const start = new Date(loan.borrowedAt).getTime();
  const end = new Date(loan.dueAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(1, Math.ceil((end - start) / 86_400_000));
}

export function AdminLoanList({ initialFilter }: { initialFilter?: string }) {
  const requestedFilter = initialFilter?.toUpperCase();
  const startingFilter = filters.some((item) => item.value === requestedFilter)
    ? (requestedFilter as StatusFilter)
    : "ALL";
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [filter, setFilter] = useState<StatusFilter>(startingFilter);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalLoan, setApprovalLoan] = useState<AdminLoan | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLoans() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        status: filter,
      });
      if (query) params.set("q", query);

      try {
        const response = await fetch(`/api/admin/loans?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as
          | LoansResponse
          | { message?: string }
          | null;
        if (!response.ok) {
          throw new Error(
            body && "message" in body && body.message
              ? body.message
              : "Borrowed list could not be loaded.",
          );
        }
        const result = body as LoansResponse;
        setLoans(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setLoans([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Borrowed list could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadLoans();
    return () => controller.abort();
  }, [attempt, filter, page, query]);

  return (
    <>
      <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
        Administration / Circulation
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1
          id="borrowed-list-title"
          className="text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          Borrowed List
        </h1>
        <p className="text-xs text-palette-slate-400">
          Monitor active and completed book loans.
        </p>
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
          placeholder="Search books or borrowers"
          aria-label="Search books or borrowers"
          className="h-11 w-full rounded-full border border-palette-indigo-300-20 bg-gray-200 pr-4 pl-11 text-xs text-palette-slate-50 outline-none placeholder:text-palette-slate-400 focus:border-palette-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        />
      </div>

      <div
        className="mt-3 flex flex-wrap gap-2"
        aria-label="Filter loans by status"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => {
              setFilter(item.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-[10px] font-bold transition-colors",
              filter === item.value
                ? "border-cyan-300 bg-cyan-300 text-slate-950"
                : "border-palette-indigo-300-20 bg-gray-200 text-palette-slate-400 hover:border-cyan-300/50 hover:text-palette-slate-50",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[24px] border border-palette-indigo-300-20 bg-gray-200"
            />
          ))
        ) : error ? (
          <div className="rounded-[24px] border border-red-400/20 bg-red-400/5 px-6 py-12 text-center text-sm text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="mt-4 rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-xs font-bold hover:bg-red-400/20"
            >
              Try again
            </button>
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-[24px] border border-palette-indigo-300-20 bg-gray-200 px-6 py-14 text-center text-sm text-palette-slate-400">
            No matching loans.
          </div>
        ) : (
          loans.map((loan) => {
            const status = displayStatus(loan);
            const duration = loanDuration(loan);
            const isPendingReturn = loan.status === "RETURN_REQUESTED";
            return (
              <article
                key={loan.id}
                className={cn(
                  "rounded-[24px] border bg-gray-200 p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)] sm:p-5",
                  isPendingReturn
                    ? "border-amber-400/40 ring-1 ring-amber-400/20"
                    : "border-palette-indigo-300-20",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px]">
                  <span className="flex items-center gap-2 font-semibold text-palette-slate-400">
                    Status
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-bold",
                        statusStyles[status],
                      )}
                    >
                      {formatStatus(status)}
                    </span>
                  </span>
                  <span className="text-palette-slate-400">
                    Due Date{" "}
                    <strong className="ml-2 rounded-full bg-white/5 px-2.5 py-1 text-palette-slate-50">
                      {formatDate(loan.dueAt)}
                    </strong>
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[82px_minmax(0,1fr)_170px]">
                  <BookHoverCard className="w-[72px] border-0 sm:w-[82px]">
                    <AnimatedBook
                      title={loan.book.title}
                      author={loan.book.author?.name}
                      coverUrl={getBookCoverUrl(loan.book.coverUrl)}
                      coverClassName={getBookCoverClassName(
                        loan.book.coverClassName,
                      )}
                      compact
                    />
                  </BookHoverCard>
                  <div className="min-w-0">
                    {loan.book.category?.name && (
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-semibold text-cyan-300">
                        {loan.book.category.name}
                      </span>
                    )}
                    <h2 className="mt-2 truncate text-sm font-extrabold sm:text-base">
                      {loan.book.title}
                    </h2>
                    <p className="mt-1 text-xs text-palette-slate-400">
                      {loan.book.author?.name || "Unknown author"}
                    </p>
                    <p className="mt-3 text-[10px] font-semibold text-palette-slate-400">
                      {formatDate(loan.borrowedAt)}
                      {duration ? ` · Duration ${duration} Days` : ""}
                    </p>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2 rounded-2xl border border-palette-indigo-300-20 bg-white/5 px-4 py-3 text-left sm:col-span-1 sm:text-right">
                    <div>
                      <p className="font-mono text-[8px] tracking-[0.18em] text-palette-slate-400 uppercase">
                        Borrower Name
                      </p>
                      <p className="mt-1 truncate text-xs font-extrabold">
                        {loan.user.fullName}
                      </p>
                      <p className="mt-1 truncate text-[9px] text-palette-slate-400">
                        {loan.user.email}
                      </p>
                    </div>
                    {isPendingReturn && (
                      <div className="flex gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setApprovalLoan(loan)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-3 py-2 text-[9px] font-extrabold text-white shadow-[0_4px_12px_#22d3ee20] transition-all hover:scale-[1.02] hover:shadow-[0_6px_16px_#7c5cff35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:flex-none"
                        >
                          <CheckCircle2 className="size-3" aria-hidden="true" />
                          Verify Return
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {!loading && !error && meta.totalPages > 1 && (
        <nav
          aria-label="Borrowed list pagination"
          className="mt-5 flex items-center justify-end gap-3 text-xs"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            className="pagination-button disabled:cursor-not-allowed disabled:opacity-40"
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
            className="pagination-button disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}

      {approvalLoan ? (
        <AdminReturnApprovalModal
          loan={approvalLoan}
          onClose={() => setApprovalLoan(null)}
          onProcessed={(loanId) => {
            setLoans((current) =>
              current.map((l) =>
                l.id === loanId
                  ? { ...l, status: "RETURNED" as LoanStatus }
                  : l,
              ),
            );
            setApprovalLoan(null);
          }}
        />
      ) : null}
    </>
  );
}
