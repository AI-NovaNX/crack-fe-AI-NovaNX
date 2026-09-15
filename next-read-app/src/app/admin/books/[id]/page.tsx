import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBookDetail } from "@/components/admin/admin-book-detail";
import { Footer } from "@/components/layout/footer";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { getApiErrorMessage } from "@/lib/error-message";
import { getBookDetail, getBooks } from "@/services/books";
import type { Book } from "@/types/book";

export default async function AdminBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let book;
  try {
    book = await getBookDetail(id);
  } catch (error) {
    return (
      <main className="mx-auto w-full max-w-[1120px] px-5 pb-8 sm:px-8">
        <CatalogUnavailable
          title="Detail buku belum dapat dimuat"
          message={getApiErrorMessage(error)}
        />
      </main>
    );
  }
  if (!book) notFound();

  let related: Book[] = [];
  let relatedError = false;
  try {
    related = (await getBooks({ category: book.category, limit: 6 })).data
      .filter((item) => item.id !== id)
      .slice(0, 5);
  } catch {
    relatedError = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 pb-8 font-outfit text-palette-slate-50 sm:px-8">
      <nav
        aria-label="Breadcrumb"
        className="my-7 flex flex-wrap gap-2 text-sm text-palette-slate-400"
      >
        <Link href="/admin/dashboard" className="text-skyblue">
          Admin
        </Link>
        <span>›</span>
        <Link href="/admin/books" className="text-skyblue">
          Book List
        </Link>
        <span>›</span>
        <span aria-current="page">{book.title}</span>
      </nav>
      <AdminBookDetail
        key={id}
        book={book}
        related={related}
        relatedError={relatedError}
      />
      <Footer />
    </main>
  );
}
