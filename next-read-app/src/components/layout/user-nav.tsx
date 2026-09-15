"use client";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitAuth } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";

import bellIcon from "@/assets/icons/BookListCategory/Icon-2.svg";
import nexReadLogo from "@/assets/icons/BookListCategory/source/image.png";
import { HeaderSearch } from "@/components/layout/header-search";
import { useToast } from "@/components/providers/app-feedback-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserNavProps } from "@/types/user-nav";
import { getAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const defaultUser = {
  name: "John Doe",
  initials: "JD",
};

export const UserNav = ({
  className,
  cartCount = 3,
  searchPlaceholder = "Search book, author, ISBN...",
  user = defaultUser,
}: UserNavProps) => {
  const router = useRouter();
  const toast = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const avatarSrc = getAvatarSrc(user.avatar);
  const logout = async () => {
    setLoggingOut(true);
    try {
      await submitAuth("logout");
      toast({ title: "Berhasil keluar" });
      router.push("/");
      router.refresh();
    } catch {
      toast({
        title: "Gagal keluar",
        description: "Periksa koneksi Anda lalu coba kembali.",
        variant: "error",
      });
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div
      className={cn(
        "relative z-50 flex min-h-12 w-full flex-wrap items-center gap-2 rounded-2xl border-[0.9px] border-solid border-palette-indigo-300-20 bg-gray-200 px-2 py-2 text-left font-outfit text-sm text-palette-slate-400 shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.18)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(105deg,rgba(255,_255,_255,_0.08),rgba(255,_255,_255,_0.02)_42%,rgba(124,_92,_255,_0.08)_100%)] before:content-[''] sm:min-h-[80px] sm:gap-3 sm:rounded-[32px] sm:px-[16.9px] lg:flex-nowrap xl:gap-5",
        className,
      )}
    >
      <Link
        href="/"
        aria-label="NexRead home"
        className="relative z-10 h-9 w-[120px] shrink-0 sm:h-[69.6px] sm:w-[180px]"
      >
        <Image
          src={nexReadLogo}
          alt="nexread logo"
          width={180}
          height={70}
          priority
          className="h-full w-full rounded-[26.4px] object-contain shadow-[0px_10px_15px_-3px_rgba(0,_184,_219,_0.2),_0px_4px_6px_-4px_rgba(0,_184,_219,_0.2)]"
        />
      </Link>

      <HeaderSearch placeholder={searchPlaceholder} />

      <div className="relative z-10 ml-auto flex min-h-8 max-w-full shrink-0 flex-nowrap items-center justify-end gap-1 text-center text-[10px] text-foreground sm:min-h-14 sm:gap-3">
        <Link
          href="/cart"
          aria-label={`Open cart with ${cartCount} items`}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "relative box-border h-8 w-8 rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:w-14 sm:rounded-num-30504000",
          )}
        >
          <ShoppingCart
            className="size-3.5 shrink-0 text-palette-slate-50 sm:size-6"
            aria-hidden="true"
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-num-30504000 bg-skyblue leading-[15px] font-extrabold shadow-[0px_10px_15px_-3px_rgba(0,_211,_243,_0.3),_0px_4px_6px_-4px_rgba(0,_211,_243,_0.3)]">
              {cartCount}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          aria-label="Open notifications"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "box-border h-8 w-8 rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:w-14 sm:rounded-num-30504000",
          )}
        >
          <Image
            src={bellIcon}
            alt=""
            className="size-3.5"
            aria-hidden="true"
          />
        </Link>

        <ThemeToggle />

        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger
            aria-label="Open user menu"
            title="Open user menu"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "box-border h-8 min-w-0 justify-start gap-1 rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary py-1 pl-1 text-[9px] text-palette-slate-50 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:min-w-[120px] sm:gap-3 sm:rounded-num-30504000 sm:py-1.5 sm:pr-5 sm:pl-1.5 sm:text-xs",
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full [background:linear-gradient(135deg,_#4ddeff,_#55d6ff_7.14%,_#5bcdff_14.29%,_#61c5ff_21.43%,_#65bcff_28.57%,_#69b3ff_35.71%,_#6dabff_42.86%,_#70a2ff_50%,_#7399ff_57.14%,_#758fff_64.29%,_#7786ff_71.43%,_#797cff_78.57%,_#7a72ff_85.71%,_#7b67ff_92.86%,_#7c5cff)] text-[8px] font-extrabold leading-4 sm:h-11 sm:w-11 sm:text-sm">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                user.initials
              )}
            </span>
            <span className="flex min-w-0 max-w-14 flex-col items-center truncate text-[9px] text-palette-slate-50 sm:max-w-none sm:text-[17px]">
              <b className="relative truncate leading-5">{user.name}</b>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-2xl border border-palette-indigo-300-20 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(17,24,39,0.88))] p-1.5 text-palette-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.45)] ring-0 backdrop-blur-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-palette-slate-400">
                My Corner
              </DropdownMenuLabel>
              {[
                ["Favorite Books", "/favorites"],
                ["Favorite Author", "/favorite-author"],
                ["Profile", "/borrowed?tab=profile"],
                ["Borrowed List", "/borrowed?tab=borrowed"],
                ["Reviews", "/borrowed?tab=reviews"],
              ].map(([label, href]) => (
                <DropdownMenuLinkItem
                  key={href}
                  render={<Link href={href} />}
                  className="mt-1 rounded-xl border border-transparent bg-white/5 px-3 py-2 font-medium text-palette-slate-50 transition-all focus:border-cyan-400/60 focus:bg-cyan-400/10 focus:text-cyan-100"
                >
                  {label}
                </DropdownMenuLinkItem>
              ))}
              <DropdownMenuItem
                disabled={loggingOut}
                variant="destructive"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="mt-1 rounded-xl border border-transparent bg-white/5 px-3 py-2 font-medium text-red-200 transition-all focus:border-red-400/60 focus:bg-red-400/10 focus:text-red-100"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog
          open={isLogoutDialogOpen}
          onOpenChange={setIsLogoutDialogOpen}
        >
          <AlertDialogContent>
                <AlertDialogTitle className="text-xl font-extrabold">
                  Keluar dari NexRead?
                </AlertDialogTitle>
                <AlertDialogDescription className="pt-2 text-sm leading-6 text-palette-slate-400">
                  Sesi Anda akan diakhiri pada perangkat ini.
                </AlertDialogDescription>
                <div className="flex justify-end gap-3 pt-6">
                  <AlertDialogCancel
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void logout()}
                    className={buttonVariants({ variant: "destructive" })}
                  >
                    Ya, keluar
                  </AlertDialogAction>
                </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
