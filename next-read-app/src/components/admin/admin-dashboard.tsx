"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BookMarked,
  Boxes,
  Bell,
  LibraryBig,
  RefreshCw,
  Tags,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardData = {
  users: number;
  authors: number;
  categories: number;
  books: number;
  availableBooks: number;
  activeLoans: number;
  overdueLoans: number;
  pendingReturnRequests: number;
  topBorrowedBooks: Array<{
    id: string;
    title: string;
    borrowCount: number;
  }>;
};

type AuthorStatistic = {
  id: string;
  name: string;
  booksCount: number;
  averageBookRating: number;
};

type CategoryStatistic = {
  id: string;
  name: string;
  slug: string;
  booksCount: number;
};

type PendingReturnsResponse = {
  meta?: { total?: number };
};

type Metric = {
  label: string;
  key: keyof Pick<
    DashboardData,
    | "users"
    | "authors"
    | "categories"
    | "books"
    | "availableBooks"
    | "activeLoans"
    | "overdueLoans"
    | "pendingReturnRequests"
  >;
  icon: typeof Users;
  tone: string;
  href?: string;
};

const metrics: Metric[] = [
  {
    label: "Registered users",
    key: "users",
    icon: Users,
    tone: "text-cyan-300",
  },
  {
    label: "Books in catalog",
    key: "books",
    icon: LibraryBig,
    tone: "text-violet-300",
  },
  {
    label: "Available books",
    key: "availableBooks",
    icon: Boxes,
    tone: "text-emerald-300",
  },
  {
    label: "Active loans",
    key: "activeLoans",
    icon: BookMarked,
    tone: "text-amber-300",
  },
  {
    label: "Overdue loans",
    key: "overdueLoans",
    icon: AlertTriangle,
    tone: "text-rose-300",
  },
  {
    label: "Pending returns",
    key: "pendingReturnRequests",
    icon: Bell,
    tone: "text-amber-200",
    href: "/admin/loans?status=RETURN_REQUESTED",
  },
  { label: "Authors", key: "authors", icon: BookOpen, tone: "text-sky-300" },
  {
    label: "Categories",
    key: "categories",
    icon: Tags,
    tone: "text-fuchsia-300",
  },
];

