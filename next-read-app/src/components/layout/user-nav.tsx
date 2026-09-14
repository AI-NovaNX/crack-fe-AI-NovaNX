"use client";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { submitAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import bellIcon from "@/assets/icons/BookListCategory/Icon-2.svg";
import nexReadLogo from "@/assets/icons/BookListCategory/source/image.png";
import { HeaderSearch } from "@/components/layout/header-search";
import { useToast } from "@/components/providers/app-feedback-provider";
import { buttonVariants } from "@/components/ui/button";
import type { UserNavProps } from "@/types/user-nav";
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
        "relative z-50 flex min-h-12 w-full flex-wrap items-center gap-2 rounded-2xl border-[0.9px] border-solid border-palette-indigo-300-20 bg-gray-200 px-2 py-2 text-left font-outfit text-sm text-palette-slate-400 shadow-[0px_25px_50px_-12px_rgba(0,_0,_0,_0.18)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(105deg,rgba(255,_255,_255,_0.08),rgba(255,_255,_255,_0.02)_42%,rgba(124,_92,_255,_0.08)_100%)] before:content-[''] sm:min-h-[95.4px] sm:min-h-[80px] sm:gap-3 sm:rounded-[32px] sm:px-[16.9px] xl:gap-5",
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

      <div className="relative z-10 flex min-h-8 max-w-full flex-wrap items-center justify-end gap-1 text-center text-[10px] text-foreground sm:min-h-14 sm:gap-3">
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

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            aria-label="Open user menu"
            title="Open user menu"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "box-border h-8 min-w-0 justify-start gap-1 rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary py-1 pl-1 text-[9px] text-palette-slate-50 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.04)] backdrop-blur-xl hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:min-w-[120px] sm:gap-3 sm:rounded-num-30504000 sm:py-1.5 sm:pr-5 sm:pl-1.5 sm:text-xs",
            )}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full [background:linear-gradient(135deg,_#4ddeff,_#55d6ff_7.14%,_#5bcdff_14.29%,_#61c5ff_21.43%,_#65bcff_28.57%,_#69b3ff_35.71%,_#6dabff_42.86%,_#70a2ff_50%,_#7399ff_57.14%,_#758fff_64.29%,_#7786ff_71.43%,_#797cff_78.57%,_#7a72ff_85.71%,_#7b67ff_92.86%,_#7c5cff)] text-[8px] font-extrabold leading-4 sm:h-11 sm:w-11 sm:text-sm">
              {user.initials}
            </span>
            <span className="flex min-w-0 max-w-14 flex-col items-center truncate text-[9px] text-palette-slate-50 sm:max-w-none sm:text-[17px]">
              <b className="relative truncate leading-5">{user.name}</b>
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-palette-indigo-300-20 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(17,24,39,0.88))] p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-palette-slate-400">
                My Corner
              </div>
              <Link
                href="/favorites"
                onClick={() => setIsUserMenuOpen(false)}
                className="block rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm font-medium text-palette-slate-50 transition-all hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:text-cyan-100"
              >
                Favorite Books
              </Link>
              <Link
                href="/favorite-author"
                onClick={() => setIsUserMenuOpen(false)}
                className="mt-1 block rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm font-medium text-palette-slate-50 transition-all hover:border-violet-400/60 hover:bg-violet-400/10 hover:text-violet-100"
              >
                Favorite Author
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="mt-1 block rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm font-medium text-palette-slate-50 transition-all hover:border-pink-400/60 hover:bg-pink-400/10 hover:text-pink-100"
              >
                Profile
              </Link>
            </div>
          )}
        </div>
        <Dialog.Root>
          <Dialog.Trigger
            disabled={loggingOut}
            className={buttonVariants({ variant: "outline" })}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" />
            <Dialog.Viewport className="fixed inset-0 z-[101] flex items-center justify-center p-5">
              <Dialog.Popup className="w-full max-w-md rounded-[28px] border border-palette-indigo-300-20 bg-card p-6 text-left text-palette-slate-50 shadow-2xl outline-none">
                <Dialog.Title className="text-xl font-extrabold">
                  Keluar dari NexRead?
                </Dialog.Title>
                <Dialog.Description className="pt-2 text-sm leading-6 text-palette-slate-400">
                  Sesi Anda akan diakhiri pada perangkat ini.
                </Dialog.Description>
                <div className="flex justify-end gap-3 pt-6">
                  <Dialog.Close
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Batal
                  </Dialog.Close>
                  <Dialog.Close
                    onClick={() => void logout()}
                    className={buttonVariants({ variant: "destructive" })}
                  >
                    Ya, keluar
                  </Dialog.Close>
                </div>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
};
