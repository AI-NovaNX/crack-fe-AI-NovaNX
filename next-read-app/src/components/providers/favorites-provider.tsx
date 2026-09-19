"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { AUTH_CHANGED_EVENT } from "@/lib/auth";
import type { Author } from "@/types/author";
import type { Book } from "@/types/book";
import {
  favoriteAuthorsKey,
  favoritesKey,
  readFavoriteAuthors,
  readFavorites,
  writeFavoriteAuthors,
  writeFavorites,
} from "@/services/favorites";

type State = "loading" | "ready" | "guest" | "error";

type FavoritesContextValue = {
  books: Book[];
  authors: Author[];
  status: State;
  error: string;
  toggle: (book: Book) => void;
  toggleAuthor: (author: Author) => void;
  retry: () => void;
};

const Context = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [status, setStatus] = useState<State>("loading");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let controller: AbortController;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;

      setStatus("loading");
      setBooks([]);
      setAuthors([]);
      setUserId(null);

      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal,
        });
        const body = await response.json();

        if (signal.aborted) return;

        if (response.status === 401) {
          setStatus("guest");
          return;
        }

        if (!response.ok) {
          throw new Error(body.message || "Your account status could not be verified.");
        }

        const storedBooks = readFavorites(body.user.id);
        const storedAuthors = readFavoriteAuthors(body.user.id);

        setUserId(body.user.id);
        setBooks(storedBooks);
        setAuthors(storedAuthors);
        setStatus("ready");
        setError("");
      } catch (e) {
        if (signal.aborted) return;
        setError(
          e instanceof Error ? e.message : "Your favorites could not be loaded.",
        );
        setStatus("error");
      }
    }

    void load();
    window.addEventListener(AUTH_CHANGED_EVENT, load);

    return () => {
      controller?.abort();
      window.removeEventListener(AUTH_CHANGED_EVENT, load);
    };
  }, [attempt]);

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (userId === null || event.key === null) return;

      try {
        if (event.key === favoritesKey(userId)) {
          setBooks(readFavorites(userId));
        }

        if (event.key === favoriteAuthorsKey(userId)) {
          setAuthors(readFavoriteAuthors(userId));
        }
      } catch {
        setError("Favorites storage could not be read.");
        setStatus("error");
      }
    }

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [userId]);

  function toggle(book: Book) {
    if (status !== "ready" || userId === null) {
      throw new Error("Please sign in to save favorites.");
    }

    const current = readFavorites(userId);
    const next = current.some((item) => item.id === book.id)
      ? current.filter((item) => item.id !== book.id)
      : [...current, book];

    writeFavorites(userId, next);
    setBooks(next);
  }

  function toggleAuthor(author: Author) {
    if (status !== "ready" || userId === null) {
      throw new Error("Please sign in to save favorite authors.");
    }

    const current = readFavoriteAuthors(userId);
    const next = current.some((item) => item.id === author.id)
      ? current.filter((item) => item.id !== author.id)
      : [...current, author];

    writeFavoriteAuthors(userId, next);
    setAuthors(next);
  }

  return (
    <Context.Provider
      value={{
        books,
        authors,
        status,
        error,
        toggle,
        toggleAuthor,
        retry: () => setAttempt((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useFavorites() {
  const value = useContext(Context);

  if (!value) {
    throw new Error("FavoritesProvider is required.");
  }

  return value;
}
