import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

function accessToken(request: NextRequest) {
  return request.headers.get(ADMIN_ACCESS_HEADER);
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

function authorized(request: NextRequest) {
  const token = accessToken(request);
  if (!token) {
    return NextResponse.json(
      { message: "Please sign in." },
      { status: 401, headers: responseHeaders },
    );
  }
  return token;
}

function invalidOrigin(request: NextRequest) {
  return request.headers.get("origin") !== request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const token = authorized(request);
  if (token instanceof NextResponse) return token;

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
    const authors = await apiRequest(`/authors?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(authors, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest) {
  if (invalidOrigin(request))
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = authorized(request);
  if (token instanceof NextResponse) return token;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name)
    return NextResponse.json(
      { message: "Author name is required." },
      { status: 400, headers: responseHeaders },
    );

  try {
    const author = await apiRequest("/authors", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    return NextResponse.json(author, { status: 201, headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (invalidOrigin(request))
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = authorized(request);
  if (token instanceof NextResponse) return token;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!id || !name)
    return NextResponse.json(
      { message: "Author ID and name are required." },
      { status: 400, headers: responseHeaders },
    );

  try {
    const author = await apiRequest(`/authors/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    return NextResponse.json(author, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (invalidOrigin(request))
    return NextResponse.json(
      { message: "Invalid origin" },
      { status: 403, headers: responseHeaders },
    );
  const token = authorized(request);
  if (token instanceof NextResponse) return token;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id)
    return NextResponse.json(
      { message: "Author ID is required." },
      { status: 400, headers: responseHeaders },
    );

  try {
    const author = await apiRequest(`/authors/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(author, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}
