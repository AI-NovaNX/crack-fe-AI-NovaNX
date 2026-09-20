import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_CHANGED_EVENT, submitAuth } from "@/lib/auth";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("submitAuth", () => {
  it("posts credentials and returns the parsed user on success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ user: { id: 1 } }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const listener = vi.fn();
    window.addEventListener(AUTH_CHANGED_EVENT, listener);

    const result = await submitAuth("login", { email: "a@b.com" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result).toEqual({ user: { id: 1 } });
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_CHANGED_EVENT, listener);
  });

  it("clears legacy mock-login credentials on success", async () => {
    localStorage.setItem("registeredUser", "x");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", "x");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    );

    await submitAuth("logout");

    expect(localStorage.getItem("registeredUser")).toBeNull();
    expect(localStorage.getItem("isLoggedIn")).toBeNull();
    expect(localStorage.getItem("currentUser")).toBeNull();
  });

  it("throws a translated error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Invalid credentials" }), {
          status: 401,
        }),
      ),
    );

    await expect(submitAuth("login", {})).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("throws a connectivity error when fetch itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(submitAuth("register", {})).rejects.toThrow(
      "Unable to connect to NexRead",
    );
  });
});
