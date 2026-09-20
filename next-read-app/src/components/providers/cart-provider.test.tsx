import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartProvider, useCart } from "@/components/providers/cart-provider";

function Harness() {
  const cart = useCart();
  return (
    <div>
      <output>{cart.status}</output>
      <span data-testid="count">{cart.items.length}</span>
      <span data-testid="admin">{String(cart.isAdmin)}</span>
      <span data-testid="pending">{cart.pending.join(",")}</span>
      <button onClick={() => void cart.add("book-1")}>add</button>
    </div>
  );
}

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("CartProvider", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("loads the cart and adds a new book immediately", async () => {
    let added = false;
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/auth/session")
        return response({ user: { role: "user" } });
      if (init?.method === "POST") {
        added = true;
        return response({ id: 2 }, 201);
      }
      return response(added ? [{ id: 2, book: { id: "book-1" } }] : []);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "add" }));
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cart",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("marks unauthenticated visitors as guests", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) =>
        String(input) === "/api/cart"
          ? response({ message: "Sign in" }, 401)
          : response({}, 401),
      ),
    );
    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByText("guest")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "add" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("detects admin sessions and prevents adding books", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) =>
      String(input) === "/api/auth/session"
        ? response({ user: { role: "ADMIN" } })
        : response([]),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready")).toBeInTheDocument());
    expect(screen.getByTestId("admin")).toHaveTextContent("true");
    fireEvent.click(screen.getByRole("button", { name: "add" }));
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/cart",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports cart loading failures through its status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) =>
        String(input) === "/api/cart"
          ? response({ message: "Cart unavailable" }, 503)
          : response({ user: { role: "user" } }),
      ),
    );
    render(
      <CartProvider>
        <Harness />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByText("error")).toBeInTheDocument());
  });

  it("requires the hook to be rendered inside its provider", () => {
    expect(() => render(<Harness />)).toThrow("CartProvider is required");
  });
});
