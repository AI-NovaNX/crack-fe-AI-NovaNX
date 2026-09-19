import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { apiRequest, ApiError, createApiUrl } from "@/lib/api";
import { getHttpErrorMessage } from "@/lib/error-message";

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  avatar?: string | null;
};
type AuthResponse = { accessToken: string; refreshToken: string; user: User };
type Context = { params: Promise<{ action: string }> };
const acceptedAvatarTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const maxAvatarSize = 5 * 1024 * 1024;
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
  const phoneNumber =
    typeof body?.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ message: "Please enter a name and a valid email address." }, 400);
  try {
    // Refresh an expired session before sending the authenticated update.
    await profile();
    const user = await apiRequest<User>("/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${await accessToken()}` },
      body: JSON.stringify({ fullName, email, phoneNumber: phoneNumber || null }),
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
  if (!["login", "register", "logout", "avatar"].includes(action))
    return json({ message: "Not found" }, 404);
  try {
    if (action === "avatar") {
      await profile();
      const formData = await request.formData();
      const file = formData.get("avatar") ?? formData.get("file");
      if (!(file instanceof File))
        return json({ message: "Please select an avatar image first." }, 400);
      if (!acceptedAvatarTypes.has(file.type))
        return json({ message: "Use a JPG, PNG, WEBP, or GIF file." }, 400);
      if (file.size > maxAvatarSize)
        return json({ message: "The image must be at most 5 MB." }, 400);

      const uploadFormData = new FormData();
      uploadFormData.set("avatar", file);
      const uploadResponse = await fetch(createApiUrl("/me"), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${await accessToken()}` },
        body: uploadFormData,
        cache: "no-store",
      });
      const uploadBody = (await uploadResponse.json().catch(() => null)) as
        | User
        | { message?: string }
        | null;
      if (!uploadResponse.ok) {
        const errorMessage =
          uploadBody &&
          "message" in uploadBody &&
          typeof uploadBody.message === "string"
            ? uploadBody.message
            : "The avatar could not be uploaded.";
        throw new ApiError(
          uploadResponse.status,
          errorMessage,
        );
      }
      const user = uploadBody as User | null;
      if (!user?.avatar)
        throw new ApiError(502, "The backend did not return an avatar path.");
      return json({ user, avatar: user.avatar });
    }

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