function MetricSkeleton() {
  return (
    <div className="h-[118px] animate-pulse rounded-[24px] border border-palette-indigo-300-20 bg-gray-200" />
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [authorStatistics, setAuthorStatistics] = useState<AuthorStatistic[]>(
    [],
  );
  const [categoryStatistics, setCategoryStatistics] = useState<
    CategoryStatistic[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const responses = await Promise.all([
          fetch("/api/admin/dashboard", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/authors/statistics", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/categories/statistics", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/loans?status=RETURN_REQUESTED&page=1&limit=1", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        const bodies = await Promise.all(
          responses.map((response) => response.json().catch(() => null)),
        );
        const failedResponse = responses.findIndex((response) => !response.ok);
        if (failedResponse >= 0) {
          const body = bodies[failedResponse] as { message?: string } | null;
          throw new Error(body?.message ?? "Dashboard belum dapat dimuat.");
        }
        setAuthorStatistics(
          Array.isArray(bodies[1]) ? (bodies[1] as AuthorStatistic[]) : [],
        );
        setCategoryStatistics(
          Array.isArray(bodies[2]) ? (bodies[2] as CategoryStatistic[]) : [],
        );
        const pendingReturns = bodies[3] as PendingReturnsResponse | null;
        setData((current) => ({
          ...(bodies[0] as DashboardData),
          pendingReturnRequests:
            typeof pendingReturns?.meta?.total === "number"
              ? pendingReturns.meta.total
              : 0,
          topBorrowedBooks: (bodies[0] as DashboardData).topBorrowedBooks ?? [],
        }));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setData(null);
        setAuthorStatistics([]);
        setCategoryStatistics([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Dashboard belum dapat dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [attempt]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
            Administration / Overview
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-palette-slate-400">
            A quick view of NexRead activity, collection health, and current
            loans.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => setAttempt((value) => value + 1)}
          className="rounded-full border-palette-indigo-300-20 bg-gray-200 text-palette-slate-50 hover:border-palette-cyan-300 hover:bg-white/5"
        >
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          Refresh data
        </Button>
      </div>

      {error ? (
        <Card className="mt-7 rounded-[24px] border-red-400/25 bg-red-400/5 py-0 text-red-200 ring-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
            <div>
              <p className="font-bold">Dashboard belum dapat dimuat.</p>
              <p className="mt-1 text-sm text-red-200/70">{error}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-full"
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 7 }, (_, index) => (
                <MetricSkeleton key={index} />
              ))
            : metrics.map(({ label, key, icon: Icon, tone, href }) => {
                const card = (
                  <Card className="h-full rounded-[24px] border-palette-indigo-300-20 bg-gray-200 py-0 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] ring-0 transition-colors hover:border-palette-cyan-300/60">
                    <CardContent className="flex min-h-[118px] items-center justify-between gap-3 px-5 py-5">
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.14em] text-palette-slate-400 uppercase">
                          {label}
                        </p>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight">
                          {data?.[key].toLocaleString("en-US") ?? "-"}
                        </p>
                      </div>
                      <span className={`rounded-2xl bg-white/5 p-3 ${tone}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </Card>
                );

                return href ? (
                  <Link
                    key={key}
                    href={href}
                    className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    {card}
                  </Link>
                ) : (
                  <div key={key}>{card}</div>
                );
              })}
        </div>
      )}

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <Card className="rounded-[28px] border-palette-indigo-300-20 bg-gray-200 py-0 ring-0">
          <CardHeader className="border-b border-palette-indigo-300-20 px-6 py-5">
            <CardTitle className="text-lg font-extrabold">
              Top borrowed books
            </CardTitle>
            <CardDescription className="text-palette-slate-400">
              The books with the highest borrowing count in the library.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-3">
            {loading ? (
              <div className="space-y-3 py-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-white/5"
                  />
                ))}
              </div>
            ) : data?.topBorrowedBooks.length ? (
              <ol>
                {data.topBorrowedBooks.map((book, index) => (
                  <li
                    key={book.id}
                    className="flex items-center gap-4 border-b border-palette-indigo-300-20 py-4 last:border-0"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 font-mono text-xs font-bold text-palette-cyan-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {book.title}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-palette-slate-400">
                      {book.borrowCount.toLocaleString("en-US")} borrows
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-10 text-center text-sm text-palette-slate-400">
                Belum ada data peminjaman.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-palette-indigo-300-20 bg-gray-200 py-0 ring-0">
          <CardHeader className="border-b border-palette-indigo-300-20 px-6 py-5">
            <CardTitle className="text-lg font-extrabold">
              Quick actions
            </CardTitle>
            <CardDescription className="text-palette-slate-400">
              Jump into the areas that need attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-6 py-4">
            {[
              ["Manage users", "/admin/users"],
              ["Review loans", "/admin/loans"],
              ["Manage books", "/admin/books"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-xl border border-palette-indigo-300-20 bg-white/5 px-4 py-3 text-sm font-bold transition-colors hover:border-palette-cyan-300/60 hover:bg-cyan-300/5"
              >
                {label}
                <ArrowRight
                  className="size-4 text-palette-cyan-300"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[28px] border-palette-indigo-300-20 bg-gray-200 py-0 ring-0">
          <CardHeader className="border-b border-palette-indigo-300-20 px-6 py-5">
            <CardTitle className="text-lg font-extrabold">
              Author performance
            </CardTitle>
            <CardDescription className="text-palette-slate-400">
              Authors ranked by the size and rating of their catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-3">
            {loading ? (
              <div className="space-y-3 py-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-white/5"
                  />
                ))}
              </div>
            ) : authorStatistics.length ? (
              <ol>
                {authorStatistics.slice(0, 5).map((author, index) => (
                  <li
                    key={author.id}
                    className="flex items-center gap-3 border-b border-palette-indigo-300-20 py-3 last:border-0"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-400/10 font-mono text-[10px] font-bold text-violet-200">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {author.name}
                    </span>
                    <span className="shrink-0 text-right text-xs text-palette-slate-400">
                      {author.booksCount} books · ★{" "}
                      {author.averageBookRating.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-8 text-center text-sm text-palette-slate-400">
                Belum ada statistik author.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-palette-indigo-300-20 bg-gray-200 py-0 ring-0">
          <CardHeader className="border-b border-palette-indigo-300-20 px-6 py-5">
            <CardTitle className="text-lg font-extrabold">
              Category coverage
            </CardTitle>
            <CardDescription className="text-palette-slate-400">
              Number of books currently grouped in each category.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-10 animate-pulse rounded-xl bg-white/5"
                  />
                ))}
              </div>
            ) : categoryStatistics.length ? (
              <div className="space-y-3">
                {categoryStatistics.map((category) => {
                  const percentage = data?.books
                    ? Math.min(100, (category.booksCount / data.books) * 100)
                    : 0;
                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold">{category.name}</span>
                        <span className="text-palette-slate-400">
                          {category.booksCount} books
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-palette-slate-400">
                Belum ada statistik kategori.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
