import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { getApiErrorMessage } from "@/lib/error-message";
import { getCategories } from "@/services/categories";
import type { Category } from "@/types/category";

function CategoryCard({ id, name, subtitle, icon }: Category) {
  return (
    <Link
      href={{
        pathname: "/book-list",
        query: { category: id },
      }}
      className="min-w-[168px] flex-1"
      aria-label={`View ${name} books`}
    >
      <Card className="h-[182px] justify-center rounded-3xl border border-palette-indigo-300-20 bg-palette-slate-900-80 p-0 py-0 shadow-none ring-0 transition-all duration-200 hover:border-palette-cyan-300 hover:bg-gray-800">
        <CardContent className="flex h-full flex-col justify-center px-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-palette-cyan-300-10">
            <Image src={icon} alt="" className="size-6" aria-hidden="true" />
          </div>

          <div className="pt-5">
            <h2 className="max-w-[136px] text-base leading-6 font-bold text-palette-slate-50">
              {name}
            </h2>
            <p className="max-w-[136px] text-sm leading-5 font-medium text-palette-slate-400">
              {subtitle}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export async function BookCategory() {
  let categories: Category[];
  let errorMessage = "";

  try {
    categories = await getCategories();
  } catch (error) {
    errorMessage = getApiErrorMessage(error);
    return (
      <section className="w-full pt-6" aria-label="Book categories">
        <CatalogUnavailable
          title="Kategori belum dapat dimuat"
          message={errorMessage}
        />
      </section>
    );
  }

  return (
    <section className="w-full pt-6" aria-label="Book categories">
      <div className="flex w-full flex-wrap gap-3 xl:flex-nowrap">
        {categories.map((category) => (
          <CategoryCard key={category.id} {...category} />
        ))}
      </div>
    </section>
  );
}
