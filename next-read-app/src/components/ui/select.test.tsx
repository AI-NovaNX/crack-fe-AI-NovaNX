import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "@/components/ui/select";

describe("Select", () => {
  it("renders options and reflects the selected value", async () => {
    render(
      <Select defaultValue="fiction" aria-label="Category">
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-fiction</option>
      </Select>,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("fiction");

    await userEvent.selectOptions(select, "non-fiction");
    expect(select.value).toBe("non-fiction");
  });
});
