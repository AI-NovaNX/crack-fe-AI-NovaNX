import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HeaderSearch } from "@/components/layout/header-search";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  params: new URLSearchParams(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => navigation.params,
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.replace,
  }),
}));

describe("HeaderSearch", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    navigation.params = new URLSearchParams();
    navigation.push.mockReset();
    navigation.replace.mockReset();
    vi.useFakeTimers();
  });

  it("navigates immediately when the search form is submitted", () => {
    render(<HeaderSearch />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search books" }), {
      target: { value: " atomic habits " },
    });
    fireEvent.submit(screen.getByRole("search"));

    expect(navigation.push).toHaveBeenCalledWith(
      "/book-list?search=atomic+habits",
      { scroll: false },
    );
  });

  it("debounces searches on the book list while preserving filters", () => {
    navigation.pathname = "/book-list";
    navigation.params = new URLSearchParams("category=Fiction&page=3");
    render(<HeaderSearch placeholder="Find a title" />);

    const input = screen.getByPlaceholderText("Find a title");
    fireEvent.change(input, { target: { value: "Dune" } });
    expect(navigation.replace).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);

    expect(navigation.replace).toHaveBeenCalledWith(
      "/book-list?category=Fiction&search=Dune",
      { scroll: false },
    );
  });

  it("does not search in the middle of IME composition", () => {
    render(<HeaderSearch />);
    const input = screen.getByRole("searchbox", { name: "Search books" });
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "本" } });
    vi.advanceTimersByTime(500);
    expect(navigation.push).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input, { data: "本" });
    vi.advanceTimersByTime(400);
    expect(navigation.push).toHaveBeenCalledWith("/book-list?search=%E6%9C%AC", {
      scroll: false,
    });
  });
});
