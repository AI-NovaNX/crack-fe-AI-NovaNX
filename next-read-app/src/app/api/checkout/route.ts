import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";
import { mapBook, type ApiBook } from "@/services/books";
import type { SessionUser } from "@/lib/auth";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
function failure(error: unknown) {
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
export async function GET(request: NextRequest) {
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Please sign in to continue checkout." }, 401);
  try {
    const bookId = request.nextUrl.searchParams.get("bookId")?.trim();
    if (bookId) {
      const [user, book] = await Promise.all([
        apiRequest<SessionUser>("/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<ApiBook>(`/books/${encodeURIComponent(bookId)}`),
      ]);
      return json({ user, items: [{ id: book.id, book: mapBook(book) }] });
    }
    const data = await apiRequest<{
      user: SessionUser;
      items: { id: number; book: ApiBook }[];
    }>("/api/cart/checkout", { headers: { Authorization: `Bearer ${token}` } });
    const requestedItems = request.nextUrl.searchParams.get("items");
    const selectedIds = new Set(
      (requestedItems ?? "")
        .split(",")
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    );
    const items =
      requestedItems === null
        ? data.items
        : data.items.filter((item) => selectedIds.has(item.id));
    return json({
      user: data.user,
      items: items.map((item) => ({
        id: item.id,
        book: mapBook(item.book),
      })),
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Please sign in again to borrow this book." }, 401);
  const body = await request.json().catch(() => null);
  const itemIds = body?.itemIds;
  const bookId = typeof body?.bookId === "string" ? body.bookId.trim() : "";
  if (
    ![3, 5, 10].includes(body?.durationDays) ||
    body?.returnAgreement !== true ||
    body?.policyAgreement !== true ||
    (itemIds !== undefined &&
      (!Array.isArray(itemIds) ||
        !itemIds.length ||
        itemIds.some(
          (itemId: unknown) =>
            typeof itemId !== "number" ||
            !Number.isSafeInteger(itemId) ||
            itemId <= 0,
        )))
  )
    return json(
      { message: "Please choose a duration and agree to the loan terms." },
      400,
    );
  try {
    if (bookId) {
      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + body.durationDays);
      await apiRequest("/loans", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId, dueAt: dueAt.toISOString() }),
      });
      return json({ success: true }, 201);
    }
    await apiRequest("/loans/from-cart", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        durationDays: body.durationDays,
        ...(itemIds ? { itemIds } : {}),
      }),
    });
    return json({ success: true }, 201);
  } catch (error) {
    return failure(error);
  }
}
