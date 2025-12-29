"use client";

import { useState } from "react";
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

  const isValid = isValidGermanPostalCode(postalCode);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;

    localStorage.setItem("postalCode", postalCode);

    router.push(`/activity?postalCode=${encodeURIComponent(postalCode)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center gap-2">
      <label htmlFor="postalCode" className="text-xs font-medium text-center">
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
        className="
        h-8
        w-32
        rounded-md
        border
        px-2
        text-sm
        text-center
        sm:w-40
      "
        aria-invalid={postalCode.length > 0 && !isValid}
      />

      {postalCode.length > 0 && !isValid && (
        <p className="text-xs text-red-600 text-center">
          Please enter a valid 5-digit postal code.
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid}
        className="
        mt-1
        h-8
        w-48
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
        sm:w-64
      "
      >
        Submit
      </button>
    </form>
  );
}
