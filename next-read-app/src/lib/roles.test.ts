import { describe, expect, it } from "vitest";

import { isAdminRole, normalizeRole } from "@/lib/roles";

describe("role helpers", () => {
  it("normalizes whitespace and letter case", () => {
    expect(normalizeRole(" Admin ")).toBe("admin");
    expect(normalizeRole(null)).toBe("");
  });

  it("allows only the admin role into protected admin routes", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole(" administrator ")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
