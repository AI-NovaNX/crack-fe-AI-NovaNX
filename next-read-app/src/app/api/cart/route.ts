import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiRequest, ApiError } from "@/lib/api";
import { mapBook, type ApiBook } from "@/services/books";
import { getHttpErrorMessage } from "@/lib/error-message";

export async function DELETE(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  const json = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Please sign in again to remove this item." }, 401);
  const body = await request.json().catch(() => null);
  if (!Number.isSafeInteger(body?.itemId) || body.itemId <= 0)
    return json({ message: "Invalid cart item ID." }, 400);
  try {
    await apiRequest(`/api/cart/items/${body.itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return json({ success: true }, 200);
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
  const headers = { "Cache-Control": "no-store" };
  const json = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Please sign in to add books to your cart." }, 401);
  const body = await request.json().catch(() => null);
  if (typeof body?.bookId !== "string" || !body.bookId.trim())
    return json({ message: "Invalid book ID." }, 400);
  try {
    await apiRequest("/api/cart/items", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bookId: body.bookId }),
    });
    return json({ success: true }, 201);
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

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return NextResponse.json(
      { message: "Please sign in to view your cart." },
      { status: 401, headers },
    );
  try {
    const items = await apiRequest<{ id: number; book: ApiBook }[]>(
      "/api/cart",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return NextResponse.json(
      items.map((item) => ({ id: item.id, book: mapBook(item.book) })),
      { headers },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "The cart could not be loaded.",
      },
      { status: error instanceof ApiError ? error.status : 502, headers },
    );
  }
}
