import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { GuestNav } from "@/components/layout/guest-nav";

describe("GuestNav", () => {
  it("renders default login and register links", () => {
    render(<GuestNav />);
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "NexRead home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders custom login and register actions", () => {
    render(
      <GuestNav
        loginAction={{ label: "Sign in", href: "/signin" }}
        registerAction={{ label: "Join", href: "/join" }}
      />,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
    expect(screen.getByRole("link", { name: "Join" })).toHaveAttribute(
      "href",
      "/join",
    );
  });
});
