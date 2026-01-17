import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/auth"];
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    (pathname.includes(".") && !pathname.endsWith(".html"))
  ) {
    return NextResponse.next();
  }
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const refreshToken = request.cookies.get("refreshToken");

  if (!refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (refreshToken && pathname.startsWith("/auth")) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
