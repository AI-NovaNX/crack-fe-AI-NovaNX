"use client";

import {
  CloudUpload,
  Link2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
  type DragEvent,
} from "react";

import { useToast } from "@/components/providers/app-feedback-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; name: string };

type FormErrors = {
  title?: string;
  author?: string;
  category?: string;
  pageCount?: string;
  description?: string;
  cover?: string;
};

function createBookId(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Autocomplete input yang memungkinkan user mengetik nama author */
function AuthorInputField({
  authors,
  value,
  authorName,
  onChange,
  onNameChange,
  error,
  disabled,
}: {
  authors: Option[];
  value: string;
  authorName: string;
  onChange: (id: string) => void;
  onNameChange: (name: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = authorName.trim()
    ? authors.filter((a) =>
        a.name.toLowerCase().includes(authorName.trim().toLowerCase()),
      )
    : authors.slice(0, 8);

  const select = useCallback(
    (author: Option) => {
      onNameChange(author.name);
      onChange(author.id);
      setOpen(false);
    },
    [onChange, onNameChange],
  );

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        const matched = authors.find(
          (a) => a.name.toLowerCase() === authorName.trim().toLowerCase(),
        );
        if (matched) {
          onChange(matched.id);
          onNameChange(matched.name);
        } else if (!value && authors.length > 0) {
          const partialMatch = authors.find((a) =>
            a.name.toLowerCase().includes(authorName.trim().toLowerCase()),
          );
          if (partialMatch && authorName.trim()) {
            onChange(partialMatch.id);
          }
        }
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [authors, authorName, value, onChange, onNameChange]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[highlighted]) select(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative mt-2">
      <Input
        id="book-author"
        type="text"
        autoComplete="off"
        placeholder="Type author name..."
        disabled={disabled}
        value={authorName}
        onChange={(e) => {
          const val = e.target.value;
          onNameChange(val);
          setHighlighted(0);
          setOpen(true);
          const directMatch = authors.find(
            (a) => a.name.toLowerCase() === val.trim().toLowerCase(),
          );
          onChange(directMatch ? directMatch.id : "");
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-invalid={Boolean(error)}
        className="h-12 rounded-xl border-palette-indigo-300-20 bg-secondary px-4 aria-invalid:border-destructive"
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-foreground/10"
        >
          {suggestions.map((author, idx) => (
            <li
              key={author.id}
              role="option"
              aria-selected={author.id === value}
              onMouseDown={(e) => {
                e.preventDefault();
                select(author);
              }}
              onMouseEnter={() => setHighlighted(idx)}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none transition-colors ${
                idx === highlighted
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-popover text-popover-foreground hover:bg-muted"
              } ${author.id === value ? "text-palette-cyan-300 font-bold" : ""}`}
            >
              {author.name}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
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
  const [authorId, setAuthorId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [totalCopies] = useState("1");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Book title is required.";
    }

    if (!authorName.trim() && !authorId) {
      newErrors.author = "Please select an author from the list.";
    }

    if (!categoryId) {
      newErrors.category = "Please select a book category.";
    }

    if (!pageCount || Number(pageCount) < 1) {
      newErrors.pageCount = "The book must have at least one page.";
    }

    if (!description.trim()) {
      newErrors.description = "Book description is required.";
    }

    if (!coverFile && !coverUrl.trim()) {
      newErrors.cover = "Please upload a cover image or provide an image URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleFileSelection(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setErrors((prev) => ({
        ...prev,
        cover: "The cover must be a JPG, PNG, or WEBP file up to 5 MB.",
      }));
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCoverUrl("");
    setCoverFailed(false);
    setErrors((prev) => ({ ...prev, cover: undefined }));
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError("");

    const isValid = validate();
    if (!isValid) return;

    let resolvedAuthorId = authorId;
    if (!resolvedAuthorId && authorName.trim()) {
      const match = authors.find(
        (a) => a.name.toLowerCase() === authorName.trim().toLowerCase(),
      );
      if (match) {
        resolvedAuthorId = match.id;
      } else if (authors.length > 0) {
        resolvedAuthorId = authors[0].id;
      }
    }

    if (!resolvedAuthorId) {
      setErrors((prev) => ({
        ...prev,
        author: "Please select an author from the list.",
      }));
      return;
    }

    const id = createBookId(title);
    if (!id) {
      setErrors((prev) => ({ ...prev, title: "Book title is required." }));
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();
      form.set("id", id);
      form.set("title", title.trim());
      form.set("authorId", resolvedAuthorId);
      form.set("categoryId", categoryId);
      form.set("totalCopies", totalCopies || "1");
      if (pageCount) form.set("pageCount", pageCount);
      if (description.trim()) form.set("description", description.trim());
      if (coverFile) form.set("cover", coverFile);
      else if (coverUrl.trim()) form.set("coverUrl", coverUrl.trim());

      const response = await fetch("/api/admin/books", {
        method: "POST",
        body: form,
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.message || "The book could not be added.");
      }

      toast({
        title: "Add Book Success",
        description: title,
        variant: "add-success",
      });

      router.push("/admin/books");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "The book could not be added.";
      setGlobalError(message);
      toast({
        title: "Failed to add book",
        description: message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-2 h-12 rounded-xl border-palette-indigo-300-20 bg-secondary px-4";

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {/* Title Field */}
      <div>
        <Label htmlFor="book-title" className="text-xs font-bold text-palette-slate-50">
          Title
        </Label>
        <Input
          id="book-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          placeholder="The Psychology of Money"
          aria-invalid={Boolean(errors.title)}
          className={fieldClass}
        />
        {errors.title && (
          <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
            {errors.title}
          </p>
        )}
      </div>

      {/* Author Field */}
      <div>
        <Label htmlFor="book-author" className="text-xs font-bold text-palette-slate-50">
          Author
        </Label>
        <AuthorInputField
          authors={authors}
          value={authorId}
          authorName={authorName}
          onChange={(id) => {
            setAuthorId(id);
            if (errors.author) {
              setErrors((prev) => ({ ...prev, author: undefined }));
            }
          }}
          onNameChange={(name) => {
            setAuthorName(name);
            if (errors.author) {
              setErrors((prev) => ({ ...prev, author: undefined }));
            }
          }}
          error={errors.author}
          disabled={saving}
        />
      </div>

      {/* Category Field */}
      <div>
        <Label htmlFor="book-category" className="text-xs font-bold text-palette-slate-50">
          Category
        </Label>
        <div className="mt-2">
          <Select
            id="book-category"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: undefined }));
              }
            }}
            aria-invalid={Boolean(errors.category)}
            className={`h-12 rounded-xl border-palette-indigo-300-20 bg-secondary px-4 pr-10 ${
              !categoryId ? "text-palette-slate-400" : "text-foreground"
            }`}
          >
            <option value="" disabled className="text-palette-slate-400">
              Select Category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id} className="bg-card text-foreground">
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        {errors.category && (
          <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
            {errors.category}
          </p>
        )}
      </div>

      {/* Number of Pages Field */}
      <div>
        <Label htmlFor="book-page-count" className="text-xs font-bold text-palette-slate-50">
          Number of Pages
        </Label>
        <Input
          id="book-page-count"
          type="number"
          min="1"
          value={pageCount}
          onChange={(event) => {
            setPageCount(event.target.value);
            if (errors.pageCount) {
              setErrors((prev) => ({ ...prev, pageCount: undefined }));
            }
          }}
          placeholder="320"
          aria-invalid={Boolean(errors.pageCount)}
          className={fieldClass}
        />
        {errors.pageCount && (
          <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
            {errors.pageCount}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <Label htmlFor="book-description" className="text-xs font-bold text-palette-slate-50">
          Description
        </Label>
        <Textarea
          id="book-description"
          maxLength={5000}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: undefined }));
            }
          }}
          placeholder="Write a short description of the book"
          aria-invalid={Boolean(errors.description)}
          className="mt-2 min-h-36 resize-y rounded-xl border-palette-indigo-300-20 bg-secondary p-4 leading-6"
        />
        {errors.description && (
          <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
            {errors.description}
          </p>
        )}
      </div>

      {/* Cover Image Field */}
      <div>
        <Label className="text-xs font-bold text-palette-slate-50">
          Cover Image
        </Label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-2 rounded-2xl border border-dashed p-6 text-center transition-all ${
            errors.cover
              ? "border-red-500 bg-red-500/5"
              : isDragging
                ? "border-palette-cyan-300 bg-palette-cyan-300/10"
                : "border-palette-indigo-300-20 bg-secondary"
          }`}
        >
          {(coverFile ? previewUrl : coverUrl) && !coverFailed ? (
            <div className="flex flex-col items-center">
              <div className="mx-auto w-28 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverFile ? previewUrl : coverUrl}
                  alt="Book cover preview"
                  onError={() => setCoverFailed(true)}
                  className="aspect-[2/3] h-auto w-full object-cover"
                />
              </div>
              <p className="mt-2 truncate text-xs font-medium text-palette-slate-300 max-w-xs">
                {coverFile ? coverFile.name : coverUrl}
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setCoverUrl("");
                  setCoverFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                  setCoverFailed(false);
                }}
                className="mt-3 rounded-full px-3.5 font-bold"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex size-12 items-center justify-center rounded-xl border border-palette-indigo-300-20 bg-card shadow-sm">
                <CloudUpload className="size-6 text-palette-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm text-palette-slate-300">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => fileInput.current?.click()}
                  className="h-auto p-0 font-bold text-palette-cyan-300"
                >
                  Click to upload
                </Button>{" "}
                or drag and drop
              </p>
              <p className="mt-1 text-xs text-palette-slate-400">
                PNG or JPG (max. 5mb)
              </p>
            </div>
          )}

          <Input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload book cover"
            className="sr-only"
            disabled={saving}
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />

          {!coverFile && !coverUrl && (
            <div className="mt-3 border-t border-palette-indigo-300-20/40 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-semibold text-palette-slate-400 hover:text-palette-cyan-300"
              >
                <Link2 className="size-3.5" aria-hidden="true" />
                {showUrlInput ? "Hide image URL input" : "Or use image URL"}
              </Button>

              {showUrlInput && (
                <div className="relative mx-auto mt-2 max-w-xl">
                  <Input
                    id="cover-url"
                    type="url"
                    value={coverUrl}
                    disabled={saving}
                    onChange={(event) => {
                      setCoverUrl(event.target.value);
                      setCoverFile(null);
                      if (fileInput.current) fileInput.current.value = "";
                      setCoverFailed(false);
                      if (errors.cover) {
                        setErrors((prev) => ({ ...prev, cover: undefined }));
                      }
                    }}
                    placeholder="Paste an image URL (e.g. https://...)"
                    className="h-10 rounded-xl border-palette-indigo-300-20 bg-card px-4 text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {errors.cover && (
          <p role="alert" className="mt-1.5 text-xs font-semibold text-red-500">
            {errors.cover}
          </p>
        )}
      </div>

      {globalError && (
        <p role="alert" className="text-sm font-semibold text-red-400">
          {globalError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={saving}
        className="h-12 w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(34,211,238,0.2)] hover:opacity-90"
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
