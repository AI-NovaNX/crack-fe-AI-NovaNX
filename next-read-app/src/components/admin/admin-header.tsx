"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";

import nexReadLogo from "@/assets/logos/nexread-logo.png";
import { useToast } from "@/components/providers/app-feedback-provider";
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

  async function logout() {
    setLoggingOut(true);
    try {
      await submitAuth("logout");
      toast({ title: "Berhasil keluar" });
      router.push("/login");
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

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-xl font-extrabold">
            Keluar dari NexRead Admin?
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2 text-sm leading-6 text-palette-slate-400">
            Sesi Admin Anda akan diakhiri pada perangkat ini.
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
    </header>
  );
}
