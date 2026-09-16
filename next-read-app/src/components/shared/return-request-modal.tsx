"use client";

import { BookMarked, LoaderCircle, X } from "lucide-react";
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

type ReturnBook = { id: string; title: string; author: string };

export function ReturnRequestModal({
  loan,
  onClose,
  onRequested,
}: {
  loan: { id: number | string; book: ReturnBook };
  onClose: () => void;
  onRequested: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const toast = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/loans/${encodeURIComponent(loan.id)}/return-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Failed to submit return request.");

      toast({
        title: "Return request submitted",
        description: `"${loan.book.title}" is awaiting admin confirmation.`,
        variant: "success",
      });
      onRequested();
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <DialogContent
        backdropClassName="z-[110] bg-[#030712]/75"
        viewportClassName="z-[111] px-4 py-8"
        className="relative max-w-[420px] gap-0 overflow-hidden rounded-[28px] border-palette-indigo-300-20 bg-card p-0 font-outfit text-palette-slate-50 shadow-[0_30px_90px_rgba(6,_10,_28,_0.55)] ring-0 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(77,_222,_255,_0.08),transparent_42%,rgba(124,_92,_255,_0.12))] before:content-['']"
      >
        {/* Header */}
        <CardHeader className="relative grid grid-cols-[1fr_auto] items-center border-b border-palette-indigo-300-20 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-400/15">
              <BookMarked
                className="size-4 text-amber-400"
                aria-hidden="true"
              />
            </div>
            <DialogTitle className="text-base font-extrabold">
              Return Book
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirm the return request for {loan.book.title}. Admin will verify
            the physical book return.
          </DialogDescription>
          <DialogClose
            disabled={submitting}
            aria-label="Close modal"
            className="rounded-full border border-transparent bg-secondary p-1.5 text-palette-slate-400 transition-colors hover:border-palette-cyan-300 hover:bg-accent hover:text-palette-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palette-cyan-300 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </CardHeader>

        {/* Body */}
        <CardContent className="relative px-6 pt-6 pb-7">
          {/* Book info */}
          <div className="rounded-2xl border border-palette-indigo-300-20 bg-secondary p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-palette-slate-400">
              Book to return
            </p>
            <p className="mt-1.5 text-sm font-extrabold leading-snug">
              {loan.book.title}
            </p>
            <p className="mt-0.5 text-[11px] text-palette-slate-400">
              {loan.book.author}
            </p>
          </div>

          {/* Info banner */}
          <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/8 p-3.5">
            <p className="text-[11px] leading-5 text-amber-300/90">
              <span className="font-bold">Note:</span> After submitting, bring
              the physical book to the library. Admin will confirm receipt and
              update the loan status to{" "}
              <span className="font-bold">Returned</span>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(251,191,36,0.25)] transition-all enabled:hover:scale-[1.01] enabled:hover:shadow-[0_8px_28px_rgba(251,191,36,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {submitting ? "Submitting…" : "Submit Return Request"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="mt-2.5 h-10 w-full rounded-full border border-palette-indigo-300-20 bg-secondary text-sm font-semibold text-palette-slate-400 transition-colors hover:border-palette-indigo-300-20 hover:text-palette-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
