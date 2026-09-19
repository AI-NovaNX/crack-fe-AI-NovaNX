import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

type BookPage = {
  data?: Array<{ id?: string }>;
  meta?: { totalPages?: number };
};

type BookDetail = {
  id?: string;
  title?: string;
  reviews?: unknown[];
};

function failure(error: unknown) {
  const status = error instanceof ApiError ? error.status : 502;
  return NextResponse.json(
    {
      message: getHttpErrorMessage(
        status,
        error instanceof ApiError ? error.message : undefined,
      ),
    },
    { status, headers: responseHeaders },
  );
}

function token(request: NextRequest) {
  const value = request.headers.get(ADMIN_ACCESS_HEADER);
  return (
    value ||
    NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    )
  );
}

async function reviewsFromBookDetails(
  accessToken: string,
  page: number,
  limit: number,
  query?: string,
) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const firstPage = await apiRequest<BookPage>("/books?page=1&limit=100", {
    headers,
  });
  const totalPages = Math.max(1, firstPage.meta?.totalPages ?? 1);
  const bookPages = await Promise.all(
    Array.from({ length: totalPages }, (_, index) =>
      index === 0
        ? Promise.resolve(firstPage)
        : apiRequest<BookPage>(`/books?page=${index + 1}&limit=100`, {
            headers,
          }),
    ),
  );
  const bookIds = bookPages.flatMap((bookPage) =>
    (bookPage.data ?? []).flatMap((book) => (book.id ? [book.id] : [])),
  );
  const books = await Promise.all(
    bookIds.map((id) =>
      apiRequest<BookDetail>(`/books/${encodeURIComponent(id)}`, { headers }),
    ),
  );
  const normalizedQuery = query?.toLowerCase();
  const reviews = books.flatMap((book) =>
    (book.reviews ?? []).flatMap((review) => {
      if (!review || typeof review !== "object") return [];
      const entry = review as Record<string, unknown>;
      const user = entry.user;
      const reviewUser =
        user && typeof user === "object"
          ? (user as { fullName?: unknown })
          : null;
      const userName =
        typeof reviewUser?.fullName === "string" ? reviewUser.fullName : "";
      const comment = typeof entry.comment === "string" ? entry.comment : "";
      const searchable =
        `${book.title ?? ""} ${userName} ${comment}`.toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return [];
      return [{ ...entry, book: { id: book.id, title: book.title } }];
    }),
  );
  const total = reviews.length;
  const totalPagesForReviews = Math.max(1, Math.ceil(total / limit));
  return {
    data: reviews.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total, totalPages: totalPagesForReviews },
  };
}

export async function GET(request: NextRequest) {
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get("page")) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 10),
  );
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (query) params.set("q", query);
  try {
    const reviews = await apiRequest(`/reviews?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(reviews, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      try {
        const reviews = await reviewsFromBookDetails(
          accessToken,
          page,
          limit,
          query,
        );
        return NextResponse.json(reviews, { headers: responseHeaders });
      } catch (fallbackError) {
        return failure(fallbackError);
      }
    }
    return failure(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  const body = await request.json().catch(() => null);
  const id =
    typeof body?.id === "number" || typeof body?.id === "string"
      ? String(body.id)
      : "";
  if (!id)
    return NextResponse.json(
      { message: "Review ID is required." },
      { status: 400, headers: responseHeaders },
    );
  try {
    const review = await apiRequest(`/reviews/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(review, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}
