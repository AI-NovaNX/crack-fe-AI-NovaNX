"use client";

import Link from "next/link";
import { AlertTriangle, Bell } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OverdueLoan = {
  id: string | number;
  title: string;
  dueAt: string;
};

function getOverdueLoans(value: unknown): OverdueLoan[] {
  const body = value as { data?: unknown; loans?: unknown } | unknown[] | null;
  const loans = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.loans)
        ? body.loans
        : [];
  const now = Date.now();

  return loans.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    const status = String(source.status ?? "").toLowerCase();
    if (status.includes("return") && !status.includes("request")) return [];
    const dueAt = source.dueAt ?? source.dueDate ?? source.returnDate;
    if (typeof dueAt !== "string") return [];
    const dueTime = new Date(dueAt).getTime();
    if (!Number.isFinite(dueTime) || dueTime + 86_400_000 > now) return [];
    const book = (source.book ?? source.bookItem ?? source.item) as
      | Record<string, unknown>
      | undefined;
    return [
      {
        id: (source.id as string | number | undefined) ?? dueAt,
        title:
          typeof book?.title === "string"
            ? book.title
            : typeof source.title === "string"
              ? source.title
              : "Book loan",
        dueAt,
      },
    ];
  });
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function UserOverdueNotification() {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [notificationError, setNotificationError] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverdueLoans() {
      setNotificationError("");
      try {
        const response = await fetch("/api/borrowed", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Overdue notifications could not be loaded.");
        }
        setOverdueLoans(
          getOverdueLoans(await response.json().catch(() => null)),
        );
      } catch {
        if (!controller.signal.aborted) {
          setOverdueLoans([]);
          setNotificationError("Notifications could not be loaded.");
        }
      }
    }

    void loadOverdueLoans();
    const interval = window.setInterval(loadOverdueLoans, 60_000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [retryAttempt]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${overdueLoans.length} overdue book notifications`}
        title="Overdue book notifications"
        className="relative inline-flex box-border h-8 w-8 items-center justify-center rounded-full border-[0.9px] border-solid border-palette-indigo-300-20 bg-secondary text-palette-slate-50 transition hover:border-palette-cyan-300 hover:bg-accent sm:h-14 sm:w-14"
      >
        <Bell className="size-3.5 sm:size-6" aria-hidden="true" />
        {overdueLoans.length > 0 && (
          <span className="absolute -top-2 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-extrabold text-slate-950 ring-2 ring-gray-200">
            {overdueLoans.length > 99 ? "99+" : overdueLoans.length}
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
                onClick={() => setRetryAttempt((value) => value + 1)}
                className="justify-center rounded-xl bg-white/5 text-xs font-bold text-palette-slate-50 hover:bg-cyan-400/10"
              >
                Try again
              </DropdownMenuItem>
            </>
          ) : overdueLoans.length > 0 ? (
            <>
              <DropdownMenuLinkItem
                render={<Link href="/borrowed?tab=borrowed&status=overdue" />}
                className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-3 text-left hover:bg-amber-400/15"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-extrabold">
                    {overdueLoans.length} overdue book
                    {overdueLoans.length === 1 ? "" : "s"}
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-palette-slate-400">
                    Return books that passed their due date.
                  </span>
                </span>
              </DropdownMenuLinkItem>
              {overdueLoans.slice(0, 3).map((loan) => (
                <p
                  key={loan.id}
                  className="truncate px-3 pt-2 text-[10px] text-palette-slate-400"
                >
                  {loan.title} · due {formatDueDate(loan.dueAt)}
                </p>
              ))}
            </>
          ) : (
            <p className="px-3 py-5 text-center text-xs text-palette-slate-400">
              No overdue books.
            </p>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
