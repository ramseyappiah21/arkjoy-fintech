import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "arkjoy_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isBankingApi = pathname.startsWith("/api/banking");
  const isPaymentsApi = pathname.startsWith("/api/payments/momo");

  if (!isDashboard && !isBankingApi && !isPaymentsApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) {
    if (isBankingApi || isPaymentsApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.AUTH_SECRET || "arkjoy-dev-secret-change-me-before-production"
    );
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isBankingApi || isPaymentsApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const res = NextResponse.redirect(login);
    res.cookies.delete(COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/banking/:path*", "/api/payments/momo/:path*"],
};
