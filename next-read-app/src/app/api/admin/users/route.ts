import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get(ADMIN_ACCESS_HEADER);
  if (!accessToken) {
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  }

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
    const users = await apiRequest(`/users?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(users, { headers: responseHeaders });
  } catch (error) {
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
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const accessToken = request.headers.get(ADMIN_ACCESS_HEADER);
  if (!accessToken) {
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  }
  const body = await request.json().catch(() => null);
  const id =
    body?.id !== undefined && body?.id !== null ? String(body.id).trim() : "";
  if (!id)
    return NextResponse.json(
      { message: "User ID is required." },
      { status: 400, headers: responseHeaders },
    );

  try {
    await apiRequest(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return new NextResponse(null, { status: 204, headers: responseHeaders });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message =
      status === 409
        ? "All books borrowed by this member must be returned and approved before the account can be deactivated."
        : getHttpErrorMessage(
            status,
            error instanceof ApiError ? error.message : undefined,
          );
    return NextResponse.json({ message }, { status, headers: responseHeaders });
  }
}
