import { describe, expect, it } from "vitest";

import { getApiErrorMessage, getHttpErrorMessage } from "@/lib/error-message";

describe("error messages", () => {
  it("uses the translated default for an unauthorized request", () => {
    expect(getHttpErrorMessage(401)).toContain("session has expired");
  });

  it("preserves an API message when it is available", () => {
    expect(getApiErrorMessage({ message: "Backend unavailable" })).toBe(
      "Backend unavailable",
    );
  });
});
