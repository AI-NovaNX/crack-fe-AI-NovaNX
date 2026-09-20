import { describe, expect, it } from "vitest";

import { getAvatarSrc, getInitials } from "@/lib/avatar";

describe("getInitials", () => {
  it("builds initials from the first two words", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
    expect(getInitials("  Grace   Hopper  Extra ")).toBe("GH");
  });

  it("falls back to U when no name is given", () => {
    expect(getInitials(undefined)).toBe("U");
    expect(getInitials(null)).toBe("U");
    expect(getInitials("   ")).toBe("U");
  });
});

describe("getAvatarSrc", () => {
  it("returns null when no avatar is provided", () => {
    expect(getAvatarSrc(undefined)).toBeNull();
    expect(getAvatarSrc(null)).toBeNull();
    expect(getAvatarSrc("")).toBeNull();
  });

  it("returns absolute and blob/data urls unchanged", () => {
    expect(getAvatarSrc("https://example.com/a.png")).toBe(
      "https://example.com/a.png",
    );
    expect(getAvatarSrc("blob:abc")).toBe("blob:abc");
    expect(getAvatarSrc("data:image/png;base64,abc")).toBe(
      "data:image/png;base64,abc",
    );
  });

  it("returns static asset paths unchanged", () => {
    expect(getAvatarSrc("/assets/images/user-avatar.svg")).toBe(
      "/assets/images/user-avatar.svg",
    );
    expect(getAvatarSrc("/images/foo.png")).toBe("/images/foo.png");
  });

  it("returns other relative paths unchanged when no API origin is configured", () => {
    expect(getAvatarSrc("/uploads/avatar.png")).toBe("/uploads/avatar.png");
  });

  it("returns non-slash relative values unchanged", () => {
    expect(getAvatarSrc("avatar.png")).toBe("avatar.png");
  });
});
