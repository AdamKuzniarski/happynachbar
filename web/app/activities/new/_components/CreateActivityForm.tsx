"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_CATEGORIES } from "@/lib/api/enums";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function CreateActivityForm() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [plz, setPlz] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setError(null);

    //checks
    if (title.trim().length < 3)
      return setError("Titel muss mindestens 3 Zeichen haben.");
    if (!category) return setError("Bitte Kategorie auswählen.");
    if (!/^\d{5}$/.test(plz.trim()))
      return setError("PLZ muss genau 5 Ziffern sein.");

    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          category,
          plz: plz.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message) || `HTTP ${res.status}`;
        setError(msg);
        return;
      }
      router.push("/homepage");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-md border-2 border-fern bg-limecream p-4 shadow-sm sm:p-6">
      <h1 className="text-lg font-semibold">Neue Aktivität</h1>
      <p className="mt-1 text-sm text-hunter">
        Titel, Kategorie, PLZ, Optional Beschreibung.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium">Titel </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
            placeholder="z.B. Spaziergang im Park"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Kategorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
          >
            <option value="">Bitte wählen</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">PLZ </label>
          <input
            value={plz}
            onChange={(e) =>
              setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            inputMode="numeric"
            maxLength={5}
            className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
            placeholder="10115"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Beschreibung </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-md border-2 border-fern bg-white px-3 py-2 text-sm outline-none min-h-[100px]"
            placeholder="Optional…"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-palm px-4 py-2 text-sm font-medium text-white hover:bg-hunter disabled:opacity-60"
        >
          {saving ? "Speichern…" : "Erstellen"}
        </button>
      </form>
    </section>
  );
}
