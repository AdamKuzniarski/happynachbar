import * as React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PostalCodeForm } from "./postal-code-form";

export default function LandingPage() {
  return (
    <AppShell variant="public">
      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-center text-2xl font-bold leading-tight text-evergreen sm:text-base">
              Willkommen in happynachbar App
            </h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-hunter sm:mt-3 sm:text-base">
              Lerne deine Nachbarschaft kennen
            </p>

            <div className="mt-8 sm:mt-10">
              <PostalCodeForm />
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
