import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

function accessToken(request: NextRequest) {
  return request.headers.get(ADMIN_ACCESS_HEADER);
}

export async function GET(request: NextRequest) {
  const token = accessToken(request);
  if (!token)
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );

  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 10));
  const title = request.nextUrl.searchParams.get("title")?.trim();
  const available = request.nextUrl.searchParams.get("available");
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy: "createdAt",
    order: "desc",
  });
  if (title) params.set("title", title);
  if (available === "true" || available === "false")
    params.set("available", available);

  try {
    const books = await apiRequest(`/books?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(books, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = accessToken(request);
  if (!token)
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  const multipart = request.headers.get("content-type")?.startsWith("multipart/form-data");
  const form = multipart ? await request.formData().catch(() => null) : null;
  const body = multipart
    ? form && Object.fromEntries(form.entries())
    : await request.json().catch(() => null);
  if (
    !body ||
    typeof body.id !== "string" ||
    typeof body.title !== "string" ||
    typeof body.authorId !== "string" ||
    typeof body.categoryId !== "string"
  ) {
    return NextResponse.json(
      { message: "Complete the required book fields." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const book = await apiRequest("/books", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form ?? JSON.stringify({
        id: body.id.trim(),
        title: body.title.trim(),
        authorId: body.authorId,
        categoryId: body.categoryId,
        pageCount: body.pageCount || null,
        totalCopies: body.totalCopies || 1,
        description: body.description?.trim() || null,
        coverUrl: body.coverUrl?.trim() || null,
      }),
    });
    return NextResponse.json(book, {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = accessToken(request);
  if (!token)
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id)
    return NextResponse.json(
      { message: "Book ID is required." },
      { status: 400, headers: responseHeaders },
    );

  try {
    const book = await apiRequest(`/books/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(book, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = accessToken(request);
  if (!token)
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id)
    return NextResponse.json(
      { message: "Book ID is required." },
      { status: 400, headers: responseHeaders },
    );

  const payload = {
    title: body.title,
    rating: body.rating,
    coverUrl: body.coverUrl || null,
    description: body.description || null,
    pageCount: body.pageCount || null,
    totalCopies: body.totalCopies,
  };
  try {
    const book = await apiRequest(`/books/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return NextResponse.json(book, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

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
