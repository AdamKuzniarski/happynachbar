"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ChatUnreadBadge } from "../chat/ChatUnreadBadge";
import { useLocale, useTranslations } from "next-intl";

export type HeaderVariant = "public" | "auth" | "app" | "logout";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type UserMeResponse = {
  email?: string | null;
  profile?: { displayName?: string | null } | null;
};

export function AppHeader({
  variant,
  showBackOnAuth = false,
}: {
  variant: HeaderVariant;
  showBackOnAuth?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("header");
  const pathname = usePathname();
  const brandHref =
    variant === "app"
      ? `/${locale}/homepage`
      : variant === "auth"
        ? `/${locale}`
        : variant === "logout"
          ? `/${locale}/homepage`
          : undefined;

  const [userLabel, setUserLabel] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (variant !== "app") return;
    let alive = true;
    fetch(`${apiBase}/users/me`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((me: UserMeResponse | null) => {
        if (!alive) return;
        const displayName = me?.profile?.displayName?.trim();
        const label = displayName || me?.email?.trim() || null;
        setUserLabel(label);
      })
      .catch(() => {
        if (!alive) return;
        setUserLabel(null);
      });

    return () => {
      alive = false;
    };
  }, [variant]);

  const btn =
    "rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4";
  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-fern bg-surface text-foreground hover:bg-palm hover:text-limecream transition-colors sm:h-10 sm:w-10";

  const brand = (
    <div className="flex items-center gap-2 sm:gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        fill="none"
        className="h-9 w-9 sm:h-10 sm:w-10"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="6"
          fill="#50762f"
          stroke="#50762f"
          strokeWidth="2"
        />
        <g
          transform="translate(8 6) scale(0.0434782609 0.0428571429) translate(-106.5 -124.5)"
          fill="#000"
          stroke="#000"
          strokeWidth="14"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        >
          <path d="M279 349.5L268 348.5L260.5 343L256.5 335V325L257.5 324V314L258.5 313V304L259.5 303L262.5 272L264.5 265L265.5 252L266.5 251L275.5 192L276.5 191L278.5 170L279.5 169V151L278.5 150L277.5 137L279.5 132L285 126.5L293 124.5L300 126.5L306.5 134L309.5 150V168L308.5 169V178L305.5 192V198L304.5 199L295.5 258L294.5 259L289.5 303L288.5 304V312L287.5 313V318L295.5 326L296.5 335L294.5 340L290 344.5L279 349.5Z" />
          <path d="M400 381.5H395L390 379.5L385.5 375L380.5 366L379.5 361L380.5 330L381.5 329L383.5 309L388.5 289L394.5 254L407.5 199L408.5 182L409.5 181V146L411.5 141L416 136.5L420 134.5H429L432 135.5L437.5 141L439.5 146V178L438.5 179L437.5 200L436.5 201L433.5 222L424.5 256L421.5 276L418.5 286L411.5 323L410.5 338L409.5 339V357L412.5 362V371L407 378.5L400 381.5Z" />
          <path d="M414 684.5H388L387 683.5H376L375 682.5L355 680.5L328 672.5L292 655.5L263 637.5L224 607.5L185.5 570L170.5 552L154.5 529L135.5 495L126.5 474L118.5 450L112.5 426V421L109.5 408V401L108.5 400V391L107.5 390L106.5 352L107.5 351V343L109.5 333L114.5 318L117.5 311L123 305.5L130 303.5L138 305.5L143.5 311L145.5 316V321L138.5 340L137.5 351L136.5 352V379L137.5 380L138.5 400L139.5 401L142.5 424L149.5 449L160.5 478L173.5 503L190.5 529L207.5 550L235 577.5L260 598.5L285 616.5L310 631.5L333 642.5L361 651.5L383 653.5L384 654.5H413L421 652.5L429 648.5L436 643.5L447.5 632L464.5 607L475.5 584L485.5 558L499.5 512L513.5 455V451L515.5 446L517.5 432L521.5 418L528.5 382L534.5 360L537.5 354L544 347.5L549 345.5L557 346.5L564.5 353L566.5 358V363L562.5 371L557.5 389V393L554.5 402L553.5 411L551.5 416L550.5 425L548.5 430L547.5 439L545.5 444L544.5 453L535.5 488L534.5 496L532.5 500L528.5 519L518.5 550V553L501.5 599L488.5 625L477.5 642L469.5 652L455 666.5L445 673.5L431 680.5L414 684.5Z" />
        </g>
      </svg>
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold sm:text-lg text-foreground">
          happynachbar
        </span>
        {variant === "app" && userLabel ? (
          <span className="mt-1 text-xs text-foreground/80">
            {t("greeting", { name: userLabel })}
          </span>
        ) : null}
      </div>
    </div>
  );
  // MVP toggle: show link only when explicitly enabled
  const showAdminLink =
    variant === "app" && process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true";

  function buildLocaleHref(targetLocale: string) {
    if (!pathname) return `/${targetLocale}`;
    const parts = pathname.split("/");
    if (parts.length < 2) return `/${targetLocale}`;
    if (parts[1] === locale) {
      parts[1] = targetLocale;
      return parts.join("/") || `/${targetLocale}`;
    }
    return `/${targetLocale}${pathname === "/" ? "" : pathname}`;
  }

  return (
    <header className="border-b-2 border-fern">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
        {brandHref ? <Link href={brandHref}>{brand}</Link> : brand}

        <div className="flex items-center gap-2">
          <Link
            href={buildLocaleHref(locale === "de" ? "en" : "de")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-fern bg-surface text-[11px] font-semibold text-foreground transition-colors hover:bg-palm hover:text-limecream sm:h-10 sm:w-10"
            aria-label={locale === "de" ? t("switchToEn") : t("switchToDe")}
          >
            {locale === "de" ? "DE" : "EN"}
          </Link>
          <ThemeToggle />

          {variant === "app" ? (
            <>
              <ChatUnreadBadge className={iconBtn} />
              <Link
                href={`/${locale}/profile`}
                className={iconBtn}
                aria-label={t("profileAria")}
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </Link>
              {showAdminLink ? (
                <Link href={`/${locale}/admin/activities`} className={btn}>
                  {t("admin")}
                </Link>
              ) : null}

              <a
                href={`/${locale}/auth/logout`}
                className={iconBtn}
                aria-label={t("logoutAria")}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </a>
            </>
          ) : variant === "auth" ? (
            showBackOnAuth ? (
              <Link href={`/${locale}`} className={btn}>
                {t("back")}
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className={iconBtn}
                aria-label={t("loginAria")}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
              </Link>
            )
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className={iconBtn}
              aria-label={t("loginAria")}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
