import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { FavoriteAuthorButton } from "@/components/shared/favorite-author-button";
import { getApiErrorMessage } from "@/lib/error-message";
import { getPopularAuthors } from "@/services/authors";
import type { Author } from "@/types/author";

function formatBorrowCount(count: number) {
  if (count < 1000) {
    return count.toString();
  }

  const compactCount = count / 1000;
  return `${Number.isInteger(compactCount) ? compactCount : compactCount.toFixed(1)}K`;
}

function PopularAuthorCard({
  id,
  name,
  booksCount,
  borrowedBooksCount,
  avatar,
}: Author) {
  return (
    <Card className="relative h-[82px] rounded-2xl border border-palette-indigo-300-20 bg-card p-0 py-0 shadow-none ring-0 transition-all duration-200 hover:border-palette-cyan-300 hover:bg-gray-800">
      <CardContent className="h-full px-0 py-0">
        <Link
          href={`/authors/${id}`}
          className="flex h-full items-center gap-4 px-3 py-3 pr-12"
        >
          <div className="size-[52px] shrink-0 overflow-hidden rounded-full border border-palette-indigo-300-20 bg-palette-cyan-300-10">
            <Image
              src={avatar}
              alt={`${name} avatar`}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base leading-5 font-extrabold text-palette-slate-50">
              {name}
            </h3>
            <p className="pt-1 text-xs leading-4 font-semibold text-palette-slate-400">
              <span aria-hidden="true">📚</span> {booksCount} Books{" "}
              <span className="text-palette-indigo-300-20">•</span>{" "}
              <span aria-hidden="true">🔥</span>{" "}
              {formatBorrowCount(borrowedBooksCount)} Borrows
            </p>
          </div>
        </Link>

        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <FavoriteAuthorButton
            author={{
              id,
              name,
              booksCount,
              borrowedBooksCount,
              avatar,
              rating: 0,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export async function PopularAuthors() {
  let popularAuthors: Author[];

  try {
    popularAuthors = (await getPopularAuthors(1, 4)).data;
  } catch (error) {
    return (
      <section className="w-full pb-10">
        <CatalogUnavailable
          title="Penulis populer belum dapat dimuat"
          message={getApiErrorMessage(error)}
        />
      </section>
    );
  }

  return (
    <section className="w-full pb-10">
      <Card className="min-h-[224px] w-full rounded-[32px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 font-outfit text-palette-slate-50 shadow-none ring-0">
        <CardContent className="px-7 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl leading-8 font-extrabold">
              Popular Authors
            </h2>
            <Link
              href="/authors"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className:
                  "rounded-full border-palette-indigo-300-20 bg-white/5 text-palette-slate-50 hover:border-palette-cyan-300 hover:bg-cyan-300/10",
              })}
            >
              View all authors
            </Link>
          </div>
          <p className="max-w-[620px] pt-2 text-sm leading-6 font-medium text-palette-slate-400">
            ❤️ Follow your favorite authors to receive notifications when new
            books become available.
          </p>

          <div className="grid w-full grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            {popularAuthors.map((author) => (
              <PopularAuthorCard key={author.id} {...author} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
