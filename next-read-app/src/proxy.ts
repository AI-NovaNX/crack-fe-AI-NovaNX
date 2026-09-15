import { NextRequest, NextResponse } from "next/server";

import type { SessionUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

const ACCESS_COOKIE = "nexread_access";
const REFRESH_COOKIE = "nexread_refresh";
const ADMIN_USER_HEADER = "x-nexread-admin-user";
const ADMIN_ACCESS_HEADER = "x-nexread-admin-access";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

function homeRedirect(request: NextRequest) {
  const homeUrl = new URL("/", request.url);
  homeUrl.searchParams.set("auth", "forbidden");
  return NextResponse.redirect(homeUrl);
}

async function requestProfile(accessToken: string) {
  if (!API_BASE_URL) return null;
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as SessionUser;
}

async function refreshSession(refreshToken: string) {
  if (!API_BASE_URL) return null;
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as AuthResponse;
}

export async function proxy(request: NextRequest) {
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin/");

  try {
    const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    let user = accessToken ? await requestProfile(accessToken) : null;
    let refreshedSession: AuthResponse | null = null;

    if (!user && refreshToken) {
      refreshedSession = await refreshSession(refreshToken);
      user = refreshedSession?.user ?? null;
    }

    if (!user) {
      if (isAdminApi)
        return NextResponse.json({ message: "Please sign in." }, { status: 401 });
      return loginRedirect(request);
    }
    if (!isAdminRole(user.role)) {
      if (isAdminApi)
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      return homeRedirect(request);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      ADMIN_USER_HEADER,
      encodeURIComponent(JSON.stringify(user)),
    );
    requestHeaders.set(
      ADMIN_ACCESS_HEADER,
      refreshedSession?.accessToken ?? accessToken ?? "",
    );
    const response = NextResponse.next({ request: { headers: requestHeaders } });

    if (refreshedSession) {
      response.cookies.set(
        ACCESS_COOKIE,
        refreshedSession.accessToken,
        cookieOptions,
      );
      response.cookies.set(
        REFRESH_COOKIE,
        refreshedSession.refreshToken,
        cookieOptions,
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable." },
      { status: 503 },
    );
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
