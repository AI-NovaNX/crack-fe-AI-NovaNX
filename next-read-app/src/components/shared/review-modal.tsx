"use client";

import { Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useToast } from "@/components/providers/app-feedback-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReviewBook = { id: string; title: string };

export function ReviewModal({
  book,
  onClose,
  onSubmitted,
}: {
  book: ReviewBook;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, submitting]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      toast({ title: "Pilih rating terlebih dahulu", variant: "info" });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, rating, comment }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Review belum dapat dikirim.");
      toast({
        title: "Review berhasil dikirim",
        description: book.title,
        variant: "success",
      });
      onSubmitted();
    } catch (error) {
      toast({
        title: "Gagal mengirim review",
        description:
          error instanceof Error ? error.message : "Silakan coba kembali.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-[#030712]/75 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        className="relative w-full max-w-[420px] gap-0 overflow-hidden rounded-[28px] border border-palette-indigo-300-20 bg-card py-0 font-outfit text-palette-slate-50 shadow-[0_30px_90px_rgba(6,_10,_28,_0.55)] ring-0 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(77,_222,_255,_0.08),transparent_42%,rgba(124,_92,_255,_0.12))] before:content-['']"
      >
        <CardHeader className="relative grid grid-cols-[1fr_auto] items-center border-b border-palette-indigo-300-20 px-6 py-5">
          <CardTitle id="review-dialog-title" className="text-lg font-extrabold">
            Give Review
          </CardTitle>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Tutup modal review"
            className="rounded-full border border-transparent bg-secondary p-1.5 text-palette-slate-400 transition-colors hover:border-palette-cyan-300 hover:bg-accent hover:text-palette-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palette-cyan-300 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </CardHeader>
        <CardContent className="relative px-6 pt-5 pb-6">
          <form onSubmit={submitReview}>
            <fieldset disabled={submitting}>
              <legend className="w-full text-center text-xs font-extrabold text-palette-slate-400">
                Give Rating
              </legend>
              <div className="mt-2 flex justify-center gap-2" role="radiogroup" aria-label="Rating buku">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} bintang`}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 text-palette-slate-400 transition-all hover:scale-110 hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palette-cyan-300"
                  >
                    <Star
                      className={cn(
                        "size-8",
                        value <= rating &&
                          "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.35)] dark:fill-yellow-400 dark:text-yellow-400",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <label htmlFor="review-comment" className="sr-only">
                Review untuk {book.title}
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                placeholder="Please share your thoughts about this book"
                className="mt-5 min-h-36 w-full resize-y rounded-2xl border border-palette-indigo-300-20 bg-secondary p-4 text-sm text-palette-slate-50 shadow-[inset_0_0_0_1px_rgba(255,_255,_255,_0.03)] outline-none placeholder:text-xs placeholder:text-palette-slate-400 focus:border-palette-cyan-300 focus:ring-2 focus:ring-palette-cyan-300/20"
              />
              <button
                type="submit"
                className="mt-4 h-11 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-sm font-extrabold text-white shadow-[0_6px_20px_#22d3ee35] transition-all enabled:hover:scale-[1.01] enabled:hover:shadow-[0_8px_28px_#7c5cff45] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-skyblue disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send"}
              </button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
