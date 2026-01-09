"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logout } from "../login/actions";

export default function LogoutPage() {
  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="min-h-screen bg-white text-evergreen">
      <header className="border-b-2 border-fern">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <Link href="/homepage" className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg text-evergreen">
              happynachbar
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen transition-colors hover:bg-palm hover:text-limecream sm:px-4"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
          <section className="mx-auto w-full max-w-md">
            <h1 className="text-xl font-semibold text-evergreen sm:text-2xl">
              Du bist erfolgreich ausgeloggt
            </h1>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-center text-sm font-medium text-evergreen transition-colors hover:bg-palm hover:text-limecream sm:px-4"
              >
                Zurück zur Landingpage
              </Link>

              <Link
                href="/auth/login"
                className="rounded-md border-2 border-fern bg-white px-3 py-2 text-center text-sm font-medium text-evergreen transition-colors hover:bg-limecream sm:px-4"
              >
                Zum Login
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
