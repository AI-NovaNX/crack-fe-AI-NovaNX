"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import { useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, LoaderCircle } from "lucide-react";
import type { Book } from "@/types/book";
import type { SessionUser } from "@/lib/auth";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";

type Checkout = {
  user: SessionUser & { phone?: string };
  items: { id: number | string; book: Book }[];
};
const adminBorrowMessage =
  "Admin accounts cannot borrow books. Use a user account to borrow books.";
const panel =
  "rounded-[20px] border border-border bg-card p-3.5 shadow-[0_20px_40px_-24px_#00000080] sm:rounded-[24px] sm:p-6";
const action =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-6 py-3 text-sm font-extrabold text-white shadow-[0_6px_20px_#22d3ee25] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-skyblue";
const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const selectedItemsParam = searchParams.get("items");
  const selectedItemsKey = selectedItemsParam ?? "";
  const directBookId = searchParams.get("bookId")?.trim() ?? "";
  const [data, setData] = useState<Checkout | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "login" | "admin" | "error" | "success"
  >("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [borrowDate, setBorrowDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(3);
  const [returnAgreement, setReturnAgreement] = useState(false);
  const [policyAgreement, setPolicyAgreement] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const checkoutUrl = directBookId
          ? `/api/checkout?bookId=${encodeURIComponent(directBookId)}`
          : selectedItemsParam !== null
            ? `/api/checkout?items=${encodeURIComponent(selectedItemsParam)}`
            : "/api/checkout";
        const response = await fetch(checkoutUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json();
        if (response.status === 401) {
          setStatus("login");
          return;
        }
        if (!response.ok)
          throw new Error(body.message || "Checkout belum dapat dimuat.");
        if (body.user?.role && body.user.role.toLowerCase() === "admin") {
          setStatus("admin");
          return;
        }
        setData(body);
        setBorrowDate(new Date());
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error ? error.message : "Periksa koneksi Anda.",
        );
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt, directBookId, selectedItemsKey, selectedItemsParam]);

  async function confirmBorrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || !returnAgreement || !policyAgreement) return;
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationDays: duration,
          returnAgreement,
          policyAgreement,
          ...(directBookId
            ? { bookId: directBookId }
            : { itemIds: data?.items.map((item) => item.id) }),
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.message || "Peminjaman belum berhasil. Silakan coba kembali.",
        );
      setStatus("success");
      if (!directBookId)
        window.dispatchEvent(new Event("nexread-cart-changed"));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Periksa koneksi Anda lalu coba kembali.",
      );
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  if (status === "loading")
    return (
      <div role="status" className={`${panel} min-h-64 animate-pulse`}>
        Memuat checkout…
      </div>
    );
  if (status === "error")
    return (
      <CatalogUnavailable
        title="Checkout belum dapat dimuat"
        message={error}
        onRetry={() => {
          setStatus("loading");
          setAttempt((n) => n + 1);
        }}
      />
    );
  if (status === "login")
    return (
      <section className={`${panel} text-center`}>
        <h2 className="text-xl font-bold">Login untuk melanjutkan checkout</h2>
        <Link href="/login" className={`${action} mt-6`}>
          Login
        </Link>
      </section>
    );
  if (status === "admin")
    return (
      <section className={`${panel} text-center`}>
        <h2 className="text-xl font-bold">Peminjaman tidak tersedia</h2>
        <p className="mt-3 text-palette-slate-400">{adminBorrowMessage}</p>
        <Link href="/admin/dashboard" className={`${action} mt-6`}>
          Kembali ke Admin
        </Link>
      </section>
    );
  if (status === "success")
    return (
      <section role="status" className={`${panel} text-center`}>
        <CheckCircle2
          className="mx-auto mb-4 size-12 text-skyblue"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-extrabold">Peminjaman berhasil!</h2>
        <p className="mt-3 text-palette-slate-400">
          {data?.items.length} buku berhasil dipinjam selama {duration} hari.
        </p>
        <Link href="/book-list" className={`${action} mt-6`}>
          Browse Books
        </Link>
      </section>
    );
  if (!data?.items.length)
    return (
      <section className={`${panel} text-center`}>
        <BookOpen
          className="mx-auto mb-4 size-10 text-skyblue"
          aria-hidden="true"
        />
        <h2 className="text-xl font-bold">Belum ada buku untuk dipinjam</h2>
        <p className="mt-3 text-palette-slate-400">
          Tambahkan buku ke keranjang untuk melanjutkan checkout.
        </p>
        <Link href="/book-list" className={`${action} mt-6`}>
          Browse Books
        </Link>
      </section>
    );
  const dueDate = new Date(borrowDate!);
  dueDate.setDate(dueDate.getDate() + duration);

  return (
    <div className="space-y-7">
      <section className={panel} aria-labelledby="user-information">
        <h2 id="user-information" className="text-lg font-extrabold">
          User Information
        </h2>
        <dl className="mt-4 max-w-[600px] space-y-2.5 text-xs sm:mt-6 sm:space-y-4 sm:text-sm">
          {[
            ["Name", data.user.fullName],
            ["Email", data.user.email],
            ["Nomor Handphone", data.user.phone || "Belum ditambahkan"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4"
            >
              <dt className="text-palette-slate-400">{label}</dt>
              <dd className="break-words text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="my-5 max-w-[600px] border-t border-border sm:my-7" />
        <h2 className="text-base font-extrabold sm:text-lg">Book List</h2>
        <ul className="mt-4 space-y-5 sm:mt-6 sm:space-y-7">
          {data.items.map(({ id, book }) => (
            <BookHoverCard as="li" unstyled key={id}>
              <Link
                href={`/books/${encodeURIComponent(book.id)}`}
                className="flex w-fit max-w-full items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-skyblue sm:gap-5"
              >
                <div className="w-12 shrink-0 sm:w-14">
                  <AnimatedBook {...book} />
                </div>
                <div className="min-w-0">
                  <span className="inline-block rounded-full border border-skyblue/10 bg-skyblue/10 px-2 py-0.5 text-[9px] font-semibold text-skyblue sm:px-3 sm:py-1 sm:text-xs">
                    {book.category}
                  </span>
                  <h3 className="mt-1 break-words text-xs font-extrabold sm:mt-3 sm:text-base">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-[10px] text-palette-slate-400 sm:mt-2 sm:text-sm">
                    {book.author}
                  </p>
                </div>
              </Link>
            </BookHoverCard>
          ))}
        </ul>
      </section>
      <section className={panel} aria-labelledby="borrow-request">
        <h2 id="borrow-request" className="text-base font-extrabold sm:text-lg">
          Complete Your Borrow Request
        </h2>
        <form onSubmit={confirmBorrow} className="mt-4 sm:mt-6">
          <label
            htmlFor="borrow-date"
            className="mb-2 block text-xs font-semibold sm:text-sm"
          >
            Borrow Date
          </label>
          <input
            id="borrow-date"
            readOnly
            value={borrowDate ? formatDate(borrowDate) : ""}
            className="w-full rounded-full border border-border bg-secondary px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-skyblue sm:px-4 sm:py-3 sm:text-sm"
          />
          <fieldset
            disabled={submitting}
            className="mt-5 space-y-2 sm:mt-6 sm:space-y-3"
          >
            <legend className="mb-2 text-xs font-semibold sm:mb-3 sm:text-sm">
              Borrow Duration
            </legend>
            {[3, 5, 10].map((days) => (
              <label
                key={days}
                className="flex w-fit cursor-pointer items-center gap-2 text-xs text-palette-slate-400 sm:gap-3 sm:text-sm"
              >
                <input
                  type="radio"
                  name="duration"
                  value={days}
                  checked={duration === days}
                  onChange={() => setDuration(days)}
                  className="size-3.5 accent-violet-500 sm:size-4"
                />
                {days} Days
              </label>
            ))}
          </fieldset>
          <div
            aria-live="polite"
            className="mt-5 rounded-xl border border-skyblue/15 bg-skyblue/[0.13] p-3 sm:mt-6 sm:rounded-2xl sm:p-4"
          >
            <h3 className="text-xs font-bold sm:text-sm">Return Date</h3>
            <p className="mt-1 text-[10px] leading-5 text-palette-slate-400 sm:mt-2 sm:text-sm sm:leading-6">
              Please return the book no later than{" "}
              <strong className="text-fuchsia-700 dark:text-fuchsia-300">
                {formatDate(dueDate)}
              </strong>
            </p>
          </div>
          <div className="my-4 space-y-2 text-[10px] text-palette-slate-400 sm:my-5 sm:space-y-3 sm:text-sm">
            <label className="flex cursor-pointer items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                required
                disabled={submitting}
                checked={returnAgreement}
                onChange={(event) => setReturnAgreement(event.target.checked)}
                className="mt-0.5 size-3.5 shrink-0 accent-violet-500 sm:size-4"
              />
              I agree to return the book(s) before the due date.
            </label>
            <label className="flex cursor-pointer items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                required
                disabled={submitting}
                checked={policyAgreement}
                onChange={(event) => setPolicyAgreement(event.target.checked)}
                className="mt-0.5 size-3.5 shrink-0 accent-violet-500 sm:size-4"
              />
              I accept the library borrowing policy.
            </label>
          </div>
          {error && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className={`${action} w-full disabled:cursor-wait disabled:opacity-60`}
          >
            {submitting && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {submitting ? "Processing…" : "Confirm & Borrow"}
          </button>
        </form>
      </section>
    </div>
  );
}
