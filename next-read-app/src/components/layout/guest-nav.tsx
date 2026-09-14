"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import Image from "next/image";
import Link from "next/link";

import nexReadLogo from "@/assets/logos/nexread-logo.png";
import { buttonVariants } from "@/components/ui/button";
import type { GuestNavProps } from "@/types/guest-nav";
import { cn } from "@/lib/utils";

const defaultLoginAction = {
  label: "Login",
  href: "/login" as const,
};

const defaultRegisterAction = {
  label: "Register",
  href: "/register" as const,
};

export function GuestNav({
  className,
  loginAction = defaultLoginAction,
  registerAction = defaultRegisterAction,
}: GuestNavProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[64px] sm:min-h-[95.4px] w-full items-center justify-between gap-2 flex-wrap rounded-[32px] border-[0.9px] border-solid border-border bg-card px-3 py-2 sm:px-[16.9px] text-left font-outfit text-sm text-muted-foreground shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.2)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(105deg,rgba(255,_255,_255,_0.09),rgba(255,_255,_255,_0.02)_42%,rgba(124,_92,_255,_0.1)_100%)] before:content-['']",
        className,
      )}
    >
      <Link
        href="/"
        aria-label="NexRead home"
        className="relative z-10 h-9 w-[94px] sm:h-[69.6px] sm:w-[180.3px] shrink-0"
      >
        <Image
          src={nexReadLogo}
          alt="nexread logo"
          width={180}
          height={70}
          priority
          className="h-full w-full rounded-[26.4px] object-cover shadow-[0px_10px_15px_-3px_rgba(0,_184,_219,_0.2),_0px_4px_6px_-4px_rgba(0,_184,_219,_0.2)]"
        />
      </Link>

      <div className="relative z-10 flex shrink-0 items-center justify-end gap-2">
        <ThemeToggle />
        <Link
          href={loginAction.href}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-9 min-w-0 sm:h-14 sm:min-w-[120px] rounded-num-30504000 border-[0.9px] border-border bg-secondary px-3 text-xs sm:px-6 sm:text-base font-extrabold text-foreground shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl hover:bg-muted",
          )}
        >
          {loginAction.label}
        </Link>

        <Link
          href={registerAction.href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-9 min-w-0 sm:h-14 sm:min-w-[132px] rounded-num-30504000 px-3 text-xs sm:px-6 sm:text-base font-extrabold shadow-[0px_10px_15px_-3px_rgba(0,_211,_243,_0.25),_0px_4px_6px_-4px_rgba(0,_211,_243,_0.25)]",
          )}
        >
          {registerAction.label}
        </Link>
      </div>
    </div>
  );
}
