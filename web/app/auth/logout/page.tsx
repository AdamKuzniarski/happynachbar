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
      <div className="mx-auto w-full max-w-md pt-12 pb-16 sm:max-w-2xl sm:pt-20">
        <h1 className="text-center text-xl font-semibold sm:text-2xl">
          Du bist erfolgreich ausgeloggt.
        </h1>
        <p className="mt-5 text-center text-sm text-foreground/80">
          Schön, dass du da warst – bis bald in der Nachbarschaft.
        </p>

        <div className="mt-10" />
      </div>
    </main>
  );
}
