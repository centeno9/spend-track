import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const noAuthRoutes = ["/login", "sign-up"];

const authRoutes = ["/dashboard", "/settings", "/expenses", "/tags"];

const publicRoutes = ["/"];

const isPublicRoute = (path: string) => publicRoutes.some((pr) => pr === path);

const isAuthRoute = (path: string) =>
  authRoutes.some((ar) => path.startsWith(ar));

const isNoAuthRoute = (path: string) =>
  noAuthRoutes.some((nar) => path.startsWith(nar));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const cookieManager = await cookies();
  const authToken = cookieManager.get("authToken")?.value;

  if (isAuthRoute(pathname) && !authToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("returnTo", pathname);

    return NextResponse.redirect(url);
  }

  if (isNoAuthRoute(pathname) && authToken)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
