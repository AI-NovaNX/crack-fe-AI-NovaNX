import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CatalogUnavailable } from "@/components/shared/catalog-unavailable";
import { InlineErrorNotice } from "@/components/shared/inline-error-notice";
import { RouteErrorState } from "@/components/shared/route-error-state";
import { AppFeedbackProvider } from "@/components/providers/app-feedback-provider";

describe("CatalogUnavailable", () => {
  it("renders the given title and message", () => {
    render(
      <AppFeedbackProvider>
        <CatalogUnavailable title="Books unavailable" message="Try again" />
      </AppFeedbackProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Books unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Try again").length).toBeGreaterThan(0);
  });
});

describe("InlineErrorNotice", () => {
  it("renders an alert role with the message", () => {
    render(
      <AppFeedbackProvider>
        <InlineErrorNotice title="Error" message="Something went wrong" />
      </AppFeedbackProvider>,
    );
    expect(
      screen
        .getAllByRole("alert")
        .some((alert) => alert.textContent === "Something went wrong"),
    ).toBe(true);
  });
});

describe("RouteErrorState", () => {
  it("renders the default title within the main region", () => {
    render(
      <AppFeedbackProvider>
        <RouteErrorState reset={() => {}} />
      </AppFeedbackProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "The page could not be loaded" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders a custom title", () => {
    render(
      <AppFeedbackProvider>
        <RouteErrorState title="Custom error" reset={() => {}} />
      </AppFeedbackProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Custom error" }),
    ).toBeInTheDocument();
  });
});
