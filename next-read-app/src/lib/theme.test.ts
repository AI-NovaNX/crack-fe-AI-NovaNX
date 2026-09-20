import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyTheme,
  getTheme,
  setTheme,
  subscribeTheme,
  THEME_EVENT,
} from "@/lib/theme";

afterEach(() => {
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
  localStorage.clear();
});

describe("applyTheme / getTheme", () => {
  it("toggles the dark class and color-scheme style", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(getTheme()).toBe("dark");

    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(getTheme()).toBe("light");
  });
});

describe("setTheme", () => {
  it("persists the theme and notifies listeners", () => {
    const listener = vi.fn();
    window.addEventListener(THEME_EVENT, listener);

    setTheme("dark");

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(THEME_EVENT, listener);
  });

  it("still applies the theme when storage throws", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    expect(() => setTheme("light")).not.toThrow();
    expect(getTheme()).toBe("light");

    spy.mockRestore();
  });
});

describe("subscribeTheme", () => {
  it("invokes update on theme events and reacts to cross-tab storage changes", () => {
    const update = vi.fn();
    const unsubscribe = subscribeTheme(update);

    window.dispatchEvent(new Event(THEME_EVENT));
    expect(update).toHaveBeenCalledTimes(1);

    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: "light" }),
    );
    expect(getTheme()).toBe("light");
    expect(update).toHaveBeenCalledTimes(2);

    window.dispatchEvent(
      new StorageEvent("storage", { key: "other", newValue: "irrelevant" }),
    );
    expect(update).toHaveBeenCalledTimes(2);

    unsubscribe();
    window.dispatchEvent(new Event(THEME_EVENT));
    expect(update).toHaveBeenCalledTimes(2);
  });
});
