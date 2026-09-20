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

  it("maps known HTTP errors and honors supplied validation details", () => {
    expect(getHttpErrorMessage(400, "A title is required.")).toBe(
      "A title is required.",
    );
    expect(getHttpErrorMessage(403)).toContain("do not have permission");
    expect(getHttpErrorMessage(409)).toContain("conflict");
    expect(getHttpErrorMessage(429)).toContain("Too many requests");
    expect(getHttpErrorMessage(503)).toContain("trouble responding");
  });

  it("uses status-aware and fallback API messages", () => {
    expect(getApiErrorMessage({ status: 404 })).toContain("not found");
    expect(getApiErrorMessage(null, "Try again later.")).toBe(
      "Try again later.",
    );
  });
});
