"use client";

import {
  CheckCircle2,
  LoaderCircle,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";
import { cn } from "@/lib/utils";
import { AnimatedBook, BookHoverCard } from "@/components/shared/animated-book";

type ApprovalLoan = {
  id: number;
  book: {
    title: string;
    coverUrl?: string | null;
    coverClassName?: string | null;
    author?: { name?: string };
    category?: { name?: string };
  };
  user: { fullName: string; email: string };
  borrowedAt: string;
  dueAt: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function AdminReturnApprovalModal({
  loan,
  onClose,
  onProcessed,
}: {
  loan: ApprovalLoan;
  onClose: () => void;
  onProcessed: (loanId: number) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const toast = useToast();

  async function handleApprove() {
    if (pending.current) return;
    pending.current = true;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/loans/${loan.id}/approve`, {
        method: "PATCH",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Failed to approve return.");

      toast({
        title: "Return approved",
        description: `"${loan.book.title}" has been marked as returned.`,
        variant: "success",
      });
      onProcessed(loan.id);
    } catch (error) {
      toast({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  const busy = submitting;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        backdropClassName="z-[110] bg-[#030712]/80"
        viewportClassName="z-[111] px-4 py-8"
        className="relative max-w-[460px] gap-0 overflow-hidden rounded-[28px] border-palette-indigo-300-20 bg-card p-0 font-outfit text-palette-slate-50 shadow-[0_30px_90px_rgba(6,_10,_28,_0.6)] ring-0 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(77,_222,_255,_0.06),transparent_42%,rgba(124,_92,_255,_0.10))] before:content-['']"
      >
        {/* Header */}
        <CardHeader className="relative grid grid-cols-[1fr_auto] items-center border-b border-palette-indigo-300-20 px-6 py-5">
          <div>
            <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-palette-cyan-300">
              Admin / Return Verification
            </p>
            <DialogTitle className="mt-1 text-base font-extrabold">
              Return Request
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Review and approve or reject the return request for{" "}
            {loan.book.title} from {loan.user.fullName}.
          </DialogDescription>
          <DialogClose
            disabled={busy}
            aria-label="Close modal"
            className="rounded-full border border-transparent bg-secondary p-1.5 text-palette-slate-400 transition-colors hover:border-palette-cyan-300 hover:bg-accent hover:text-palette-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palette-cyan-300 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </CardHeader>

        <CardContent className="relative space-y-4 px-6 pt-5 pb-6">
          {/* Book card */}
          <div className="flex items-center gap-4 rounded-2xl border border-palette-indigo-300-20 bg-secondary p-4">
            <BookHoverCard className="w-[56px] shrink-0 border-0">
              <AnimatedBook
                title={loan.book.title}
                author={loan.book.author?.name}
                coverUrl={getBookCoverUrl(loan.book.coverUrl)}
                coverClassName={getBookCoverClassName(loan.book.coverClassName)}
                compact
              />
            </BookHoverCard>
            <div className="min-w-0 flex-1">
              {loan.book.category?.name && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-semibold text-cyan-300">
                  {loan.book.category.name}
                </span>
              )}
              <h2 className="mt-1.5 truncate text-sm font-extrabold leading-snug">
                {loan.book.title}
              </h2>
              <p className="mt-0.5 truncate text-[10px] text-palette-slate-400">
                {loan.book.author?.name || "Unknown author"}
              </p>
            </div>
          </div>

          {/* Borrower info */}
          <div className="rounded-2xl border border-palette-indigo-300-20 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <UserRound
                className="size-3.5 text-palette-slate-400"
                aria-hidden="true"
              />
              <p className="font-mono text-[8px] tracking-[0.16em] text-palette-slate-400 uppercase">
                Borrower
              </p>
            </div>
            <p className="mt-1.5 text-sm font-extrabold">
              {loan.user.fullName}
            </p>
            <p className="mt-0.5 text-[10px] text-palette-slate-400">
              {loan.user.email}
            </p>
            <div className="mt-3 flex gap-4 text-[10px] text-palette-slate-400">
              <span>
                Borrowed:{" "}
                <strong className="text-palette-slate-50">
                  {formatDate(loan.borrowedAt)}
                </strong>
              </span>
              <span>
                Due:{" "}
                <strong className="text-palette-slate-50">
                  {formatDate(loan.dueAt)}
                </strong>
              </span>
            </div>
          </div>

          {/* Instruction */}
          <div className="rounded-xl border border-palette-indigo-300-20 bg-secondary/60 px-4 py-3">
            <p className="text-[11px] leading-5 text-palette-slate-400">
              Make sure the physical book has been received before approving the
              return.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={handleApprove}
              aria-busy={submitting}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-sm font-extrabold text-white shadow-[0_6px_20px_#22d3ee25]",
                "transition-all enabled:hover:scale-[1.01] enabled:hover:shadow-[0_8px_28px_#7c5cff45] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-skyblue disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {submitting ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )}
              {submitting ? "Approving…" : "Approve Return"}
            </button>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
