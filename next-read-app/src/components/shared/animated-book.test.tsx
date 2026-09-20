import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";

describe("AnimatedBook", () => {
  it("renders the book title inside the illustrated pages", () => {
    render(
      <AnimatedBook
        title="The Left Hand of Darkness"
        author="Ursula K. Le Guin"
        coverClassName="bg-slate-700"
      />,
    );
    expect(
      screen.getAllByText("Illustration page").length,
    ).toBeGreaterThan(0);
  });

  it("renders the cover image when a coverUrl is provided", () => {
    render(
      <AnimatedBook
        title="Dune"
        coverUrl="/covers/dune.jpg"
        coverClassName="bg-slate-700"
      />,
    );
    expect(screen.getByAltText("Cover Dune")).toBeInTheDocument();
  });
});

describe("BookHoverCard", () => {
  it("renders its children", () => {
    render(
      <BookHoverCard>
        <span>Card content</span>
      </BookHoverCard>,
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});
