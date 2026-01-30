import Link from "next/link";
import { cookies } from "next/headers";
import { User } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";

export type HeaderVariant = "public" | "auth" | "app" | "logout";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type UserMeResponse = {
  email?: string | null;
  profile?: { displayName?: string | null } | null;
};

export async function AppHeader({
  variant,
  showBackOnAuth = false,
}: {
  variant: HeaderVariant;
  showBackOnAuth?: boolean;
}) {
  const brandHref =
    variant === "app"
      ? "/homepage"
      : variant === "auth"
        ? "/"
        : variant === "logout"
          ? "/homepage"
          : undefined;

  let userLabel: string | null = null;
  if (variant === "app") {
    const token = (await cookies()).get("happynachbar_token")?.value;
    if (token) {
      try {
        const res = await fetch(`${apiBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.ok) {
          const me = (await res.json()) as UserMeResponse;
          const displayName = me?.profile?.displayName?.trim();
          userLabel = displayName || me?.email?.trim() || null;
        }
      } catch {
        userLabel = null;
      }
    }
  }

  const btn =
    "rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4";
  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-fern bg-surface text-foreground hover:bg-palm hover:text-limecream transition-colors sm:h-10 sm:w-10";

  const brand = (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
        aria-hidden="true"
      />
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold sm:text-lg text-foreground">
          happynachbar
        </span>
        {variant === "app" && userLabel ? (
          <span className="mt-1 text-xs text-foreground/80">
            Angemeldet als {userLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
  // MVP toggle: show link only when explicitly enabled
  const showAdminLink =
    variant === "app" && process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true";

  return (
    <header className="border-b-2 border-fern">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
        {brandHref ? <Link href={brandHref}>{brand}</Link> : brand}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {variant === "app" ? (
            <>
              <Link href="/profile" className={iconBtn} aria-label="Profil">
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
              {showAdminLink ? (
                <Link href="/admin/activities" className={btn}>
                  Admin
                </Link>
              ) : null}

              <a href="/auth/logout" className={btn}>
                Logout
              </a>
            </>
          ) : variant === "auth" ? (
            showBackOnAuth ? (
              <Link href="/" className={btn}>
                Back
              </Link>
            ) : null
          ) : (
            <Link href="/auth/login" className={btn}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
