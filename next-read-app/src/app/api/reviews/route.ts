import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const headers = { "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers });

export async function GET(request: NextRequest) {
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Silakan login untuk melihat review." }, 401);

  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 10),
  );

  try {
    const reviews = await apiRequest(
      `/me/reviews?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return json(reviews);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    return json(
      {
        message: getHttpErrorMessage(
          status,
          error instanceof ApiError ? error.message : undefined,
        ),
      },
      status,
    );
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);

  const token = (await cookies()).get("nexread_access")?.value;
  if (!token) return json({ message: "Silakan login untuk memberi review." }, 401);

  const body = await request.json().catch(() => null);
  const rating = body?.rating;
  const comment = typeof body?.comment === "string" ? body.comment.trim() : "";

  if (typeof body?.bookId !== "string" || !body.bookId.trim())
    return json({ message: "ID buku tidak valid." }, 400);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return json({ message: "Pilih rating antara 1 sampai 5 bintang." }, 400);
  if (comment.length > 1000)
    return json({ message: "Review maksimal 1000 karakter." }, 400);

  try {
    const review = await apiRequest(
      `/books/${encodeURIComponent(body.bookId)}/reviews`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, ...(comment ? { comment } : {}) }),
      },
    );
    return json(review, 201);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    return json(
      {
        message: getHttpErrorMessage(
          status,
          error instanceof ApiError ? error.message : undefined,
        ),
      },
      status,
    );
  }
}
