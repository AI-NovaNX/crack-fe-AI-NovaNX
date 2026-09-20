import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children and applies the default variant classes", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bg-primary");
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("text-destructive");
    expect(button.className).toContain("h-9");
  });

  it("merges a custom className", () => {
    render(<Button className="custom-class">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" }).className).toContain(
      "custom-class",
    );
  });
});
