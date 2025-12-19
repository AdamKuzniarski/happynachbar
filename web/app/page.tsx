import Link from "next/link";
import { PostalCodeForm } from "./postal-code-form";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-gray-200" aria-hidden="true" />
          <span className="text-lg font-semibold">happynachbar</span>
        </div>

        <Link
          href="/auth/login"
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Login
        </Link>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-16">
        <h1 className="text-3xl font-bold text-center">
          Welcome to happynachbar
        </h1>

        <p className="mt-3 text-center text-gray-600">
          Enter your postal code to discover activities in your area.
        </p>

        <div className="mt-10 w-full max-w-md">
          <PostalCodeForm />
        </div>
      </main>
    </div>
  );
}
