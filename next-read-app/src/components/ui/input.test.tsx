import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with the given type and accepts user input", async () => {
    render(<Input type="email" placeholder="you@example.com" />);
    const input = screen.getByPlaceholderText(
      "you@example.com",
    ) as HTMLInputElement;
    expect(input).toHaveAttribute("type", "email");

    await userEvent.type(input, "hi@nexread.app");
    expect(input.value).toBe("hi@nexread.app");
  });
});
