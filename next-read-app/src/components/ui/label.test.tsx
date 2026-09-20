import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders its text and forwards htmlFor", () => {
    render(<Label htmlFor="email">Email address</Label>);
    const label = screen.getByText("Email address");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email");
    expect(label).toHaveAttribute("data-slot", "label");
  });
});
