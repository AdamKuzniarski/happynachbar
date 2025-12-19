import Link from "next/link";
import { PostalCodeForm } from "./postal-code-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-gray-200 sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg">
              happynachbar
            </span>
          </div>

          <Link
            href="/auth/login"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 sm:px-4"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-center text-2xl font-bold leading-tight sm:text-4xl">
              Welcome to happynachbar
            </h1>

            <p className="mt-2 text-center text-sm leading-relaxed text-gray-600 sm:mt-3 sm:text-base">
              Enter your postal code to discover activities in your area.
            </p>

            <div className="mt-8 sm:mt-10">
              <PostalCodeForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
