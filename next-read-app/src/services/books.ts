import { getBookCoverClassName, getBookCoverUrl } from "@/lib/book-covers";
import { apiRequest, ApiError } from "@/lib/api";
import type { Book } from "@/types/book";
import { getCategories } from "@/services/categories";

export type GetBooksParams = {
  category?: string;
  rating?: number;
  search?: string;
  page?: number;
  limit?: number;
};
export type PaginatedBooksResponse = {
  data: Book[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
export type ApiBook = Omit<Book, "author" | "category" | "coverUrl"> & {
  author: { id: string; name: string };
  category: { name: string };
  coverUrl?: string | null;
  coverImage?: string | null;
  imageUrl?: string | null;
};
export type ApiBooksResponse = Omit<PaginatedBooksResponse, "data"> & {
  data: ApiBook[];
};
export const mapBook = (book: ApiBook): Book => ({
  id: book.id,
  title: book.title,
  author: book.author.name,
  category: book.category.name,
  rating: Number(book.rating),
  coverUrl: getBookCoverUrl(
    book.coverUrl || book.coverImage || book.imageUrl || undefined,
  ),
  coverClassName: getBookCoverClassName(book.coverClassName),
  availableCopies: book.availableCopies,
  isAvailable: book.isAvailable,
});
export async function fetchBookPage(
  path: string,
): Promise<PaginatedBooksResponse> {
  // Availability changes whenever a loan is checked out or returned. Do not
  // cache book responses, otherwise the UI can keep showing an obsolete stock
  // count after the database has already changed.
  const response = await apiRequest<ApiBooksResponse>(path);
  return { ...response, data: response.data.map(mapBook) };
}

export async function getBooks(
  params: GetBooksParams = {},
): Promise<PaginatedBooksResponse> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const query = new URLSearchParams();
  if (params.category) {
    const category = (await getCategories()).find(
      (c) => c.name === params.category || c.id === params.category,
    );
    if (!category)
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    query.set("categoryId", category.id);
  }
  // The UI searches title, author and category and groups ratings by integer.
  // The backend only supports title search and minimum rating, so preserve
  // these UI semantics across all API pages before paginating the result.
  if (params.search || params.rating) {
    query.set("limit", "100");
    if (params.rating && Number.isFinite(params.rating))
      query.set("minRating", String(params.rating));
    const books: Book[] = [];
    let current = 1,
      totalPages = 1;
    do {
      query.set("page", String(current));
      const response = await fetchBookPage(`/books?${query}`);
      books.push(...response.data);
      totalPages = response.meta.totalPages;
      current++;
    } while (current <= totalPages);
    const search = params.search?.trim().toLowerCase();
    const filtered = books.filter(
      (book) =>
        (!params.rating || Math.floor(book.rating) === params.rating) &&
        (!search ||
          [book.title, book.author, book.category].some((value) =>
            value.toLowerCase().includes(search),
          )),
    );
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }
  query.set("page", String(page));
  query.set("limit", String(limit));
  return fetchBookPage(`/books?${query}`);
}
export function getRecommendedBooks(page = 1, limit = 5) {
  return fetchBookPage(`/books/recommend?page=${page}&limit=${limit}`);
}
export async function getBookById(id: string): Promise<Book | null> {
  try {
    return mapBook(
      await apiRequest<ApiBook>(`/books/${encodeURIComponent(id)}`),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type BookReview = {
  id: number;
  rating: number;
  comment?: string | null;
  user: { fullName: string };
  createdAt: string;
};
export type BookDetail = Book & {
  authorId: string;
  reviewCount: number;
  reviews: BookReview[];
  availableCopies: number;
  totalCopies: number;
  description?: string;
  pageCount?: number;
};
export async function getBookDetail(id: string): Promise<BookDetail | null> {
  try {
    const book = await apiRequest<ApiBook & BookDetail>(
      `/books/${encodeURIComponent(id)}`,
    );
    return {
      ...mapBook(book),
      authorId: book.author.id,
      reviewCount: book.reviewCount,
      reviews: book.reviews ?? [],
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies,
      description: book.description,
      pageCount: book.pageCount,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
