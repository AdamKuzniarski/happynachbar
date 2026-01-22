"use client";

import Link from "next/link";
import * as React from "react";
import { logout } from "../login/actions";

export default function LogoutPage() {
  React.useEffect(() => {
    logout();
  }, []);

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Du bist erfolgreich ausgeloggt.
        </h1>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="rounded-md border-2 border-fern bg-limecream px-4 py-2 text-center text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream"
          >
            Zur Landingpage
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border-2 border-fern bg-surface px-4 py-2 text-center text-sm font-medium hover:bg-surface-strong"
          >
            Zum Login
          </Link>
        </div>
      </div>
    </main>
  );
}
