"use client";

import { loginAndSetCookie } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailInvalid = email.length > 0 && !isValidEmail(email);
  const passwordInvalid = false;

  const canSubmit = isValidEmail(email) && password.length > 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const result = await loginAndSetCookie(email, password);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      router.push("/homepage");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-evergreen">
      <header className="border-b-2 border-fern">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg text-evergreen">
              happynachbar
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
          >
            Back
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-center text-2xl font-bold leading-tight text-evergreen sm:text-4xl">
              Login
            </h1>

            <div className="mt-8 sm:mt-10">
              <form
                onSubmit={onSubmit}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-full max-w-sm">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-center block"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={[
                      "mt-1 h-10 w-full rounded-md px-3 text-sm border",
                      emailInvalid
                        ? "border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        : "",
                    ].join(" ")}
                    aria-invalid={emailInvalid}
                  />

                  {emailInvalid && (
                    <p className="mt-1 text-xs text-red-600 text-center">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                <div className="w-full max-w-sm">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-center block"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={[
                      "mt-1 h-10 w-full rounded-md px-3 text-sm border",
                      passwordInvalid
                        ? "border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        : "",
                    ].join(" ")}
                  />
                </div>

                {formError && (
                  <p
                    className="text-xs text-red-600 text-center"
                    role="alert"
                    aria-live="polite"
                  >
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="
                    mt-2
                    h-10
                    w-full
                    max-w-sm
                    rounded-md
                    border-2 border-fern
                    bg-palm
                    text-xs
                    font-medium
                    text-white
                    hover:bg-hunter
                    transition-colors
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
