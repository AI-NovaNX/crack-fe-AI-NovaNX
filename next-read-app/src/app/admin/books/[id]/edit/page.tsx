import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminBookEditForm } from "@/components/admin/admin-book-edit-form";
import { getAuthors } from "@/services/authors";
import { getBookDetail } from "@/services/books";

export default async function AdminBookEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book, authorsResponse] = await Promise.all([
    getBookDetail(id),
    getAuthors({ page: 1, limit: 100 }),
  ]);
  if (!book) notFound();
  const authors = authorsResponse.data.map(({ id, name }) => ({ id, name }));

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 pb-12 font-outfit text-palette-slate-50 sm:px-8">
      <nav
        aria-label="Breadcrumb"
        className="my-7 flex flex-wrap gap-2 text-sm text-palette-slate-400"
      >
        <Link href="/admin/books" className="text-skyblue">
          Book List
        </Link>
        <span>›</span>
        <Link
          href={`/admin/books/${encodeURIComponent(id)}`}
          className="text-skyblue"
        >
          {book.title}
        </Link>
        <span>›</span>
        <span aria-current="page">Edit</span>
      </nav>
      <p className="font-mono text-[9px] tracking-[0.28em] text-palette-cyan-300 uppercase">
        Administration / Collection
      </p>
      <h1 className="mt-2 mb-6 text-2xl font-extrabold sm:text-3xl">
        Edit Book
      </h1>
      <AdminBookEditForm book={book} authors={authors} />
    </main>
  );
}
