import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminBookCreateForm } from "@/components/admin/admin-book-create-form";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { Card, CardContent } from "@/components/ui/card";
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
          title="Add Book form could not be loaded"
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
      <Card className="mt-7 rounded-[28px] border border-palette-indigo-300-20 py-0 shadow-[0_28px_70px_-32px_rgba(0,0,0,0.65)]">
        <CardContent className="p-5 sm:p-8">
          <AdminBookCreateForm authors={authors} categories={categories} />
        </CardContent>
      </Card>
    </main>
  );
}
