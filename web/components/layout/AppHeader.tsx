import Link from "next/link";
import { User } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";

export type HeaderVariant = "public" | "auth" | "app" | "logout";

export function AppHeader({
  variant,
  showBackOnAuth = false,
}: {
  variant: HeaderVariant;
  showBackOnAuth?: boolean;
}) {
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
      <span className="text-sm font-semibold sm:text-lg text-foreground">
        happynachbar
      </span>
    </div>
  );

  const brandHref =
    variant === "app"
      ? "/homepage"
      : variant === "auth"
        ? "/"
        : variant === "logout"
          ? "/homepage"
          : undefined;

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
