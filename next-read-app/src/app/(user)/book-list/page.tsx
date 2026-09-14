import Image from "next/image";
import Link from "next/link";
import { Filter } from "lucide-react";

import { FavoriteButton } from "@/components/shared/favorite-button";
import { CartButton } from "@/components/shared/cart-button";
import bookIcon from "@/assets/icons/TrendingBook/Icon-1.svg";
import starIcon from "@/assets/icons/TrendingBook/Icon.svg";
import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { InlineErrorNotice } from "@/components/shared/inline-error-notice";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/error-message";
import { getBooks } from "@/services/books";
import { getCategories } from "@/services/categories";
import type { Book } from "@/types/book";
import type { FilterItem } from "@/types/filter";

const ratingValues = [5, 4, 3, 2, 1];
const BOOKS_PER_PAGE = 12;

type BookListPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    rating?: string | string[];
    search?: string | string[];
    page?: string | string[];
  }>;
};

const getParamValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const buildBookListHref = ({
  category,
  rating,
  search,
  page,
}: {
  category?: string;
  rating?: number;
  search?: string;
  page?: number;
}) => {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (rating) {
    params.set("rating", rating.toString());
  }

  if (search) {
    params.set("search", search);
  }

  if (page && page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();
  return queryString ? `/book-list?${queryString}` : "/book-list";
};

const getCategoryFilters = async ({
  selectedCategory,
  selectedRating,
  searchQuery,
}: {
  selectedCategory?: string;
  selectedRating?: number;
  searchQuery?: string;
}): Promise<FilterItem[]> => [
  {
    label: "All",
    active: !selectedCategory,
    href: buildBookListHref({
      rating: selectedRating,
      search: searchQuery,
    }),
  },
  ...(await getCategories()).map((category) => ({
    label: category.name,
    active: category.name === selectedCategory,
    href: buildBookListHref({
      category: category.name,
      rating: selectedRating,
      search: searchQuery,
    }),
  })),
];

const getRatingFilters = ({
  selectedCategory,
  selectedRating,
  searchQuery,
}: {
  selectedCategory?: string;
  selectedRating?: number;
  searchQuery?: string;
}): FilterItem[] => [
  {
    label: "All Rating",
    active: !selectedRating,
    href: buildBookListHref({
      category: selectedCategory,
      search: searchQuery,
    }),
  },
  ...ratingValues.map((rating) => ({
    label: `★ ${rating}`,
    active: rating === selectedRating,
    href: buildBookListHref({
      category: selectedCategory,
      rating: rating === selectedRating ? undefined : rating,
      search: searchQuery,
    }),
  })),
];

function FilterGroup({ title, items }: { title: string; items: FilterItem[] }) {
  return (
    <div className="space-y-5">
      <h3 className="text-base leading-6 font-extrabold text-palette-slate-50">
        {title}
      </h3>

      <div className="space-y-4">
        {items.map((item) => {
          const content = (
            <>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-md border border-palette-indigo-300-20 bg-secondary",
                  item.active && "border-skyblue bg-skyblue",
                )}
              >
                {item.active ? (
                  <span className="size-2 rounded-sm bg-card" />
                ) : null}
              </span>
              {item.label}
            </>
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              scroll={false}
              aria-current={item.active ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 text-[15px] leading-6 font-extrabold text-palette-slate-400 transition-colors hover:text-palette-cyan-300",
                item.active && "text-palette-slate-50",
              )}
            >
              {content}
            </Link>
          ) : (
            <label
              key={item.label}
              className="flex items-center gap-3 text-[15px] leading-6 font-extrabold text-palette-slate-400"
            >
              {content}
            </label>
          );
        })}
      </div>
    </div>
  );
}

async function BookFilterCard({
  selectedCategory,
  selectedRating,
  searchQuery,
}: {
  selectedCategory?: string;
  selectedRating?: number;
  searchQuery?: string;
}) {
  let categories: FilterItem[];
  let categoriesUnavailable = false;

  try {
    categories = await getCategoryFilters({
      selectedCategory,
      selectedRating,
      searchQuery,
    });
  } catch {
    categoriesUnavailable = true;
    categories = [
      {
        label: "All",
        active: !selectedCategory,
        href: buildBookListHref({
          rating: selectedRating,
          search: searchQuery,
        }),
      },
    ];
  }
  const ratings = getRatingFilters({
    selectedCategory,
    selectedRating,
    searchQuery,
  });

  return (
    <Card className="h-full min-h-[690px] rounded-[28px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 ring-0">
      <CardContent className="px-7 py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-menlo text-xs leading-4 font-bold tracking-[3.2px] text-skyblue uppercase">
            filter
          </p>
          <Filter className="size-5 text-skyblue" aria-hidden="true" />
        </div>

        <div className="pt-7">
          <FilterGroup title="Category" items={categories} />
          {categoriesUnavailable ? (
            <InlineErrorNotice
              title="Kategori belum dapat dimuat"
              message="Daftar kategori sedang tidak tersedia."
              className="pt-4 text-xs leading-5 text-amber-300"
            />
          ) : null}
        </div>

        <div className="my-10 h-px bg-palette-indigo-300-20" />

        <FilterGroup title="Rating" items={ratings} />
        <p className="pt-4 text-xs leading-5 text-palette-slate-400">
          Ratings are grouped by whole stars: 4 means 4.0–4.9. Click the
          selected rating again to clear it.
        </p>
      </CardContent>
    </Card>
  );
}

