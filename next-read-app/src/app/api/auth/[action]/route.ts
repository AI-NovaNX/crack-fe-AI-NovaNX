import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiRequest, ApiError } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

type User = { id: number; fullName: string; email: string; role: string };
type AuthResponse = { accessToken: string; refreshToken: string; user: User };
type Context = { params: Promise<{ action: string }> };
const accessKey = "nexread_access";
const refreshKey = "nexread_refresh";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function saveSession(auth: AuthResponse) {
  const jar = await cookies();
  jar.set(accessKey, auth.accessToken, cookieOptions);
  jar.set(refreshKey, auth.refreshToken, cookieOptions);
}
async function clearSession() {
  const jar = await cookies();
  jar.delete(accessKey);
  jar.delete(refreshKey);
}
async function accessToken() {
  const jar = await cookies();
  const access = jar.get(accessKey)?.value;
  if (!access) throw new ApiError(401, "Please sign in.");
  return access;
}
async function profile() {
  try {
    return await apiRequest<User>("/me", {
      headers: { Authorization: `Bearer ${await accessToken()}` },
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const refreshToken = (await cookies()).get(refreshKey)?.value;
    if (!refreshToken) throw error;
    const auth = await apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    await saveSession(auth);
    return auth.user;
  }
}
async function failure(error: unknown) {
  if (error instanceof ApiError && error.status === 401) await clearSession();
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
export async function GET(_request: NextRequest, context: Context) {
  if ((await context.params).action !== "session")
    return json({ message: "Not found" }, 404);
  try {
    return json({ user: await profile() });
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: NextRequest, context: Context) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);
  if ((await context.params).action !== "profile")
    return json({ message: "Not found" }, 404);
  const body = await request.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ message: "Isi nama dan alamat email yang valid." }, 400);
  try {
    // Refresh an expired session before sending the authenticated update.
    await profile();
    const user = await apiRequest<User>("/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${await accessToken()}` },
      body: JSON.stringify({ fullName, email }),
    });
    return json({ user });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  // Cookie-authenticated mutations must originate from this frontend.
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return json({ message: "Invalid origin" }, 403);
  const { action } = await context.params;
  if (!["login", "register", "logout"].includes(action))
    return json({ message: "Not found" }, 404);
  try {
    if (action === "logout") {
      try {
        await profile();
        await apiRequest<void>("/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${await accessToken()}` },
        });
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
      await clearSession();
      return json({ success: true });
    }
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      (action === "register" && typeof body.fullName !== "string")
    ) {
      return json({ message: "Please complete the required fields." }, 400);
    }
    const payload = {
      email: body.email,
      password: body.password,
      ...(action === "register" ? { fullName: body.fullName } : {}),
    };
    const auth = await apiRequest<AuthResponse>(`/auth/${action}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await saveSession(auth);
    return json({ user: auth.user }, action === "register" ? 201 : 200);
  } catch (error) {
    return failure(error);
  }
}
