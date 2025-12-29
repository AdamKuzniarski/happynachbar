import Link from "next/link";
import { PostalCodeForm } from "./postal-code-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-evergreen">
      <header className="border-b-2 border-fern">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg text-evergreen">
              happynachbar
            </span>
          </div>

          <Link
            href="/auth/login"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-center text-2xl font-bold leading-tight text-evergreen sm:text-4xl">
              Welcome to happynachbar
            </h1>

            <p className="mt-2 text-center text-sm leading-relaxed text-hunter sm:mt-3 sm:text-base">
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
