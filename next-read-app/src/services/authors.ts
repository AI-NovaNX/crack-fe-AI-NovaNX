import avatar0 from "@/assets/images/authors/dan-brown.svg";
import avatar1 from "@/assets/images/authors/charles-dickens.svg";
import avatar2 from "@/assets/images/authors/dee-lestari.svg";
import avatar3 from "@/assets/images/authors/tere-liye.svg";
import avatar4 from "@/assets/images/authors/jk-rowling.svg";
import avatar5 from "@/assets/images/authors/jack-london.svg";
import avatar6 from "@/assets/images/authors/michael-connelly.svg";
import avatar7 from "@/assets/images/authors/andrea-hirata.svg";
import fallbackAvatar from "@/assets/images/user-avatar.svg";
import { apiRequest, ApiError } from "@/lib/api";
import { fetchBookPage } from "@/services/books";
import type { Author } from "@/types/author";
const avatars: Record<string, Author["avatar"]> = {
  "/assets/images/authors/dan-brown.svg": avatar0,
  "/assets/images/authors/charles-dickens.svg": avatar1,
  "/assets/images/authors/dee-lestari.svg": avatar2,
  "/assets/images/authors/tere-liye.svg": avatar3,
  "/assets/images/authors/jk-rowling.svg": avatar4,
  "/assets/images/authors/jack-london.svg": avatar5,
  "/assets/images/authors/michael-connelly.svg": avatar6,
  "/assets/images/authors/andrea-hirata.svg": avatar7,
};
type ApiAuthor = Omit<Author, "avatar"> & { avatarPath?: string | null };
export type GetAuthorsParams = { q?: string; page?: number; limit?: number };
export type PaginatedAuthorsResponse = {
  data: Author[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
const mapAuthor = (author: ApiAuthor): Author => ({
  ...author,
  avatar: avatars[author.avatarPath ?? ""] ?? fallbackAvatar,
});
async function fetchAuthors(path: string): Promise<PaginatedAuthorsResponse> {
  const response = await apiRequest<
    Omit<PaginatedAuthorsResponse, "data"> & { data: ApiAuthor[] }
  >(path, {}, { cacheCatalog: true });
  return { ...response, data: response.data.map(mapAuthor) };
}
export function getAuthors({ q, page = 1, limit = 10 }: GetAuthorsParams = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) query.set("q", q);
  return fetchAuthors(`/authors?${query}`);
}
export function getPopularAuthors(page = 1, limit = 10) {
  return fetchAuthors(`/authors/popular?page=${page}&limit=${limit}`);
}
export async function getAuthorById(id: string): Promise<Author | null> {
  try {
    return mapAuthor(
      await apiRequest<ApiAuthor>(
        `/authors/${encodeURIComponent(id)}`,
        {},
        { cacheCatalog: true },
      ),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
export function getAuthorBooks(id: string, page = 1, limit = 10) {
  return fetchBookPage(
    `/authors/${encodeURIComponent(id)}/books?page=${page}&limit=${limit}`,
  );
}
