import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { apiBaseUrl: "https://api.example.com" },
}));

import { ApiError, apiRequest, createApiUrl } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createApiUrl", () => {
  it("joins the configured base url with the given path", () => {
    expect(createApiUrl("/books")).toBe("https://api.example.com/books");
    expect(createApiUrl("books")).toBe("https://api.example.com/books");
  });
});

describe("apiRequest", () => {
  it("throws an ApiError with the backend message on a failed request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    let caught: unknown;
    try {
      await apiRequest("/books/1", {}, {});
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).status).toBe(404);
    expect((caught as ApiError).message).toBe("Not found");
  });

  it("joins array messages and falls back to a generic message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: ["A", "B"] }), {
          status: 400,
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    let caught: unknown;
    try {
      await apiRequest("/books", {}, {});
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).message).toBe("A. B");

    let secondCaught: unknown;
    try {
      await apiRequest("/books");
    } catch (error) {
      secondCaught = error;
    }
    expect((secondCaught as ApiError).message).toBe(
      "API request failed (500).",
    );
  });

  it("returns undefined for 204 responses and parses JSON otherwise", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiRequest("/books/1", { method: "DELETE" }),
    ).resolves.toBeUndefined();
    await expect(apiRequest("/books")).resolves.toEqual({ ok: true });
  });

  it("sends form data without a content-type header and caches catalog requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest(
      "/books",
      { method: "POST", body: new FormData() },
      { cacheCatalog: true },
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.get("Content-Type")).toBeNull();
    expect(init.cache).toBe("force-cache");
  });

  it("retries retryable GET requests on retryable status codes", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const promise = apiRequest("/books");
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("wraps network failures into an ApiError after exhausting retries", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    const promise = apiRequest("/books", { method: "POST" });
    const assertion = expect(promise).rejects.toBeInstanceOf(ApiError);
    await vi.runAllTimersAsync();
    await assertion;
    vi.useRealTimers();
  });
});
