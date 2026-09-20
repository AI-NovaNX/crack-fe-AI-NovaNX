import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PopularAuthors } from "@/components/home/popular-authors";

const mocks = vi.hoisted(() => ({ getPopularAuthors: vi.fn() }));

vi.mock("@/services/authors", () => ({
  getPopularAuthors: mocks.getPopularAuthors,
}));
vi.mock("@/components/shared/favorite-author-button", () => ({
  FavoriteAuthorButton: ({ author }: { author: { name: string } }) => (
    <button>{`Favorite ${author.name}`}</button>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("PopularAuthors", () => {
  it("renders authors and formats large borrow counts", async () => {
    mocks.getPopularAuthors.mockResolvedValue({
      data: [
        {
          id: "frank-herbert",
          name: "Frank Herbert",
          booksCount: 6,
          borrowedBooksCount: 1250,
          rating: 5,
          avatar: { src: "/frank.png", height: 64, width: 64 },
        },
        {
          id: "jane-austen",
          name: "Jane Austen",
          booksCount: 4,
          borrowedBooksCount: 800,
          rating: 5,
          avatar: { src: "/jane.png", height: 64, width: 64 },
        },
      ],
    });

    render(await PopularAuthors());
    expect(screen.getByRole("heading", { name: "Popular Authors" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Frank Herbert/ })).toHaveAttribute(
      "href",
      "/authors/frank-herbert",
    );
    expect(screen.getByText(/1.3K Borrows/)).toBeInTheDocument();
    expect(screen.getByText(/800 Borrows/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Favorite Jane Austen" })).toBeInTheDocument();
  });
});
