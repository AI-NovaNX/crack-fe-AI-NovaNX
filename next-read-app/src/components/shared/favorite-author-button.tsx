"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/providers/app-feedback-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import type { Author } from "@/types/author";

export function FavoriteAuthorButton({
  author,
  showLabel = false,
}: {
  author: Author;
  showLabel?: boolean;
}) {
  const { authors, status, toggleAuthor } = useFavorites();
  const router = useRouter();
  const toast = useToast();
  const saved = authors.some((item) => item.id === author.id);
  const label = saved ? "Hapus dari favorit" : "Tambahkan ke favorit";

  return (
    <button
      type="button"
      aria-label={`${label}: ${author.name}`}
      aria-pressed={saved}
      title={label}
      disabled={status === "loading"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (status === "guest") {
          router.push("/login");
          return;
        }

        try {
          toggleAuthor(author);
          toast({
            title: saved
              ? "Penulis dihapus dari favorit"
              : "Penulis ditambahkan ke favorit",
            description: author.name,
            variant: "success",
          });
        } catch (error) {
          toast({
            title: "Favorit penulis belum dapat diperbarui",
            description:
              error instanceof Error
                ? error.message
                : "Penyimpanan browser tidak tersedia.",
            variant: "error",
          });
        }
      }}
      className={`relative z-20 inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-palette-indigo-300-20 bg-card text-palette-slate-50 transition-colors hover:border-pink-400 hover:text-pink-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skyblue disabled:opacity-40 ${showLabel ? "px-5 py-2.5 text-sm font-bold" : "size-9"}`}
    >
      <Heart
        className={`size-4 ${saved ? "fill-pink-400 text-pink-400" : ""}`}
        aria-hidden="true"
      />
      {showLabel && (saved ? "Favorited" : "Favorite")}
    </button>
  );
}
