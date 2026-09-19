"use client";

import { Star, X } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import {
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const toast = useToast();

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      toast({ title: "Please choose a rating first", variant: "info" });
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
        throw new Error(body?.message || "The review could not be submitted.");
      toast({
        title: "Review submitted successfully",
        description: book.title,
        variant: "success",
      });
      onSubmitted();
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
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
        <CardHeader className="relative grid grid-cols-[1fr_auto] items-center border-b border-palette-indigo-300-20 px-6 py-5">
          <DialogTitle className="text-lg font-extrabold">
            Give Review
          </DialogTitle>
          <DialogDescription className="sr-only">
            Give a rating and review for {book.title}.
          </DialogDescription>
          <DialogClose
            disabled={submitting}
            aria-label="Close review modal"
            className="rounded-full border border-transparent bg-secondary p-1.5 text-palette-slate-400 transition-colors hover:border-palette-cyan-300 hover:bg-accent hover:text-palette-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-palette-cyan-300 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </DialogClose>
        </CardHeader>
        <CardContent className="relative px-6 pt-5 pb-6">
          <form onSubmit={submitReview}>
            <fieldset disabled={submitting}>
              <legend className="w-full text-center text-xs font-extrabold text-palette-slate-400">
                Give Rating
              </legend>
              <div className="mt-2 flex justify-center gap-2" role="radiogroup" aria-label="Book rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} stars`}
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
                Review for {book.title}
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
      </DialogContent>
    </Dialog>
  );
}
