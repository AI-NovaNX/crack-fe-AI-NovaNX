import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/layout/footer";
import { AuthPageShell } from "@/components/shared/auth/auth-page-shell";

vi.mock("@/components/layout/theme-toggle", () => ({
  ThemeToggle: () => <button>toggle theme</button>,
}));
vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("static layout components", () => {
  it("renders the footer identity and social channels", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { name: "NexRead" })).toBeInTheDocument();
    for (const channel of ["Facebook", "Instagram", "LinkedIn", "TikTok"]) {
      expect(screen.getByLabelText(channel)).toBeInTheDocument();
    }
  });

  it("renders an authentication page heading, description, and content", () => {
    render(
      <AuthPageShell title="Welcome back" description="Sign in to continue">
        <button>Sign in</button>
      </AuthPageShell>,
    );
    expect(
      screen.getByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "toggle theme" })).toBeInTheDocument();
  });
});
