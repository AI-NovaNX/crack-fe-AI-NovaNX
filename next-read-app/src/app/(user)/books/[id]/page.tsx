import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { getBookDetail, getBooks } from "@/services/books";
import { getApiErrorMessage } from "@/lib/error-message";
import { DetailContent } from "@/components/shared/detail-content";
import type { Book } from "@/types/book";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let book;
  try { book = await getBookDetail(id); }
  catch (error) { return <main className="mx-auto max-w-[1120px] space-y-8 px-5 py-7"><AppNav /><CatalogUnavailable title="Detail buku belum dapat dimuat" message={getApiErrorMessage(error)} /><Footer /></main>; }
  if (!book) notFound();
  let related: Book[] = [];
  let relatedError = false;
  try { related = (await getBooks({ category: book.category, limit: 6 })).data.filter(item => item.id !== id).slice(0,5); }
  catch { relatedError = true; }
  return <main className="mx-auto max-w-[1120px] px-5 py-7 font-outfit text-palette-slate-50 sm:px-8">
    <AppNav />
    <nav aria-label="Breadcrumb" className="my-7 flex flex-wrap gap-2 text-sm text-palette-slate-400"><Link href="/" className="text-skyblue">Home</Link><span>›</span><Link className="text-skyblue" href={`/book-list?category=${encodeURIComponent(book.category)}`}>{book.category}</Link><span>›</span><span aria-current="page">{book.title}</span></nav>
    <DetailContent key={id} book={book} related={related} relatedError={relatedError} />
    <Footer />
  </main>;
}
