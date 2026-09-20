"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AUTH_CHANGED_EVENT } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

type Item = { id: number; book: { id: string } };
type Status = "loading" | "ready" | "guest" | "error";
const Context = createContext<{
  items: Item[];
  pending: string[];
  status: Status;
  isAdmin: boolean;
  add: (id: string) => Promise<"added" | "existing" | "guest" | "busy">;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const locks = useRef(new Set<string>());
  const generation = useRef(0);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++request.current;
    const [response, sessionResponse] = await Promise.all([
      fetch("/api/cart", { cache: "no-store" }),
      fetch("/api/auth/session", { cache: "no-store" }),
    ]);
    const data = await response.json();
    const session = await sessionResponse.json().catch(() => null);
    if (version !== request.current) return;
    setIsAdmin(sessionResponse.ok && isAdminRole(session?.user?.role));
    if (response.status === 401) {
      setItems([]);
      setStatus("guest");
      return;
    }
    if (!response.ok) {
      setStatus("error");
      throw new Error(data.message || "The cart could not be loaded.");
    }
    setItems(data);
    setStatus("ready");
  }, []);
  useEffect(() => {
    const update = () => {
      void refresh().catch(() => setStatus("error"));
    };
    const auth = () => {
      generation.current++;
      setItems([]);
      setStatus("loading");
      update();
    };
    update();
    window.addEventListener("nexread-cart-changed", update);
    window.addEventListener(AUTH_CHANGED_EVENT, auth);
    window.addEventListener("focus", update);
    return () => {
      // Invalidate whichever async request/generation is current at cleanup time.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      request.current++;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      window.removeEventListener("nexread-cart-changed", update);
      window.removeEventListener(AUTH_CHANGED_EVENT, auth);
      window.removeEventListener("focus", update);
    };
  }, [refresh]);
  async function add(
    id: string,
  ): Promise<"added" | "existing" | "guest" | "busy"> {
    if (locks.current.has(id)) return "busy";
    if (status === "guest") return "guest";
    if (isAdmin) return "busy";
    if (items.some((item) => item.book.id === id)) return "existing";
    locks.current.add(id);
    setPending([...locks.current]);
    const session = generation.current;
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id }),
      });
      const data = await response.json();
      if (session !== generation.current) return "busy";
      if (response.status === 401) {
        setItems([]);
        setStatus("guest");
        return "guest";
      }
      if (!response.ok) {
        if (response.status === 409) {
          const check = await fetch("/api/cart", { cache: "no-store" });
          if (check.ok) {
            const current: Item[] = await check.json();
            if (session !== generation.current) return "busy";
            if (current.some((item) => item.book.id === id)) {
              setItems(current);
              setStatus("ready");
              return "existing";
            }
          }
        }
        throw new Error(data.message || "The book could not be added.");
      }
      // Mark membership immediately; the shared refresh supplies real cart item IDs.
      request.current++;
      setItems((current) =>
        current.some((item) => item.book.id === id)
          ? current
          : [...current, { id: -1, book: { id } }],
      );
      window.dispatchEvent(new Event("nexread-cart-changed"));
      return "added";
    } finally {
      locks.current.delete(id);
      setPending([...locks.current]);
    }
  }
  return (
    <Context.Provider value={{ items, pending, status, isAdmin, add }}>
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("CartProvider is required");
  return value;
}
