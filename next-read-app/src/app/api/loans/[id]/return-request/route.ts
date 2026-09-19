import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);

  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Please sign in to continue." }, 401);

  const { id } = await params;
  const loanId = Number(id);
  if (!Number.isSafeInteger(loanId) || loanId <= 0)
    return json({ message: "Invalid loan ID." }, 400);

  try {
    await apiRequest(`/loans/${loanId}/return`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
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
