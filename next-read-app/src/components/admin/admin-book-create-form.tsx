"use client";

import { ImageIcon, Link2, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/app-feedback-provider";

type Option = { id: string; name: string };

const fieldClass =
  "mt-2 h-12 w-full rounded-xl border border-palette-indigo-300-20 bg-secondary px-4 text-sm text-foreground outline-none transition focus:border-palette-cyan-300 focus:ring-2 focus:ring-cyan-300/20";

function createBookId(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminBookCreateForm({
  authors,
  categories,
}: {
  authors: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [pageCount, setPageCount] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function selectCover(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Cover harus berupa JPG, PNG, atau WEBP, maksimal 5 MB.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCoverUrl("");
    setCoverFailed(false);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = createBookId(title);
    if (!id || !authorId || !categoryId) {
      setError("Title, author, and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.set("id", id);
      form.set("title", title.trim());
      form.set("authorId", authorId);
      form.set("categoryId", categoryId);
      form.set("totalCopies", totalCopies);
      if (pageCount) form.set("pageCount", pageCount);
      if (description.trim()) form.set("description", description.trim());
      if (coverFile) form.set("cover", coverFile);
      else if (coverUrl.trim()) form.set("coverUrl", coverUrl.trim());
      const response = await fetch("/api/admin/books", {
        method: "POST",
        body: form,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(body?.message || "Book belum dapat ditambahkan.");
      toast({
        title: "Book berhasil ditambahkan",
        description: title,
        variant: "success",
      });
      router.push(`/admin/books/${encodeURIComponent(id)}`);
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Book belum dapat ditambahkan.";
      setError(message);
      toast({
        title: "Gagal menambahkan book",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-xs font-bold">
        Title
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="The Psychology of Money"
          className={fieldClass}
        />
      </label>

      <label className="block text-xs font-bold">
        Author
        <select
          required
          value={authorId}
          onChange={(event) => setAuthorId(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>Select an author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>{author.name}</option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-bold">
        Category
        <select
          required
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xs font-bold">
          Number of Pages
          <input type="number" min="1" value={pageCount} onChange={(event) => setPageCount(event.target.value)} placeholder="320" className={fieldClass} />
        </label>
        <label className="block text-xs font-bold">
          Number of Copies
          <input required type="number" min="1" value={totalCopies} onChange={(event) => setTotalCopies(event.target.value)} className={fieldClass} />
        </label>
      </div>

      <label className="block text-xs font-bold">
        Description
        <textarea required maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Write a short description of the book" className={`${fieldClass} min-h-40 resize-y py-4 leading-6`} />
      </label>

      <div>
        <label htmlFor="cover-url" className="text-xs font-bold">Cover Image</label>
        <div className="mt-2 rounded-2xl border border-dashed border-palette-indigo-300-20 bg-secondary p-5 text-center">
          {(coverFile ? previewUrl : coverUrl) && !coverFailed ? (
            <div className="mx-auto w-32 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverFile ? previewUrl : coverUrl} alt="Book cover preview" onError={() => setCoverFailed(true)} className="aspect-[2/3] h-auto w-full object-cover" />
            </div>
          ) : (
            <div className="mx-auto flex aspect-[2/3] w-32 flex-col items-center justify-center rounded-lg border border-border bg-card text-palette-slate-400">
              <ImageIcon className="size-8" aria-hidden="true" />
              <span className="mt-2 text-[10px]">Cover preview</span>
            </div>
          )}
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload book cover" className="sr-only" disabled={saving} onChange={(event) => selectCover(event.target.files?.[0])} />
          <button type="button" disabled={saving} onClick={() => fileInput.current?.click()} className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-bold text-palette-cyan-300 disabled:opacity-50">
            <Upload className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{coverFile?.name ?? "Browse image"}</span>
          </button>
          <div className="relative mx-auto mt-4 max-w-xl">
            <Link2 aria-hidden="true" className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-palette-slate-400" />
            <input id="cover-url" type="url" value={coverUrl} disabled={saving} onChange={(event) => { setCoverUrl(event.target.value); setCoverFile(null); if (fileInput.current) fileInput.current.value = ""; setCoverFailed(false); }} placeholder="Or paste an image URL" className={`${fieldClass} mt-0 pl-11`} />
          </div>
          {(coverUrl || coverFile) && (
            <button type="button" disabled={saving} onClick={() => { setCoverUrl(""); setCoverFile(null); if (fileInput.current) fileInput.current.value = ""; setCoverFailed(false); }} className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-[10px] font-bold text-red-400 hover:bg-red-400/10">
              <Trash2 className="size-3.5" aria-hidden="true" /> Remove image
            </button>
          )}
          <p className="mt-3 text-[10px] text-palette-slate-400">JPG, PNG, or WEBP. Maximum 5 MB. The cover is uploaded when you save.</p>
        </div>
      </div>

      {error && <p role="alert" className="text-sm font-semibold text-red-400">{error}</p>}
      <button type="submit" disabled={saving || authors.length === 0 || categories.length === 0} className="h-12 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(34,211,238,0.2)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
