"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import { Input } from "@/components/ui/input";

export type AuthorOption = { id: string; name: string };

/** Autocomplete input that lets the user type an author's name */
export function AuthorInputField({
  authors,
  value,
  authorName,
  onChange,
  onNameChange,
  error,
  disabled,
}: {
  authors: AuthorOption[];
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
    (author: AuthorOption) => {
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
