import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FavoritesProvider,
  useFavorites,
} from "@/components/providers/favorites-provider";
import { AUTH_CHANGED_EVENT } from "@/lib/auth";
import {
  favoriteAuthorsKey,
  favoritesKey,
} from "@/services/favorites";
import type { Author } from "@/types/author";
import type { Book } from "@/types/book";

const book: Book = {
  id: "book-1",
  title: "Clean Code",
  author: "Robert Martin",
  category: "Technology",
  rating: 4.5,
  coverClassName: "bg-blue-500",
};

const author: Author = {
  id: "author-1",
  name: "Robert Martin",
  booksCount: 2,
  borrowedBooksCount: 4,
  rating: 4.5,
  avatar: { src: "/avatar.png", height: 64, width: 64 },
};

function Harness() {
  const favorites = useFavorites();
  return (
    <div>
      <output>{favorites.status}</output>
      <span>{favorites.error}</span>
      <span data-testid="books">{favorites.books.length}</span>
      <span data-testid="authors">{favorites.authors.length}</span>
      <button onClick={() => favorites.toggle(book)}>toggle book</button>
      <button onClick={() => favorites.toggleAuthor(author)}>
        toggle author
      </button>
      <button onClick={favorites.retry}>retry</button>
    </div>
  );
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("FavoritesProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads and toggles the signed-in user's book and author favorites", async () => {
    localStorage.setItem(favoritesKey(7), JSON.stringify([book]));
    localStorage.setItem(favoriteAuthorsKey(7), JSON.stringify([author]));
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResponse({ user: { id: 7 } })),
    );

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );

    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    expect(screen.getByTestId("books")).toHaveTextContent("1");
    expect(screen.getByTestId("authors")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "toggle book" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle author" }));
    expect(screen.getByTestId("books")).toHaveTextContent("0");
    expect(screen.getByTestId("authors")).toHaveTextContent("0");

    fireEvent.click(screen.getByRole("button", { name: "toggle book" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle author" }));
    expect(screen.getByTestId("books")).toHaveTextContent("1");
    expect(screen.getByTestId("authors")).toHaveTextContent("1");
  });

  it("exposes guest and error states and retries session loading", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({ message: "Sign in" }, 401))
      .mockImplementationOnce(() => jsonResponse({ message: "Unavailable" }, 503))
      .mockImplementationOnce(() => jsonResponse({ user: { id: 9 } }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );
    await waitFor(() => expect(screen.getByText("guest")).toBeInTheDocument());

    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    await waitFor(() => expect(screen.getByText("error")).toBeInTheDocument());
    expect(screen.getByText("Unavailable")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "retry" }));
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
  });

  it("synchronizes favorites changed in another browser tab", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResponse({ user: { id: 11 } })),
    );
    render(
      <FavoritesProvider>
        <Harness />
      </FavoritesProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());

    localStorage.setItem(favoritesKey(11), JSON.stringify([book]));
    fireEvent(
      window,
      new StorageEvent("storage", { key: favoritesKey(11) }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("books")).toHaveTextContent("1"),
    );
  });

  it("requires the hook to be rendered inside its provider", () => {
    expect(() => render(<Harness />)).toThrow("FavoritesProvider is required.");
  });
});
