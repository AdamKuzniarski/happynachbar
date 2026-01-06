import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "happynachbar_token";

// List of public routes (no login redirect needed)
const PUBLIC_PATHS = new Set<string>([
  "/", // landing page
  "/auth/login", // login page
]);

function buildRedirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.cookies.get(COOKIE_NAME)?.value;

  // If already logged in, never show login page
  if (isLoggedIn && pathname === "/auth/login") {
    return buildRedirect(req, "/homepage");
  }

  // Allow public routes
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // All other routes require auth
  if (!isLoggedIn) {
    return buildRedirect(req, "/auth/login");
  }

  return NextResponse.next();
}

/**
 * Run middleware for "all pages" but skip Next internals + static files.
 * This is the important part to avoid middleware running for assets.
 */
export const config = {
  matcher: [
    // Run on all routes except:
    // - /api
    // - Next internals
    // - any file with an extension (e.g. .png, .svg, .css, .js, .ico, .txt, ...)
    "/((?!api|_next|.*\\..*).*)",
  ],
};
