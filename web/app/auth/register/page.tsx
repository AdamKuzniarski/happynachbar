"use client";

import { registerUser } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await registerUser(
        email.trim().toLowerCase(),
        password,
        displayName.trim() || undefined,
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
        <h1 className="text-center text-2xl font-bold sm:text-4xl">Register</h1>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex max-w-sm flex-col gap-3"
        >
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 rounded-md border-2 border-fern px-3 text-sm"
            placeholder="Anzeigename (optional)"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-md border-2 border-fern px-3 text-sm"
            placeholder="E-Mail"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-md border-2 border-fern px-3 text-sm"
            placeholder="Passwort"
            type="password"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="h-11 rounded-md bg-palm text-sm font-medium text-white hover:bg-hunter disabled:opacity-60"
          >
            {loading ? "…" : "Konto erstellen"}
          </button>

          <p className="text-center text-xs">
            Schon dabei?{" "}
            <Link href="/auth/login" className="underline font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
