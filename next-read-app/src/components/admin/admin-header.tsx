"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import nexReadLogo from "@/assets/logos/nexread-logo.png";
import { useToast } from "@/components/providers/app-feedback-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarSrc } from "@/lib/avatar";
import { submitAuth } from "@/lib/auth";

type AdminHeaderProps = {
  user: {
    name: string;
    initials: string;
    avatar?: string | null;
  };
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const toast = useToast();
  const avatarSrc = getAvatarSrc(user.avatar);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [notificationError, setNotificationError] = useState("");
  const [notificationRetry, setNotificationRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPendingReturns() {
      setNotificationError("");
      try {
        const response = await fetch(
          "/api/admin/loans?status=RETURN_REQUESTED&page=1&limit=1",
          { cache: "no-store", signal: controller.signal },
        );
        const body = (await response.json().catch(() => null)) as {
          meta?: { total?: number };
        } | null;
        if (!response.ok) {
          throw new Error("Return notifications could not be loaded.");
        }
        setPendingReturns(
          typeof body?.meta?.total === "number" ? body.meta.total : 0,
        );
      } catch {
        if (!controller.signal.aborted) {
          setPendingReturns(0);
          setNotificationError("Return notifications could not be loaded.");
        }
      }
    }

    void loadPendingReturns();
    const interval = window.setInterval(loadPendingReturns, 60_000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [notificationRetry]);

  async function logout() {
    setLoggingOut(true);
    try {
      await submitAuth("logout");
      toast({ title: "Signed out" });
      router.push("/login");
      router.refresh();
    } catch {
      toast({
        title: "Sign out failed",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex min-h-[88px] items-center justify-between gap-4 rounded-[28px] border border-palette-indigo-300-20 bg-gray-200 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:px-5">
      <Link
        href="/admin/dashboard"
        aria-label="NexRead admin home"
        className="relative h-12 w-[132px] shrink-0 overflow-hidden rounded-2xl sm:h-14 sm:w-[160px]"
      >
        <Image
          src={nexReadLogo}
          alt="NexRead"
          priority
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`${pendingReturns} pending return requests`}
            title="Return requests"
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-palette-indigo-300-20 bg-secondary text-palette-slate-50 transition hover:border-palette-cyan-300 hover:bg-accent sm:size-12"
          >
            <Bell className="size-4 sm:size-5" aria-hidden="true" />
            {pendingReturns > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-extrabold text-slate-950 ring-2 ring-gray-200">
                {pendingReturns > 99 ? "99+" : pendingReturns}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-80 rounded-2xl border border-palette-indigo-300-20 bg-white p-2 text-palette-slate-50 shadow-2xl ring-0 dark:bg-[#151236]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-[10px] tracking-[0.18em] text-palette-slate-400 uppercase">
                Notifications
              </DropdownMenuLabel>
              {notificationError ? (
                <>
                  <p className="px-3 py-4 text-center text-xs text-rose-300">
                    {notificationError}
                  </p>
                  <DropdownMenuItem
                    onClick={() => setNotificationRetry((value) => value + 1)}
                    className="justify-center rounded-xl bg-white/5 text-xs font-bold text-palette-slate-50 hover:bg-cyan-400/10"
                  >
                    Try again
                  </DropdownMenuItem>
                </>
              ) : pendingReturns > 0 ? (
                <DropdownMenuLinkItem
                  render={<Link href="/admin/loans?status=RETURN_REQUESTED" />}
                  className="mt-1 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-3 text-left hover:bg-amber-400/15"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                    <Bell className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-extrabold">
                      {pendingReturns} return request
                      {pendingReturns === 1 ? "" : "s"}
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-palette-slate-400">
                      Review pending book returns.
                    </span>
                  </span>
                </DropdownMenuLinkItem>
              ) : (
                <p className="px-3 py-5 text-center text-xs text-palette-slate-400">
                  No pending notifications.
                </p>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-12 max-w-[210px] items-center gap-2 rounded-full border border-palette-indigo-300-20 bg-secondary py-1.5 pr-4 pl-1.5 text-left text-palette-slate-50 outline-none transition hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:gap-3 sm:pr-5">
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-xs font-extrabold text-white sm:size-11">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user.initials
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-extrabold sm:text-xs">
                {user.name}
              </span>
              <span className="block text-[8px] font-semibold tracking-wider text-palette-slate-400 uppercase sm:text-[9px]">
                Administrator
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-2xl border border-palette-indigo-300-20 bg-card p-1.5 shadow-2xl ring-0"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2 text-[10px] tracking-[0.18em] uppercase">
                Admin account
              </DropdownMenuLabel>
              <DropdownMenuLinkItem
                render={<Link href="/" />}
                className="rounded-xl px-3 py-2"
              >
                <UserRound aria-hidden="true" />
                View user site
              </DropdownMenuLinkItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={loggingOut}
                onClick={() => setLogoutDialogOpen(true)}
                className="mt-1 rounded-xl px-3 py-2"
              >
                <LogOut aria-hidden="true" />
                {loggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-xl font-extrabold">
            Sign out of NexRead Admin?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-sm leading-6 text-palette-slate-400">
            Your Admin session will end on this device.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 pt-6">
            <AlertDialogCancel
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void logout()}
              className={buttonVariants({ variant: "destructive" })}
            >
              Yes, sign out
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
