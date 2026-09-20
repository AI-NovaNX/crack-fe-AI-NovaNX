import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthLogo } from "@/components/shared/auth/auth-logo";

describe("AuthLogo", () => {
  it("renders the NexRead logo image", () => {
    render(<AuthLogo />);
    expect(screen.getByAltText("NexRead")).toBeInTheDocument();
  });
});
