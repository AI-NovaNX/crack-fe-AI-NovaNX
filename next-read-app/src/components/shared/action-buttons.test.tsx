import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartButton } from "@/components/shared/cart-button";
import { FavoriteAuthorButton } from "@/components/shared/favorite-author-button";
import { FavoriteButton } from "@/components/shared/favorite-button";

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
  toggle: vi.fn(),
  toggleAuthor: vi.fn(),
  cart: {
    items: [] as Array<{ id: number; book: { id: string } }>,
    pending: [] as string[],
    status: "ready",
    isAdmin: false,
  },
  favorites: {
    books: [] as Array<{ id: string }>,
    authors: [] as Array<{ id: string }>,
    status: "ready",
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/components/providers/app-feedback-provider", () => ({
  useToast: () => mocks.toast,
}));
vi.mock("@/components/providers/cart-provider", () => ({
  useCart: () => ({ ...mocks.cart, add: mocks.add }),
}));
vi.mock("@/components/providers/favorites-provider", () => ({
  useFavorites: () => ({
    ...mocks.favorites,
    toggle: mocks.toggle,
    toggleAuthor: mocks.toggleAuthor,
  }),
}));

const book = {
  id: "book-1",
  title: "Dune",
  author: "Frank Herbert",
  category: "Fiction",
  rating: 5,
  coverClassName: "bg-orange-500",
};
const author = {
  id: "author-1",
  name: "Frank Herbert",
  booksCount: 2,
  borrowedBooksCount: 8,
  rating: 5,
  avatar: { src: "/author.png", height: 64, width: 64 },
};

describe("book action buttons", () => {
  beforeEach(() => {
    mocks.add.mockReset();
    mocks.push.mockReset();
    mocks.toast.mockReset();
    mocks.toggle.mockReset();
    mocks.toggleAuthor.mockReset();
    Object.assign(mocks.cart, {
      items: [],
      pending: [],
      status: "ready",
      isAdmin: false,
    });
    Object.assign(mocks.favorites, {
      books: [],
      authors: [],
      status: "ready",
    });
  });

  it("adds a book to the cart and reports success", async () => {
    mocks.add.mockResolvedValue("added");
    render(<CartButton book={book} showLabel />);
    fireEvent.click(screen.getByRole("button", { name: /Add to cart: Dune/i }));
    await waitFor(() => expect(mocks.add).toHaveBeenCalledWith("book-1"));
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Book added to cart" }),
    );
  });

  it("redirects guests to login", async () => {
    mocks.add.mockResolvedValue("guest");
    render(<CartButton book={book} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to cart: Dune/i }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/login"));
  });

  it("opens the cart when the book already exists", () => {
    mocks.cart.items = [{ id: 1, book: { id: "book-1" } }];
    render(<CartButton book={book} showLabel />);
    fireEvent.click(screen.getByRole("button", { name: /Already in cart/i }));
    expect(mocks.push).toHaveBeenCalledWith("/cart");
  });

  it("disables unavailable books and admin borrowing", () => {
    const { rerender } = render(
      <CartButton book={{ ...book, availableCopies: 0 }} showLabel />,
    );
    expect(screen.getByRole("button", { name: /Book unavailable/i })).toBeDisabled();

    mocks.cart.isAdmin = true;
    rerender(<CartButton book={book} showLabel />);
    expect(screen.getByRole("button", { name: /Admins cannot borrow/i })).toBeDisabled();
  });

  it("reports add-to-cart failures", async () => {
    mocks.add.mockRejectedValue(new Error("Network failed"));
    render(<CartButton book={book} />);
    fireEvent.click(screen.getByRole("button", { name: /Add to cart/i }));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Failed to add book", variant: "error" }),
      ),
    );
  });

  it("toggles book favorites and redirects guests", () => {
    const { rerender } = render(<FavoriteButton book={book} showLabel />);
    fireEvent.click(screen.getByRole("button", { name: /Add to favorites/i }));
    expect(mocks.toggle).toHaveBeenCalledWith(book);
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Book added to favorites" }),
    );

    mocks.favorites.status = "guest";
    rerender(<FavoriteButton book={book} showLabel />);
    fireEvent.click(screen.getByRole("button", { name: /Add to favorites/i }));
    expect(mocks.push).toHaveBeenCalledWith("/login");
  });

  it("toggles author favorites and reports storage failures", () => {
    const { rerender } = render(
      <FavoriteAuthorButton author={author} showLabel />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Add to favorites/i }));
    expect(mocks.toggleAuthor).toHaveBeenCalledWith(author);

    mocks.toggleAuthor.mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    rerender(<FavoriteAuthorButton author={author} showLabel />);
    fireEvent.click(screen.getByRole("button", { name: /Add to favorites/i }));
    expect(mocks.toast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: "Favorite author could not be updated",
        variant: "error",
      }),
    );
  });
});
