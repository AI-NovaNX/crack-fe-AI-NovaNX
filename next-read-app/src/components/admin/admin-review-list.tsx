"use client";

import { Search, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Review = {
  id: number | string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { fullName?: string };
  book?: { title?: string };
};
type Response = {
  data?: Review[];
  meta?: { total?: number; totalPages?: number };
};

export function AdminReviewList() {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" });
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`/api/admin/reviews?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = (await response.json().catch(() => null)) as
          | Response
          | { message?: string }
          | null;
        if (!response.ok)
          throw new Error(
            body && "message" in body
              ? body.message
              : "Reviews could not be loaded.",
          );
        const result = body as Response;
        setReviews(result.data ?? []);
        setMeta({
          total: result.meta?.total ?? 0,
          totalPages: Math.max(1, result.meta?.totalPages ?? 1),
        });
      } catch (loadError) {
        if (!controller.signal.aborted)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Reviews could not be loaded.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [page, query]);

  async function remove() {
    if (!pending) return;
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pending.id }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "The review could not be deleted.");
      setReviews((current) =>
        current.filter((review) => review.id !== pending.id),
      );
      setPending(null);
      toast({ title: "Review deleted successfully", variant: "success" });
    } catch (deleteError) {
      setPending(null);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "The review could not be deleted.",
      );
    }
  }

  return (
    <>
      <p className="font-mono text-[9px] font-semibold tracking-[0.28em] text-palette-cyan-300 uppercase">
        Administration / Reviews
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Manage Reviews
          </h1>
          <p className="mt-1 text-sm text-palette-slate-400">
            Moderate {meta.total} reader reviews
          </p>
        </div>
      </div>
      <div className="mt-6 flex max-w-md items-center gap-2 rounded-lg border border-palette-indigo-300-20 bg-secondary px-3">
        <Search className="size-4 text-palette-slate-400" />
        <Input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Search reviews..."
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-palette-indigo-300-20 bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-secondary text-xs text-palette-slate-400">
            <tr>
              <th className="px-5 py-4">Reader</th>
              <th className="px-5 py-4">Book</th>
              <th className="px-5 py-4">Review</th>
              <th className="px-5 py-4">Rating</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-palette-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : reviews.length ? (
              reviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-t border-palette-indigo-300-20"
                >
                  <td className="px-5 py-4 font-bold">
                    {review.user?.fullName || "Unknown reader"}
                  </td>
                  <td className="px-5 py-4 text-palette-slate-400">
                    {review.book?.title || "Unknown book"}
                  </td>
                  <td className="max-w-sm truncate px-5 py-4 text-palette-slate-400">
                    {review.comment || "No written review"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Star className="size-4 fill-current" />
                      {review.rating}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      aria-label="Delete review"
                      onClick={() => setPending(review)}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-palette-slate-400"
                >
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {meta.totalPages > 1 && (
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <AlertDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete this review?</AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            The review will be permanently removed from the book page.
          </AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogCancel render={<Button variant="outline" />}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button variant="destructive" onClick={remove} />}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={Boolean(error)}
        onOpenChange={(open) => !open && setError(null)}
      >
        <DialogContent className="border-red-400/40 bg-card">
          <DialogTitle>Action unavailable</DialogTitle>
          <DialogDescription className="mt-2 text-palette-slate-400">
            {error}
          </DialogDescription>
          <div className="mt-6 flex justify-end">
            <DialogClose render={<Button />}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
