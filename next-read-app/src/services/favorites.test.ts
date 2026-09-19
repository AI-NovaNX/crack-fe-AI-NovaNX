import { afterEach, describe, expect, it } from "vitest";

import {
  favoriteAuthorsKey,
  favoritesKey,
  readFavoriteAuthors,
  readFavorites,
  writeFavoriteAuthors,
  writeFavorites,
} from "@/services/favorites";
import type { Author } from "@/types/author";
import type { Book } from "@/types/book";

const userId = 17;

const book: Book = {
  id: "book-1",
  title: "The Left Hand of Darkness",
  author: "Ursula K. Le Guin",
  category: "Science Fiction",
  rating: 4.8,
  coverUrl: "/covers/left-hand.jpg",
  coverClassName: "bg-slate-700",
};

const author: Author = {
  id: "author-1",
  name: "Ursula K. Le Guin",
  booksCount: 22,
  borrowedBooksCount: 120,
  rating: 4.9,
  avatar: { src: "/authors/ursula.jpg" } as Author["avatar"],
};

afterEach(() => {
  localStorage.clear();
});

describe("favorites storage", () => {
  it("creates user-scoped storage keys", () => {
    expect(favoritesKey(userId)).toBe("nexread:favorites:v1:17");
    expect(favoriteAuthorsKey(userId)).toBe("nexread:favorite-authors:v1:17");
  });

  it("returns empty collections when a user has no saved favorites", () => {
    expect(readFavorites(userId)).toEqual([]);
    expect(readFavoriteAuthors(userId)).toEqual([]);
  });

  it("persists only the supported book snapshot fields", () => {
    writeFavorites(userId, [
      { ...book, availableCopies: 3, isAvailable: true },
    ]);

    expect(readFavorites(userId)).toEqual([book]);
    expect(
      JSON.parse(localStorage.getItem(favoritesKey(userId)) ?? "[]")[0],
    ).not.toHaveProperty("availableCopies");
  });

  it("persists and reads valid author snapshots", () => {
    writeFavoriteAuthors(userId, [author]);

    expect(readFavoriteAuthors(userId)).toEqual([author]);
  });

  it("drops malformed records and rejects non-array storage values", () => {
    localStorage.setItem(
      favoritesKey(userId),
      JSON.stringify([book, { id: "incomplete" }]),
    );
    expect(readFavorites(userId)).toEqual([book]);

    localStorage.setItem(
      favoriteAuthorsKey(userId),
      JSON.stringify({ author }),
    );
    expect(() => readFavoriteAuthors(userId)).toThrow(
      "Invalid favorite authors data.",
    );
  });
});
