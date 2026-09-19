import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminTabs } from "@/components/admin/admin-tabs";

describe("AdminTabs", () => {
  it("renders all available management sections and marks the active route", () => {
    render(<AdminTabs active="reviews" />);

    expect(screen.getByRole("link", { name: "Reviews" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Authors" })).toHaveAttribute(
      "href",
      "/admin/authors",
    );
    expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute(
      "href",
      "/admin/categories",
    );
    expect(
      screen.getByRole("navigation", {
        name: "Admin management navigation",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(7);
  });
});
