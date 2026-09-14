import Image from "next/image";
import Link from "next/link";

import { FavoriteButton } from "@/components/shared/favorite-button";
import { CartButton } from "@/components/shared/cart-button";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import starIcon from "@/assets/icons/TrendingBook/Icon.svg";
import { CardContent } from "@/components/ui/card";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { getApiErrorMessage } from "@/lib/error-message";
import { getRecommendedBooks } from "@/services/books";
import type { Book } from "@/types/book";

function RecommendedBookCard({
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
    <BookHoverCard className="relative h-full rounded-[28px] border border-palette-indigo-300-20 bg-palette-slate-900-80 p-0 py-0 font-outfit shadow-none ring-0 transition-all duration-200 hover:border-palette-cyan-300 hover:bg-gray-800">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <AnimatedBook title={title} author={author} coverUrl={coverUrl} coverClassName={coverClassName} />

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
    </BookHoverCard>
  );
}

const RECOMMENDATIONS_PER_PAGE = 5;

export async function RecommendedForYou({ page = 1 }: { page?: number }) {
  let recommendedBooks: Book[];
  let totalPages = 0;
  let totalRecommendations = 0;

  try {
    const response = await getRecommendedBooks(page, RECOMMENDATIONS_PER_PAGE);
    recommendedBooks = response.data;
    totalPages = response.meta.totalPages;
    totalRecommendations = response.meta.total;
  } catch (error) {
    return (
      <section className="w-full py-10">
        <CatalogUnavailable
          title="Rekomendasi buku belum dapat dimuat"
          message={getApiErrorMessage(error)}
          className="min-h-[260px]"
        />
      </section>
    );
  }

  return (
    <section
      id="recommended"
      className="w-full scroll-mt-6 py-10 text-left font-menlo text-[12px] text-skyblue"
    >
      <div className="flex w-full items-end justify-between gap-5">
        <div className="flex max-w-[520px] flex-col items-start">
          <p className="tracking-[2.88px] leading-4 uppercase">
            recommendation
          </p>
          <h2 className="pt-1 font-outfit text-[30px] leading-9 font-extrabold text-palette-slate-50">
            Recommended for you
          </h2>
        </div>

        <Link
          href="/book-list"
          className="rounded-full border border-palette-indigo-300-20 px-6 py-2 font-outfit text-sm leading-5 text-palette-slate-50 transition-colors hover:border-palette-cyan-300 hover:text-palette-cyan-300"
        >
          View all
        </Link>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {recommendedBooks.map((book) => (
          <RecommendedBookCard key={book.id} {...book} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Recommended books pagination"
          className="flex flex-wrap items-center justify-center gap-2 pt-8 font-outfit"
        >
          {page > 1 ? (
            <Link
              href={`/?recommendPage=${page - 1}#recommended`}
              className="pagination-button"
            >
              Previous
            </Link>
          ) : null}

          <span className="px-3 text-sm text-palette-slate-400">
            Page {page} of {totalPages} · {totalRecommendations} recommendations
          </span>

          {page < totalPages ? (
            <Link
              href={`/?recommendPage=${page + 1}#recommended`}
              className="pagination-button pagination-button--primary"
            >
              More
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
