"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartButton } from "@/components/shared/cart-button";
import { useCart } from "@/components/providers/cart-provider";
import { BookOpen, Star } from "lucide-react";
import type { BookDetail } from "@/services/books";
import type { Book } from "@/types/book";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { FavoriteButton } from "@/components/shared/favorite-button";

function Cover({ book, compact = false }: { book: Book; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={`relative aspect-[2/3] overflow-hidden rounded-2xl ${book.coverClassName}`}>
    {book.coverUrl && !failed ? <Image src={book.coverUrl} alt={`Cover ${book.title}`} fill unoptimized sizes="(min-width: 768px) 320px, 80vw" className="object-contain" onError={() => setFailed(true)} /> : <div className="flex h-full flex-col justify-between p-5 text-white"><BookOpen aria-hidden="true" /><div><p className={compact ? "text-sm font-extrabold leading-tight" : "text-2xl font-bold"}>{book.title}</p>{!compact && <p className="mt-3 text-sm">{book.author}</p>}</div></div>}
  </div>;
}

export function DetailContent({ book, related, relatedError }: { book: BookDetail; related: Book[]; relatedError: boolean }) {
  const [visible, setVisible] = useState(6);
  const router = useRouter();
  const { pending } = useCart();
  const unavailable = book.isAvailable === false || book.availableCopies <= 0;
  return <>
    <section className="grid gap-6 rounded-[28px] border border-border bg-card p-5 sm:p-6 md:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[310px] self-start rounded-[22px] bg-gradient-to-br from-emerald-50 to-slate-200 p-5"><Cover book={book} /></div>
      <div className="min-w-0 py-1"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-skyblue">{book.category}</span><h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{book.title}</h1><p className="mt-3 text-palette-slate-400">{book.author}</p><p className="mt-4 text-yellow-700 dark:text-yellow-400">★ {book.rating.toFixed(1)}</p>
        <dl className="my-6 flex gap-6 sm:gap-8">{[["Pages", book.pageCount ?? "—"], ["Available copies", book.availableCopies], ["Reviews", book.reviewCount]].map(([label,value]) => <div key={label} className="flex flex-col-reverse gap-1"><dt className="text-xs text-palette-slate-400">{label}</dt><dd className="text-xl font-extrabold">{value}</dd></div>)}</dl>
        <div className="border-t border-border pt-5"><h2 className="font-bold">Description</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-palette-slate-400">{book.description || "Deskripsi buku belum tersedia."}</p></div>
        <div className="mt-6 flex flex-wrap gap-3"><CartButton book={book} showLabel /><button type="button" onClick={() => router.push(`/checkout?bookId=${encodeURIComponent(book.id)}`)} disabled={pending.includes(book.id) || unavailable} className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-foreground transition-all duration-200 enabled:hover:bg-gradient-to-r enabled:hover:from-cyan-400 enabled:hover:to-violet-600 enabled:hover:shadow-[0_4px_16px_#22d3ee40] enabled:focus-visible:bg-gradient-to-r enabled:focus-visible:from-cyan-400 enabled:focus-visible:to-violet-600 enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-4 enabled:focus-visible:outline-cyan-300 enabled:active:scale-[0.98] enabled:active:bg-gradient-to-r enabled:active:from-cyan-400 enabled:active:to-violet-600 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none">{unavailable ? "Unavailable" : "Borrow Book"}</button></div>{unavailable && <p className="mt-3 text-xs text-palette-slate-400">Buku sedang tidak tersedia untuk dipinjam.</p>}
        <div className="mt-4"><FavoriteButton book={book} showLabel /></div>
      </div>
    </section>
    <section className="my-12 border-t border-border pt-8"><h2 className="text-2xl font-extrabold">Review</h2><p className="mt-3 text-sm">⭐ {book.rating.toFixed(1)} ({book.reviewCount} reviews)</p>
      {!book.reviews.length && <p className="py-6 text-palette-slate-400">Belum ada ulasan untuk buku ini.</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">{book.reviews.slice(0,visible).map(review => <article key={review.id} className="rounded-[22px] border border-border bg-card p-5"><div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 font-bold">{review.user.fullName.slice(0,2).toUpperCase()}</span><div><h3 className="text-sm font-bold">{review.user.fullName}</h3><time dateTime={review.createdAt} className="text-xs text-palette-slate-400">{new Intl.DateTimeFormat("en-GB", {dateStyle:"medium",timeZone:"UTC"}).format(new Date(review.createdAt))}</time></div></div><div className="my-3 flex gap-1 text-yellow-700 dark:text-yellow-400" aria-label={`${review.rating} out of 5 stars`}>{[1,2,3,4,5].map(n => <Star key={n} aria-hidden="true" className={`size-4 ${n <= review.rating ? "fill-current" : "opacity-30"}`} />)}</div>{review.comment && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-palette-slate-400">{review.comment}</p>}</article>)}</div>
      {visible < book.reviews.length && <div className="mt-6 text-center"><button onClick={() => setVisible(n => n+6)} className="rounded-full border border-border bg-secondary px-7 py-2 text-sm font-bold hover:bg-secondary">Load More</button></div>}
    </section>
    <section className="mb-12 border-t border-border pt-8"><h2 className="mb-6 text-2xl font-extrabold">Related Books</h2>{relatedError ? <CatalogUnavailable title="Buku terkait belum dapat dimuat" /> : related.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{related.map(item => <Link key={item.id} href={`/books/${encodeURIComponent(item.id)}`} className="min-w-0 rounded-[20px] border border-border bg-card p-3 transition-colors hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"><Cover book={item} compact /><h3 className="mt-3 text-sm font-bold">{item.title}</h3><p className="mt-2 text-xs text-palette-slate-400">{item.author}</p><p className="mt-3 text-xs text-yellow-700 dark:text-yellow-400">★ {item.rating.toFixed(1)}</p></Link>)}</div> : <p className="text-palette-slate-400">Belum ada buku lain dalam kategori ini.</p>}</section>
  </>;
}
