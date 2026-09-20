import { describe, expect, it } from "vitest";

import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";

describe("getBookCoverClassName", () => {
  it("returns a known cover style unchanged", () => {
    const style = "bg-[linear-gradient(135deg,_#ff637e,_#fb2c36_50%,_#020618)]";
    expect(getBookCoverClassName(style)).toBe(style);
  });

  it("falls back to the default gradient for unknown or empty values", () => {
    const fallback = "bg-gradient-to-br from-blue-500 to-indigo-700";
    expect(getBookCoverClassName("unknown-style")).toBe(fallback);
    expect(getBookCoverClassName(null)).toBe(fallback);
    expect(getBookCoverClassName(undefined)).toBe(fallback);
  });
});

describe("getBookCoverUrl", () => {
  it("returns undefined for non-string, empty, or blank values", () => {
    expect(getBookCoverUrl(undefined)).toBeUndefined();
    expect(getBookCoverUrl(null)).toBeUndefined();
    expect(getBookCoverUrl("   ")).toBeUndefined();
  });

  it("returns absolute http(s) urls unchanged", () => {
    expect(getBookCoverUrl("https://cdn.example.com/cover.jpg")).toBe(
      "https://cdn.example.com/cover.jpg",
    );
    expect(getBookCoverUrl("http://cdn.example.com/cover.jpg")).toBe(
      "http://cdn.example.com/cover.jpg",
    );
  });

  it("returns non-slash relative values unchanged", () => {
    expect(getBookCoverUrl("covers/left-hand.jpg")).toBe(
      "covers/left-hand.jpg",
    );
  });

  it("returns slash-prefixed paths unchanged when no API base url is configured", () => {
    expect(getBookCoverUrl("/covers/left-hand.jpg")).toBe(
      "/covers/left-hand.jpg",
    );
  });
});
