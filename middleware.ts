import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "naoii_session";

const protectedPaths = ["/app", "/feed", "/settings", "/posts/new", "/articles/new", "/library", "/notifications", "/admin"];
const authPaths = ["/login", "/register"];

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const authed = await isAuthenticated(request);
  const { pathname } = request.nextUrl;

  // Protected routes → redirect to /login
  if (!authed && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages → redirect to /app if already logged in
  if (authed && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/feed",
    "/feed/:path*",
    "/settings/:path*",
    "/posts/new",
    "/articles/new",
    "/articles/:path*/edit",
    "/library",
    "/notifications",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
