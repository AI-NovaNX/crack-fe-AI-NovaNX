import type { ReactNode } from "react";

import { AuthLogo } from "@/components/shared/auth/auth-logo";
import { pageBackgroundClassName } from "@/lib/page-background";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AuthPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <main
      className={cn(pageBackgroundClassName, "font-outfit text-foreground")}
    >
      <div className="absolute right-5 top-5"><ThemeToggle /></div>
      <section className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_460px]">
          <aside className="hidden flex-col gap-6 lg:flex">
            <AuthLogo />
            <div className="max-w-xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-primary">
                NexRead Book Portal
              </p>
              <h2 className="mt-4 text-5xl font-extrabold leading-tight text-foreground">
                Your digital gateway to smarter reading.
              </h2>
              <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-muted-foreground">
                Discover collections, reserve books, and keep every library
                activity flowing from one luminous portal.
              </p>
            </div>
          </aside>

          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.35)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,_255,_255,_0.1),rgba(255,_255,_255,_0.025)_48%,rgba(124,_92,_255,_0.1))] before:content-[''] sm:p-8">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="lg:hidden">
                <AuthLogo />
              </div>
              <header className="flex flex-col gap-2">
                <h1 className="text-[32px] font-extrabold leading-10 text-foreground">
                  {title}
                </h1>
                <p className="text-base font-semibold leading-7 text-muted-foreground">
                  {description}
                </p>
              </header>
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
