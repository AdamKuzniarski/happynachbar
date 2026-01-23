"use client";

import { Input } from "@/components/ui/Input";
import { registerUser } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { FormError } from "@/components/ui/FormError";
import { Button } from "@/components/ui/Button";

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
        <h1 className="text-center text-2xl font-bold sm:text-4xl">
          Registieren
        </h1>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex max-w-sm flex-col gap-3"
        >
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Anzeigename (optional)"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            type="password"
          />

          <FormError message={error} />
          <Button disabled={loading}>
            {loading ? "…" : "Konto erstellen"}
          </Button>

          <p className="text-center text-xs">
            Du hast bereits ein Konto? Dann hier entlang zum{" "}
            <Link href="/auth/login" className="underline font-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