function BookCard({
  id,
  title,
  author,
  category,
  rating,
  coverUrl,
  coverClassName,
  availableCopies,
  isAvailable,
}: Book) {
  return (
    <Card className="relative h-full rounded-[28px] border border-palette-indigo-300-20 bg-palette-slate-900-80 p-0 py-0 shadow-none ring-0 transition-all duration-200 hover:border-palette-cyan-300 hover:bg-gray-800">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div
          className={cn(
            "relative aspect-[2/3] w-full overflow-hidden rounded-[18px] shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.3),_0px_4px_6px_-4px_rgba(0,_0,_0,_0.3)]",
            coverClassName,
          )}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`Cover ${title}`}
              fill
              unoptimized
              sizes="(min-width: 1280px) 270px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col justify-between p-5">
              <Image
                src={bookIcon}
                alt=""
                className="size-7"
                aria-hidden="true"
              />
              <h3 className="max-w-[150px] text-[22px] leading-6 font-extrabold text-white">
                {title}
              </h3>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <h4 className="text-[18px] leading-6 font-extrabold text-palette-slate-50">
            <Link
              href={`/books/${encodeURIComponent(id)}`}
              className="hover:text-skyblue after:absolute after:inset-0 after:z-10 after:rounded-[28px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-skyblue"
            >
              {title}
            </Link>
          </h4>
          <p className="pt-1 text-base leading-6 font-bold text-palette-slate-50/90">
            {author}
          </p>
          <p className="pt-1 text-base leading-6 font-medium text-palette-slate-400">
            {category}
          </p>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-gold">
              <Image
                src={starIcon}
                alt=""
                className="size-4"
                aria-hidden="true"
              />
              <b className="text-sm leading-5">{rating.toFixed(1)}</b>
            </div>
            <div className="flex items-center gap-2">
              <CartButton book={{ id, title, availableCopies, isAvailable }} />
              <FavoriteButton
                book={{
                  id,
                  title,
                  author,
                  category,
                  rating,
                  coverUrl,
                  coverClassName,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BookListPage({
  searchParams,
}: BookListPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = getParamValue(resolvedSearchParams?.category);
  const selectedRatingParam = getParamValue(resolvedSearchParams?.rating);
  const selectedRating = selectedRatingParam
    ? Number(selectedRatingParam)
    : undefined;
  const searchQuery = getParamValue(resolvedSearchParams?.search)?.trim();
  const requestedPage = Number(getParamValue(resolvedSearchParams?.page));
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let filteredBooks: Book[] = [];
  let totalPages = 0;
  let totalBooks = 0;
  let booksUnavailable = false;
  let booksErrorMessage = "";

  try {
    const booksResponse = await getBooks({
      category: selectedCategory,
      rating: selectedRating,
      search: searchQuery,
      page: currentPage,
      limit: BOOKS_PER_PAGE,
    });
    filteredBooks = booksResponse.data;
    totalPages = booksResponse.meta.totalPages;
    totalBooks = booksResponse.meta.total;
  } catch (error) {
    booksUnavailable = true;
    booksErrorMessage = getApiErrorMessage(error);
  }
  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : (selectedCategory ?? "Book List");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />

      <h1 className="pt-8 text-[30px] leading-9 font-extrabold">{pageTitle}</h1>

      <div className="grid items-start gap-6 pt-5 lg:grid-cols-[246px_1fr]">
        <BookFilterCard
          selectedCategory={selectedCategory}
          selectedRating={selectedRating}
          searchQuery={searchQuery}
        />

        <div>
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {booksUnavailable ? (
              <CatalogUnavailable
                title="Daftar buku belum dapat dimuat"
                message={booksErrorMessage}
                className="sm:col-span-2 lg:col-span-3 xl:col-span-5"
              />
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book) => <BookCard key={book.id} {...book} />)
            ) : (
              <Card className="rounded-[24px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 shadow-none ring-0 sm:col-span-2 lg:col-span-3 xl:col-span-5">
                <CardContent className="px-6 py-8 text-sm leading-6 text-palette-slate-400">
                  No books match your search yet.
                </CardContent>
              </Card>
            )}
          </section>

          {!booksUnavailable && totalPages > 1 ? (
            <nav
              aria-label="Book list pagination"
              className="flex flex-wrap items-center justify-center gap-2 pt-8"
            >
              {currentPage > 1 ? (
                <Link
                  href={buildBookListHref({
                    category: selectedCategory,
                    rating: selectedRating,
                    search: searchQuery,
                    page: currentPage - 1,
                  })}
                  className="pagination-button"
                >
                  Previous
                </Link>
              ) : null}

              <span className="px-3 text-sm text-palette-slate-400">
                Page {currentPage} of {totalPages} · {totalBooks} books
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildBookListHref({
                    category: selectedCategory,
                    rating: selectedRating,
                    search: searchQuery,
                    page: currentPage + 1,
                  })}
                  className="pagination-button pagination-button--primary"
                >
                  More
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>

      <div className="pt-14">
        <Footer />
      </div>
    </main>
  );
}
