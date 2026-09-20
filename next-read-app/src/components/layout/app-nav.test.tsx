import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppNav } from "@/components/layout/app-nav";

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
}));

vi.mock("@/components/providers/cart-provider", () => ({
  useCart: () => ({ items: [{ id: 1 }, { id: 2 }] }),
}));
vi.mock("@/components/providers/app-feedback-provider", () => ({
  useToast: () => mocks.toast,
}));
vi.mock("@/components/layout/guest-nav", () => ({
  GuestNav: () => <div>guest navigation</div>,
}));
vi.mock("@/components/layout/user-nav", () => ({
  UserNav: ({ user, cartCount }: { user: { name: string }; cartCount: number }) => (
    <div>{`user navigation ${user.name} ${cartCount}`}</div>
  ),
}));

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("AppNav", () => {
  beforeEach(() => {
    mocks.toast.mockReset();
    localStorage.setItem("isLoggedIn", "true");
    vi.restoreAllMocks();
  });

  it("shows user navigation for an authenticated session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        response({
          user: { fullName: "Ada Lovelace", role: "user", avatar: null },
        }),
      ),
    );
    render(<AppNav />);
    expect(await screen.findByText("user navigation Ada Lovelace 2")).toBeInTheDocument();
    expect(localStorage.getItem("isLoggedIn")).toBeNull();
  });

  it("keeps guest navigation for a missing session", async () => {
    vi.stubGlobal("fetch", vi.fn(() => response({ message: "Sign in" }, 401)));
    render(<AppNav />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.getByText("guest navigation")).toBeInTheDocument();
  });

  it("shows feedback when session verification fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => response({ message: "Service unavailable" }, 503)),
    );
    render(<AppNav />);
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Account status could not be verified",
          variant: "error",
        }),
      ),
    );
  });

  it("shows connection feedback when the request rejects", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    render(<AppNav />);
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Connection lost" }),
      ),
    );
  });
});
