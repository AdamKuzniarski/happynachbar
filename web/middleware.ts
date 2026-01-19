import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "happynachbar_token";

// Normalize paths so "/activity/" behaves like "/activity" (but keep "/" as-is)
function normalizePath(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

// List of public routes (no login redirect needed)
const PUBLIC_PATHS = new Set<string>([
  "/", // landing page
  "/auth/login", // login page
  "/auth/register", // register page
  "/teaser", // activity teaser page
]);

function buildRedirect(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const pathname = normalizePath(req.nextUrl.pathname);
  const isLoggedIn = !!req.cookies.get(COOKIE_NAME)?.value;

  // If already logged in, never show login page
  if (isLoggedIn && pathname === "/auth/login") {
    return buildRedirect(req, "/homepage");
  }

  // If already logged in, never show landing page
  if (isLoggedIn && pathname === "/") {
    return buildRedirect(req, "/homepage");
  }

  // If already logged in, skip the public teaser funnel and go straight to the homepage
  if (isLoggedIn && pathname === "/activity") {
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
