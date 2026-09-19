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

  try {
    const statistics = await apiRequest("/admin/authors/statistics", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return NextResponse.json(statistics, { headers: responseHeaders });
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
