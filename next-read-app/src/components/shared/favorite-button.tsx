"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Book } from "@/types/book";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useToast } from "@/components/providers/app-feedback-provider";

export function FavoriteButton({ book, showLabel = false }: { book: Book; showLabel?: boolean }) {
  const { books, status, toggle } = useFavorites();
  const router = useRouter();
  const toast = useToast();
  const saved = books.some(item => item.id === book.id);
  const label = saved ? "Remove from favorites" : "Add to favorites";
  return <button type="button" aria-label={`${label}: ${book.title}`} aria-pressed={saved} title={label} disabled={status === "loading"} onClick={event => {
    event.preventDefault(); event.stopPropagation();
    if (status === "guest") { router.push("/login"); return; }
    try { toggle(book); toast({ title: saved ? "Book removed from favorites" : "Book added to favorites", description: book.title, variant: "success" }); }
    catch (e) { toast({ title: "Favorite could not be updated", description: e instanceof Error ? e.message : "Browser storage is unavailable.", variant: "error" }); }
  }} className={`relative z-20 inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-palette-indigo-300-20 bg-card text-palette-slate-50 transition-colors hover:border-pink-400 hover:text-pink-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyblue disabled:opacity-40 ${showLabel ? "px-5 py-2.5 text-sm font-bold" : "size-9"}`}><Heart className={`size-4 ${saved ? "fill-pink-400 text-pink-400" : ""}`} aria-hidden="true" />{showLabel && (saved ? "Favorited" : "Favorite")}</button>;
}
