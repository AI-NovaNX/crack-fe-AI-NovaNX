import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminBookCreateForm } from "@/components/admin/admin-book-create-form";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { getApiErrorMessage } from "@/lib/error-message";
import { getAuthors } from "@/services/authors";
import { getCategories } from "@/services/categories";

export default async function AdminAddBookPage() {
  let authors: Array<{ id: string; name: string }> = [];
  let categories: Array<{ id: string; name: string }> = [];
  let loadError: unknown;

  try {
    const [authorsResponse, categoryResponse] = await Promise.all([
      getAuthors({ page: 1, limit: 100 }),
      getCategories(),
    ]);
    authors = authorsResponse.data.map(({ id, name }) => ({ id, name }));
    categories = categoryResponse.map(({ id, name }) => ({ id, name }));
  } catch (error) {
    loadError = error;
  }

  if (loadError) {
    return (
      <main className="mx-auto w-full max-w-[760px] px-5 py-8 sm:px-8">
        <CatalogUnavailable
          title="Form Add Book belum dapat dimuat"
          message={getApiErrorMessage(loadError)}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-14 font-outfit text-palette-slate-50 sm:px-8">
      <Link
        href="/admin/books"
        className="mt-7 inline-flex items-center gap-3 text-2xl font-extrabold transition-colors hover:text-palette-cyan-300"
      >
        <ArrowLeft className="size-6" aria-hidden="true" />
        Add Book
      </Link>
      <section className="mt-7 rounded-[28px] border border-palette-indigo-300-20 bg-card p-5 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.65)] sm:p-8">
        <AdminBookCreateForm authors={authors} categories={categories} />
      </section>
    </main>
  );
}
