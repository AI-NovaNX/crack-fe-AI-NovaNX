import Image from "next/image";
import { notFound } from "next/navigation";

import { FavoriteAuthorButton } from "@/components/shared/favorite-author-button";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { CartButton } from "@/components/shared/cart-button";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";
import starIcon from "@/assets/icons/TrendingBook/Icon.svg";
import { AppNav } from "@/components/layout/app-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthorBooks, getAuthorById } from "@/services/authors";
import type { Author } from "@/types/author";
import type { Book } from "@/types/book";

type AuthorDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatBorrowCount(count: number) {
  if (count < 1000) {
    return count.toString();
  }

  const compactCount = count / 1000;
  return `${Number.isInteger(compactCount) ? compactCount : compactCount.toFixed(1)}K`;
}

function AuthorSummaryCard({ author }: { author: Author }) {
  return (
    <Card className="w-full rounded-[32px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 text-palette-slate-50 shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.25)] ring-0">
      <CardContent className="flex items-center justify-between gap-5 px-6 py-7 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-5">
          <div className="size-16 shrink-0 overflow-hidden rounded-full border border-palette-indigo-300-20 bg-palette-cyan-300-10 shadow-[0px_10px_15px_-3px_rgba(0,_184,_219,_0.25),_0px_4px_6px_-4px_rgba(0,_184,_219,_0.25)]">
            <Image
              src={author.avatar}
              alt={`${author.name} avatar`}
              className="size-full object-cover"
              priority
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl leading-7 font-extrabold text-palette-slate-50">
              {author.name}
            </h1>
            <p className="pt-2 text-sm leading-5 font-semibold text-palette-slate-400">
              <span aria-hidden="true">📚</span> {author.booksCount} Books{" "}
              <span className="text-palette-indigo-300-20">•</span>{" "}
              <span aria-hidden="true">🔥</span>{" "}
              {formatBorrowCount(author.borrowedBooksCount)} Borrows
            </p>
          </div>
        </div>

        <FavoriteAuthorButton author={author} showLabel />
      </CardContent>
    </Card>
  );
}

function AuthorBookCard({
  id,
  coverUrl,
  title,
  author,
  category,
  rating,
  coverClassName,
  availableCopies,
  isAvailable,
}: Book) {
  return (
    <BookHoverCard className="h-full rounded-[28px] border border-palette-indigo-300-20 bg-palette-slate-900-80 p-0 py-0 shadow-none ring-0 transition-all duration-200 hover:border-palette-cyan-300 hover:bg-gray-800">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <AnimatedBook title={title} author={author} coverUrl={coverUrl} coverClassName={coverClassName} />

        <div className="flex flex-1 flex-col pt-5">
          <h3 className="text-[18px] leading-6 font-extrabold text-palette-slate-50">
            {title}
          </h3>
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

export default async function AuthorDetailPage({
  params,
}: AuthorDetailPageProps) {
  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author) {
    notFound();
  }

  const authorBooks = (await getAuthorBooks(id, 1, 100)).data;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1160px] flex-col px-5 pt-7 pb-10 font-outfit text-palette-slate-50 sm:px-8">
      <AppNav />

      <section className="pt-8">
        <AuthorSummaryCard author={author} />
      </section>

      <section className="pt-10">
        <h2 className="text-[30px] leading-9 font-extrabold">Book List</h2>

        {authorBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 pt-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {authorBooks.map((book) => (
              <AuthorBookCard key={book.id} {...book} />
            ))}
          </div>
        ) : (
          <Card className="mt-7 rounded-[24px] border border-palette-indigo-300-20 bg-gray-200 p-0 py-0 shadow-none ring-0">
            <CardContent className="px-6 py-8 text-sm leading-6 text-palette-slate-400">
              No books are available for this author yet.
            </CardContent>
          </Card>
        )}
      </section>

      <div className="pt-16">
        <Footer />
      </div>
    </main>
  );
}
