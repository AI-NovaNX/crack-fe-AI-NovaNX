import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders and accepts user input", async () => {
    render(<Textarea placeholder="Write a review" />);
    const textarea = screen.getByPlaceholderText(
      "Write a review",
    ) as HTMLTextAreaElement;

    await userEvent.type(textarea, "Great book!");
    expect(textarea.value).toBe("Great book!");
  });
});
