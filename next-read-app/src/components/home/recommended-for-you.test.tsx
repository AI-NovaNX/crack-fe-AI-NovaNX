import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RecommendedForYou } from "@/components/home/recommended-for-you";

const mocks = vi.hoisted(() => ({ getRecommendedBooks: vi.fn() }));

vi.mock("@/services/books", () => ({
  getRecommendedBooks: mocks.getRecommendedBooks,
}));
vi.mock("@/components/shared/animated-book", () => ({
  BookHoverCard: ({ children }: { children: React.ReactNode }) => <article>{children}</article>,
  AnimatedBook: ({ title }: { title: string }) => <div>{`Cover ${title}`}</div>,
}));
vi.mock("@/components/shared/cart-button", () => ({
  CartButton: () => <button>Add to cart</button>,
}));
vi.mock("@/components/shared/favorite-button", () => ({
  FavoriteButton: () => <button>Add favorite</button>,
}));
vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("RecommendedForYou", () => {
  it("renders books and pagination returned by the service", async () => {
    mocks.getRecommendedBooks.mockResolvedValue({
      data: [
        {
          id: "dune",
          title: "Dune",
          author: "Frank Herbert",
          category: "Fiction",
          rating: 4.8,
          coverClassName: "bg-orange-500",
        },
      ],
      meta: { page: 2, limit: 5, total: 12, totalPages: 3 },
    });

    render(await RecommendedForYou({ page: 2 }));
    expect(screen.getByRole("heading", { name: "Recommended for you" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dune" })).toHaveAttribute(
      "href",
      "/books/dune",
    );
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/?recommendPage=1#recommended",
    );
    expect(screen.getByRole("link", { name: "More" })).toHaveAttribute(
      "href",
      "/?recommendPage=3#recommended",
    );
  });
});
