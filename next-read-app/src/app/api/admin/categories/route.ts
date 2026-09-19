import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

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

function invalidOrigin(request: NextRequest) {
  return request.headers.get("origin") !== request.nextUrl.origin;
}

function categoryPayload(body: unknown) {
  const value = body as {
    name?: unknown;
    slug?: unknown;
    subtitle?: unknown;
  } | null;
  const name = typeof value?.name === "string" ? value.name.trim() : "";
  const slug = typeof value?.slug === "string" ? value.slug.trim() : "";
  const subtitle =
    typeof value?.subtitle === "string" ? value.subtitle.trim() : "";
  return { name, ...(slug ? { slug } : {}), ...(subtitle ? { subtitle } : {}) };
}

export async function GET(request: NextRequest) {
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  try {
    const categories = await apiRequest("/categories", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(categories, { headers: responseHeaders });
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
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  const payload = categoryPayload(await request.json().catch(() => null));
  if (!payload.name)
    return NextResponse.json(
      { message: "Category name is required." },
      { status: 400, headers: responseHeaders },
    );
  try {
    const category = await apiRequest("/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    });
    return NextResponse.json(category, {
      status: 201,
      headers: responseHeaders,
    });
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
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const payload = categoryPayload(body);
  if (!id || !payload.name)
    return NextResponse.json(
      { message: "Category ID and name are required." },
      { status: 400, headers: responseHeaders },
    );
  try {
    const category = await apiRequest(`/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(payload),
    });
    return NextResponse.json(category, { headers: responseHeaders });
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
  const accessToken = token(request);
  if (accessToken instanceof NextResponse) return accessToken;
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id)
    return NextResponse.json(
      { message: "Category ID is required." },
      { status: 400, headers: responseHeaders },
    );
  try {
    const category = await apiRequest(`/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(category, { headers: responseHeaders });
  } catch (error) {
    return failure(error);
  }
}
