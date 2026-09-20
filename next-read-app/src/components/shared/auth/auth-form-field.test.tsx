import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthFormField } from "@/components/shared/auth/auth-form-field";

describe("AuthFormField", () => {
  it("renders a label linked to its input", () => {
    render(<AuthFormField id="email" label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("id", "email");
  });

  it("shows the error message tied to the field id", () => {
    render(<AuthFormField id="email" label="Email" error="Required" />);
    expect(screen.getByText("Required")).toHaveAttribute("id", "email-error");
  });

  it("toggles the password visibility button", async () => {
    const onTogglePassword = vi.fn();
    render(
      <AuthFormField
        id="password"
        label="Password"
        type="password"
        showPassword={false}
        onTogglePassword={onTogglePassword}
      />,
    );

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Show password" }),
    );
    expect(onTogglePassword).toHaveBeenCalledTimes(1);
  });
});
