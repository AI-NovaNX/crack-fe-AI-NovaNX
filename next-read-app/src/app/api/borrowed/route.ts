import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function GET() {
  const token = (await cookies()).get("nexread_access")?.value;
  if (!token)
    return json({ message: "Silakan login untuk melihat pinjaman." }, 401);

  try {
    const loans = await apiRequest<unknown[]>("/loans", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return json(loans);
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
