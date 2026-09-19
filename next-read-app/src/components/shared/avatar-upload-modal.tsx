"use client";

import { ImageUp, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAvatarSrc, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

type AvatarUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string | null;
  userName?: string | null;
  onUploaded: (avatar: string | null) => void;
};

export function AvatarUploadModal({
  open,
  onOpenChange,
  currentAvatar,
  userName,
  onUploaded,
}: AvatarUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const currentSrc = getAvatarSrc(preview ?? currentAvatar);
  const initials = getInitials(userName);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function resetSelection() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setFile(null);
    setPreview(null);
    setError("");
    setSaving(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) resetSelection();
    onOpenChange(nextOpen);
  }

  function chooseFile(nextFile?: File) {
    setError("");
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Use a JPG, PNG, WEBP, or GIF file.");
      return;
    }
    if (nextFile.size > MAX_SIZE) {
      setError("The image must be at most 5 MB.");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(nextFile);
    previewRef.current = objectUrl;
    setFile(nextFile);
    setPreview(objectUrl);
  }

  async function uploadAvatar() {
    if (!file || saving) {
      setError("Please select an image first.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const response = await fetch("/api/auth/avatar", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message || "The avatar could not be uploaded.");
      onUploaded(body.user?.avatar ?? body.avatar ?? null);
      changeOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        backdropClassName="bg-slate-950/75"
        className="max-w-md rounded-[28px] border-palette-indigo-300-20 bg-[linear-gradient(180deg,rgba(10,18,42,0.98),rgba(9,15,34,0.98))] p-5 text-left text-palette-slate-50 shadow-[0_28px_70px_rgba(0,0,0,0.48)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-cyan-300">
              Profile image
            </p>
            <DialogTitle className="mt-2 text-xl font-extrabold text-white">
              Update Avatar
            </DialogTitle>
          </div>
          <DialogClose
            aria-label="Close avatar upload"
            className="flex size-9 items-center justify-center rounded-full bg-white/8 text-palette-slate-400 transition hover:bg-white/14 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogClose>
        </div>

        <div className="mt-5 rounded-xl border border-palette-indigo-300-20 bg-white/5 p-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(77,222,255,0.22)]">
              {currentSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>
            <DialogDescription className="text-xs leading-5 text-palette-slate-400">
              Choose an image from your computer to personalize your NexRead
              profile.
            </DialogDescription>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-4 text-sm font-extrabold text-cyan-300 transition hover:border-cyan-300/60 hover:bg-cyan-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
          <ImageUp className="size-4" aria-hidden="true" />
          {file ? file.name : "Browse image"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-4 text-palette-slate-400">
          Supported formats: JPG, JPEG, PNG, WEBP, and GIF. Maximum size: 5 MB.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-3 text-center text-xs font-semibold text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <DialogClose
            disabled={saving}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 rounded-full border-palette-indigo-300-20 bg-white/6 text-sm font-extrabold text-white hover:bg-white/10",
            )}
          >
            Cancel
          </DialogClose>
          <button
            type="button"
            disabled={saving || !file}
            onClick={() => void uploadAvatar()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-600 px-5 text-sm font-extrabold text-white shadow-[0_10px_26px_rgba(77,222,255,0.24)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Use this avatar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
