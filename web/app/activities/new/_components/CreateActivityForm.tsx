"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_CATEGORIES } from "@/lib/api/enums";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

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
          <Label htmlFor="title">Title </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Spaziergang im Park"
          />
        </div>

        <div>
          <Label htmlFor="category"> Kategorie</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Bitte wählen</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="plz">PLZ</Label>
          <Input
            value={plz}
            onChange={(e) =>
              setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            inputMode="numeric"
            maxLength={5}
            placeholder="10115"
          />
        </div>

        <div>
          <Label htmlFor="desc">Beschreibung</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional…"
          />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={saving}>
          {saving ? "Speichern…" : "Erstellen"}
        </Button>
      </form>
    </section>
  );
}
