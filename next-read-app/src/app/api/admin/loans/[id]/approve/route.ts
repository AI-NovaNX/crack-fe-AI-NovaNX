import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const responseHeaders = { "Cache-Control": "no-store" };

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: responseHeaders });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = request.headers.get(ADMIN_ACCESS_HEADER);
  if (!accessToken)
    return json({ message: "Please sign in." }, 401);

  const { id } = await params;
  const loanId = Number(id);
  if (!Number.isSafeInteger(loanId) || loanId <= 0)
    return json({ message: "ID pinjaman tidak valid." }, 400);

  try {
    await apiRequest(`/loans/${loanId}/return`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return json({ success: true });
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
