import type { Author } from "@/types/author";
import type { Book } from "@/types/book";

// Temporary browser adapter. Replace these methods with authenticated API calls
// when the backend favorites endpoints are available.
export const favoritesKey = (userId: number) =>
  `nexread:favorites:v1:${userId}`;
export const favoriteAuthorsKey = (userId: number) =>
  `nexread:favorite-authors:v1:${userId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readFavorites(userId: number): Book[] {
  const raw = localStorage.getItem(favoritesKey(userId));
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Data favorit tidak valid.");
  return data.filter(
    (book): book is Book =>
      isRecord(book) &&
      typeof book.id === "string" &&
      typeof book.title === "string" &&
      typeof book.author === "string" &&
      typeof book.category === "string" &&
      typeof book.rating === "number" &&
      typeof book.coverClassName === "string",
  );
}

export function writeFavorites(userId: number, books: Book[]) {
  const snapshots = books.map(
    ({ id, title, author, category, rating, coverUrl, coverClassName }) => ({
      id,
      title,
      author,
      category,
      rating,
      coverUrl,
      coverClassName,
    }),
  );
  localStorage.setItem(favoritesKey(userId), JSON.stringify(snapshots));
}

export function readFavoriteAuthors(userId: number): Author[] {
  const raw = localStorage.getItem(favoriteAuthorsKey(userId));
  if (!raw) return [];

  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data))
    throw new Error("Data favorit penulis tidak valid.");

  return data.filter(
    (author): author is Author =>
      isRecord(author) &&
      typeof author.id === "string" &&
      typeof author.name === "string" &&
      typeof author.booksCount === "number" &&
      typeof author.borrowedBooksCount === "number" &&
      typeof author.rating === "number" &&
      isRecord(author.avatar) &&
      typeof author.avatar.src === "string",
  );
}

export function writeFavoriteAuthors(userId: number, authors: Author[]) {
  const snapshots = authors.map(
    ({ id, name, booksCount, borrowedBooksCount, rating, avatar }) => ({
      id,
      name,
      booksCount,
      borrowedBooksCount,
      rating,
      avatar,
    }),
  );

  localStorage.setItem(favoriteAuthorsKey(userId), JSON.stringify(snapshots));
}
