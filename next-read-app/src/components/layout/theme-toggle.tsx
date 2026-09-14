"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, subscribeTheme } from "@/lib/theme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "dark" as const);
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  return <button type="button" title={label} aria-label={label} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-14"><Sun className="hidden size-4 dark:block sm:size-6" aria-hidden="true" /><Moon className="size-4 dark:hidden sm:size-6" aria-hidden="true" /></button>;
}
