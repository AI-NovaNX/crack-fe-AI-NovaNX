"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, LoaderCircle } from "lucide-react";
import type { Book } from "@/types/book";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { useToast } from "@/components/providers/app-feedback-provider";

type CartItem = { id: number; book: Book };

export function CartContent() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "login" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const selectAll = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const deleting = useRef(new Set<number>());
  const [removing, setRemoving] = useState<number[]>([]);
  async function removeItem(item: CartItem) {
    if (deleting.current.has(item.id)) return;
    deleting.current.add(item.id);
    setRemoving((ids) => [...ids, item.id]);
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message || "Item belum dapat dihapus.");
      setItems((items) => items.filter((current) => current.id !== item.id));
      setSelected((ids) => ids.filter((id) => id !== item.id));
      window.dispatchEvent(new Event("nexread-cart-changed"));
      toast({
        title: "Buku dihapus dari keranjang",
        description: item.book.title,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Gagal menghapus item",
        description:
          error instanceof Error
            ? error.message
            : "Periksa koneksi Anda lalu coba kembali.",
        variant: "error",
      });
    } finally {
      deleting.current.delete(item.id);
      setRemoving((ids) => ids.filter((id) => id !== item.id));
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/cart", {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = await response.json();
        if (response.status === 401) {
          setStatus("login");
          return;
        }
        if (!response.ok)
          throw new Error(body.message || "Keranjang belum dapat dimuat.");
        setItems(body);
        setSelected([]);
        setStatus("ready");
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Periksa koneksi Anda.");
        setStatus("error");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    if (selectAll.current)
      selectAll.current.indeterminate =
        selected.length > 0 && selected.length < items.length;
  }, [selected, items]);
  if (status === "loading")
    return (
      <div
        role="status"
        className="h-64 animate-pulse rounded-[28px] border border-border bg-secondary p-8"
      >
        Memuat keranjang…
      </div>
    );
  if (status === "error")
    return (
      <CatalogUnavailable
        title="Keranjang belum dapat dimuat"
        message={error}
        onRetry={() => {
          setStatus("loading");
          setAttempt((n) => n + 1);
        }}
      />
    );
  if (status === "login")
    return (
      <div className="rounded-[28px] border border-border bg-secondary p-10 text-center">
        <h2 className="text-xl font-bold">
          Login untuk melihat keranjang Anda
        </h2>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-8 py-3 font-bold"
        >
          Login
        </Link>
      </div>
    );
  if (!items.length)
    return (
      <div className="rounded-[28px] border border-border bg-secondary p-12 text-center">
        <ShoppingCart
          className="mx-auto mb-4 size-10 text-skyblue"
          aria-hidden="true"
        />
        <h2 className="text-xl font-bold">Keranjang Anda masih kosong</h2>
        <p className="mt-3 text-palette-slate-400">
          Temukan buku yang ingin Anda baca.
        </p>
        <Link
          href="/book-list"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-8 py-3 font-bold"
        >
          Browse Books
        </Link>
      </div>
    );
  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_181px] md:gap-[18px]">
      <section
        aria-label="Books in cart"
        className="rounded-[20px] border border-border bg-gradient-to-br from-card to-secondary px-4 py-4"
      >
        <label className="flex cursor-pointer items-center gap-2 pb-3 text-[10px] font-bold">
          <input
            ref={selectAll}
            type="checkbox"
            className="size-3 accent-violet-500"
            checked={selected.length === items.length}
            onChange={(e) =>
              setSelected(e.target.checked ? items.map((i) => i.id) : [])
            }
          />
          Select All
        </label>
        <ul className="divide-y divide-white/10 border-t border-border">
          {items.map((item) => (
            <BookHoverCard as="li" unstyled key={item.id} className="flex items-start gap-2 py-3">
              <input
                type="checkbox"
                aria-label={`Select ${item.book.title}`}
                className="mt-1 size-3 shrink-0 accent-violet-500"
                checked={selected.includes(item.id)}
                onChange={(e) =>
                  setSelected((ids) =>
                    e.target.checked
                      ? [...ids, item.id]
                      : ids.filter((id) => id !== item.id),
                  )
                }
              />
              <Link
                href={`/books/${encodeURIComponent(item.book.id)}`}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-skyblue"
              >
                <div className="w-[50px] shrink-0"><AnimatedBook {...item.book} /></div>
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[8px] font-bold text-skyblue">
                    {item.book.category}
                  </span>
                  <h2 className="mt-2 break-words text-[10px] font-extrabold">
                    {item.book.title}
                  </h2>
                  <p className="mt-1 text-[9px] text-palette-slate-400">
                    {item.book.author}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => removeItem(item)}
                disabled={removing.includes(item.id)}
                aria-label={`Hapus ${item.book.title} dari keranjang`}
                title="Hapus dari keranjang"
                aria-busy={removing.includes(item.id)}
                className="flex size-6 shrink-0 items-center justify-center self-center rounded-full text-palette-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-wait disabled:opacity-50"
              >
                {removing.includes(item.id) ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </BookHoverCard>
          ))}
        </ul>
      </section>
      <aside className="rounded-[20px] border border-border bg-gradient-to-br from-card to-secondary p-4 md:sticky md:top-4">
        <h2 className="text-sm font-extrabold">Loan Summary</h2>
        <div className="my-5 flex justify-between gap-2 text-[10px]">
          <span className="text-palette-slate-400">Total Book</span>
          <span aria-live="polite" className="font-bold">
            {selected.length} {selected.length === 1 ? "Item" : "Items"}
          </span>
        </div>
        <button
          disabled={!selected.length}
          onClick={() => router.push(`/checkout?items=${selected.join(",")}`)}
          className="w-full rounded-full bg-secondary px-3 py-2 text-[10px] font-bold text-foreground transition-all duration-200 enabled:hover:bg-gradient-to-r enabled:hover:from-cyan-400 enabled:hover:to-violet-600 enabled:hover:shadow-[0_4px_16px_#22d3ee40] enabled:focus-visible:bg-gradient-to-r enabled:focus-visible:from-cyan-400 enabled:focus-visible:to-violet-600 enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-4 enabled:focus-visible:outline-cyan-300 enabled:active:scale-[0.98] enabled:active:bg-gradient-to-r enabled:active:from-cyan-400 enabled:active:to-violet-600 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none"
        >
          Borrow Book
        </button>
        <p className="sr-only">Peminjaman buku pilihan belum tersedia.</p>
      </aside>
    </div>
  );
}
