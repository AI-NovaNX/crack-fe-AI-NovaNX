import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };
const allowedStatuses = new Set([
  "ALL",
  "ACTIVE",
  "RETURN_REQUESTED",
  "RETURNED",
  "OVERDUE",
]);

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
  const requestedStatus = request.nextUrl.searchParams
    .get("status")
    ?.toUpperCase();
  const status =
    requestedStatus && allowedStatuses.has(requestedStatus)
      ? requestedStatus
      : "ALL";
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });
  if (query) params.set("q", query);

  try {
    const loans = await apiRequest(`/admin/loans?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(loans, { headers: responseHeaders });
  } catch (error) {
    const responseStatus = error instanceof ApiError ? error.status : 502;
    return NextResponse.json(
      {
        message: getHttpErrorMessage(
          responseStatus,
          error instanceof ApiError ? error.message : undefined,
        ),
      },
      { status: responseStatus, headers: responseHeaders },
    );
  }
}
