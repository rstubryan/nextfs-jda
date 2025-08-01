import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // Current path
  const { pathname } = request.nextUrl;

  // Auth routes don't require authentication
  const isAuthRoute = ["/login", "/register"].includes(pathname);

  // Protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // Check if user is trying to access protected route without token
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user has token and tries to access auth routes, redirect to home
  if (token && isAuthRoute) {
    try {
      // Verify token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "default_secret_key",
      );
      await jwtVerify(token, secret);

      return NextResponse.redirect(new URL("/", request.url));
    } catch {
      // Invalid token, clear it and allow access to auth routes
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
