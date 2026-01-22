"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { loginAndSetCookie } from "./actions";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    try {
      const result = await loginAndSetCookie(email.trim(), password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/homepage");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4">
      <form
        onSubmit={onSubmit}
        className="mx-auto mt-8 flex max-w-sm flex-col gap-3"
      >
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
        <Button disabled={loading}>{loading ? "…" : "Anmelden"}</Button>
        <p className="text-center text-xs">
          Kein Konto?{" "}
          <Link href="/auth/register" className="underline font-semibold">
            Registrieren
          </Link>
        </p>
      </form>
    </main>
  );
}
