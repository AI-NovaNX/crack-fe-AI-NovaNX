"use client";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import type { Book } from "@/types/book";


export function FavoritesList() {
  const { books, status, error, retry } = useFavorites();
  const [query, setQuery] = useState("");
  if (status === "loading") return <div role="status" className="mt-7 h-64 animate-pulse rounded-3xl bg-secondary p-6">Loading favorites…</div>;
  if (status === "error") return <div className="mt-7"><CatalogUnavailable title="Favorites could not be loaded" message={error} onRetry={retry} /></div>;
  if (status === "guest") return <div className="my-10 rounded-3xl border border-border bg-secondary p-10 text-center"><h2 className="text-xl font-bold">Login to save your favorite books</h2><Link href="/login" className="mt-5 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-8 py-3 font-bold">Login</Link></div>;
  const filtered = books.filter(book => [book.title, book.author, book.category].some(text => text.toLowerCase().includes(query.trim().toLowerCase())));
  return <><p className="mt-4 text-xs text-palette-slate-400">Favorites are saved in this browser for your account.</p>{!books.length ? <div className="my-8 rounded-3xl border border-border bg-secondary p-12 text-center"><Heart className="mx-auto mb-4 size-10 text-pink-400" aria-hidden="true" /><h2 className="text-xl font-bold">No favorite books yet</h2><p className="mt-3 text-palette-slate-400">Click the heart icon on a book to save it here.</p><Link href="/book-list" className="mt-6 inline-block rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-7 py-3 font-bold">Browse Books</Link></div> : <><label htmlFor="favorites-search" className="sr-only">Search favorite books</label><input id="favorites-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, author, or category…" className="mt-6 w-full rounded-full border border-border bg-secondary px-5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-skyblue" /><p aria-live="polite" className="my-5 text-sm text-palette-slate-400">{filtered.length} of {books.length} favorite books</p>{!filtered.length && <p className="py-12 text-center">No books match your search.</p>}<ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(book => <BookHoverCard as="li" unstyled key={book.id} className="relative rounded-3xl border border-border bg-card p-4"><AnimatedBook {...book} /><Link href={`/books/${encodeURIComponent(book.id)}`} className="mt-4 block font-extrabold after:absolute after:inset-0 after:z-10 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-skyblue">{book.title}</Link><p className="mt-2 text-sm text-palette-slate-400">{book.author}</p><p className="mt-1 text-xs text-skyblue">{book.category}</p><div className="mt-4 flex items-center justify-between"><span className="text-sm text-yellow-700 dark:text-yellow-400">★ {book.rating.toFixed(1)}</span><FavoriteButton book={book} /></div></BookHoverCard>)}</ul></>}</>;
}
