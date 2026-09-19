"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { GuestNav } from "@/components/layout/guest-nav";
import { UserNav } from "@/components/layout/user-nav";
import { useToast } from "@/components/providers/app-feedback-provider";
import { getInitials } from "@/lib/avatar";
import { AUTH_CHANGED_EVENT, type SessionUser } from "@/lib/auth";

export function AppNav() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const { items } = useCart();
  const cartCount = items.length;
  const toast = useToast();
  useEffect(() => {
    let controller: AbortController | undefined;
    const update = async () => {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          signal,
        });
        const body = await response.json();
        if (!signal.aborted) {
          if (response.ok) setUser(body.user);
          else if (response.status === 401) setUser(null);
          else {
            toast({
              title: "Account status could not be verified",
              description: body.message,
              variant: "error",
            });
          }
        }
      } catch {
        if (!signal.aborted) {
          toast({
            title: "Connection lost",
            description:
              "Account status will be checked again when the page reloads.",
            variant: "error",
          });
        }
      }
    };
    // Discard legacy mock credentials; only the backend session determines login.
    for (const key of ["registeredUser", "isLoggedIn", "currentUser"])
      localStorage.removeItem(key);
    void update();
    window.addEventListener(AUTH_CHANGED_EVENT, update);
    return () => {
      controller?.abort();
      window.removeEventListener(AUTH_CHANGED_EVENT, update);
    };
  }, [toast]);
  if (!user) return <GuestNav />;
  return (
    <UserNav
      user={{
        name: user.fullName,
        initials: getInitials(user.fullName),
        role: user.role,
        avatar: user.avatar,
      }}
      cartCount={cartCount}
    />
  );
}
