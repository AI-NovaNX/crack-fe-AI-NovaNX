import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BookCategory } from "@/components/home/book-category";

const mocks = vi.hoisted(() => ({ getCategories: vi.fn() }));

vi.mock("@/services/categories", () => ({
  getCategories: mocks.getCategories,
}));
vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));
vi.mock("@/components/shared/catalog-unavailable", () => ({
  CatalogUnavailable: ({ title, message }: { title: string; message: string }) => (
    <div role="alert">{`${title}: ${message}`}</div>
  ),
}));

describe("BookCategory", () => {
  beforeEach(() => mocks.getCategories.mockReset());

  it("renders category cards linked to the filtered catalog", async () => {
    mocks.getCategories.mockResolvedValue([
      {
        id: "fiction",
        name: "Fiction",
        subtitle: "Stories and novels",
        icon: "/fiction.svg",
      },
      {
        id: "science",
        name: "Science",
        subtitle: "Explore the world",
        icon: "/science.svg",
      },
    ]);

    render(await BookCategory());
    expect(screen.getByRole("link", { name: "View Fiction books" })).toHaveAttribute(
      "href",
      "/book-list?category=fiction",
    );
    expect(screen.getByText("Explore the world")).toBeInTheDocument();
  });
});
