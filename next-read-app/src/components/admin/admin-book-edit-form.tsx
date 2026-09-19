"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthorInputField } from "@/components/admin/author-input-field";
import { useToast } from "@/components/providers/app-feedback-provider";
import type { BookDetail } from "@/services/books";

const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-palette-indigo-300-20 bg-secondary px-4 text-sm text-foreground outline-none focus:border-palette-cyan-300 focus:ring-2 focus:ring-cyan-300/20";

export function AdminBookEditForm({
  book,
  authors,
}: {
  book: BookDetail;
  authors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(book.title);
  const [authorId, setAuthorId] = useState(book.authorId);
  const [authorName, setAuthorName] = useState(book.author);
  const [authorError, setAuthorError] = useState("");
  const [rating, setRating] = useState(String(book.rating));
  const [pageCount, setPageCount] = useState(String(book.pageCount ?? ""));
  const [totalCopies, setTotalCopies] = useState(String(book.totalCopies));
  const [coverUrl, setCoverUrl] = useState(book.coverUrl ?? "");
  const [description, setDescription] = useState(book.description ?? "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!authorId) {
      setAuthorError("Please select an author from the list.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/admin/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: book.id,
          title: title.trim(),
          authorId,
          rating: Number(rating),
          pageCount: pageCount ? Number(pageCount) : null,
          totalCopies: Number(totalCopies),
          coverUrl: coverUrl.trim() || null,
          description: description.trim() || null,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "The book could not be updated.");
      toast({
        title: "Book updated successfully",
        description: title,
        variant: "success",
      });
      router.push(`/admin/books/${encodeURIComponent(book.id)}`);
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "The book could not be updated.";
      setError(message);
      toast({
        title: "Failed to update book",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-palette-indigo-300-20 bg-card p-5 shadow-2xl sm:p-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-bold text-palette-slate-400 sm:col-span-2">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="text-xs font-bold text-palette-slate-400 sm:col-span-2">
          Author
          <AuthorInputField
            authors={authors}
            value={authorId}
            authorName={authorName}
            onChange={(id) => {
              setAuthorId(id);
              if (authorError) setAuthorError("");
            }}
            onNameChange={(name) => {
              setAuthorName(name);
              if (authorError) setAuthorError("");
            }}
            error={authorError}
          />
        </div>
        <label className="text-xs font-bold text-palette-slate-400">
          Rating
          <input
            required
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-bold text-palette-slate-400">
          Page Count
          <input
            type="number"
            min="1"
            value={pageCount}
            onChange={(event) => setPageCount(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-bold text-palette-slate-400">
          Total Copies
          <input
            required
            type="number"
            min="1"
            value={totalCopies}
            onChange={(event) => setTotalCopies(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-bold text-palette-slate-400">
          Cover URL
          <input
            value={coverUrl}
            onChange={(event) => setCoverUrl(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="text-xs font-bold text-palette-slate-400 sm:col-span-2">
          Description
          <textarea
            value={description}
            maxLength={5000}
            onChange={(event) => setDescription(event.target.value)}
            className={`${fieldClass} min-h-40 resize-y py-3`}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="mt-7 flex justify-end gap-3">
        <Link
          href={`/admin/books/${encodeURIComponent(book.id)}`}
          className="rounded-full border border-border bg-secondary px-6 py-3 text-sm font-bold"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
