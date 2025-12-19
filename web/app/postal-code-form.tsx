"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalizePostalCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function isValidGermanPostalCode(value: string) {
  return /^\d{5}$/.test(value);
}

export function PostalCodeForm() {
  const [postalCode, setPostalCode] = useState("");
  const router = useRouter();

  const isValid = useMemo(
    () => isValidGermanPostalCode(postalCode),
    [postalCode]
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;

    localStorage.setItem("postalCode", postalCode);

    router.push(`/activity?postalCode=${encodeURIComponent(postalCode)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="postalCode" className="text-sm font-medium">
        Postal Code
      </label>

      <input
        id="postalCode"
        name="postalCode"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="e.g. 10115"
        value={postalCode}
        onChange={(e) => setPostalCode(normalizePostalCode(e.target.value))}
        className="w-full rounded-md border px-3 py-2"
        aria-invalid={postalCode.length > 0 && !isValid}
      />

      {postalCode.length > 0 && !isValid && (
        <p className="text-sm text-red-600">
          Please enter a valid 5-digit postal code.
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="mt-2 rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}
