import { describe, expect, it } from "vitest";

import { pageBackgroundClassName } from "@/lib/page-background";
import { queryClientConfig } from "@/lib/queryClient";

describe("shared configuration", () => {
  it("keeps the query cache and page background defaults", () => {
    expect(queryClientConfig.staleTime).toBe(60_000);
    expect(pageBackgroundClassName).toContain("nexread-page-background");
  });
});
