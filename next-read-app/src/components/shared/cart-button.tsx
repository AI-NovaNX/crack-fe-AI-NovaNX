"use client";

import { Check, LoaderCircle, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/app-feedback-provider";
import type { Book } from "@/types/book";

export function CartButton({
  book,
  showLabel = false,
}: {
  book: Pick<Book, "id" | "title" | "availableCopies" | "isAvailable">;
  showLabel?: boolean;
}) {
  const { items, pending, status, isAdmin, add } = useCart();
  const router = useRouter();
  const toast = useToast();
  const exists = items.some((item) => item.book.id === book.id);
  const busy = pending.includes(book.id);
  const unavailable =
    !exists &&
    (book.isAvailable === false ||
      (book.availableCopies !== undefined && book.availableCopies <= 0));
  const label = isAdmin
    ? "Admins cannot borrow books"
    : busy
      ? "Menambahkan buku…"
      : exists
        ? "Sudah di cart — buka My Cart"
        : unavailable
          ? "Buku tidak tersedia"
          : "Tambahkan ke cart";
  return (
    <button
      type="button"
      title={label}
      aria-label={`${label}: ${book.title}`}
      aria-busy={busy || status === "loading"}
      disabled={isAdmin || busy || unavailable || status === "loading"}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (exists) {
          router.push("/cart");
          return;
        }
        try {
          const result = await add(book.id);
          if (result === "guest") {
            toast({
              title: "Silakan login untuk menambahkan buku",
              variant: "info",
            });
            router.push("/login");
          } else if (result === "existing") router.push("/cart");
          else if (result === "added")
            toast({
              title: "Buku ditambahkan ke keranjang",
              description: book.title,
              variant: "success",
            });
        } catch (error) {
          toast({
            title: "Gagal menambahkan buku",
            description:
              error instanceof Error
                ? error.message
                : "Periksa koneksi Anda lalu coba kembali.",
            variant: "error",
          });
        }
      }}
      className={`relative z-20 inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-palette-indigo-300-20 bg-card text-palette-slate-50 transition-colors enabled:hover:border-skyblue enabled:hover:text-skyblue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyblue disabled:cursor-not-allowed disabled:opacity-40 ${showLabel ? "px-6 py-2.5 text-sm font-bold" : "size-9"}`}
    >
      {busy || status === "loading" ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : exists ? (
        <Check className="size-4 text-skyblue" aria-hidden="true" />
      ) : (
        <ShoppingCart className="size-4" aria-hidden="true" />
      )}
      {showLabel &&
        (isAdmin
          ? "Admins cannot borrow"
          : busy
            ? "Adding…"
            : exists
              ? "View Cart"
              : unavailable
                ? "Unavailable"
                : "Add to Cart")}
    </button>
  );
}
