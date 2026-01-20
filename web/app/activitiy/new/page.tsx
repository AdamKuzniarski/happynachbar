"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FieldErrors = Partial<
  Record<"title" | "category" | "plz" | "startAt" | "imageUrls", string>
>;

const CATEGORY_OPTIONS = [
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "SPORT", label: "Sport" },
  { value: "SOCIAL", label: "Social" },
  { value: "INDOOR", label: "Indoor" },
  { value: "HELP", label: "Help" },
  { value: "OTHER", label: "Other" },
] as const;

function mapBackendMessages(messages: unknown): FieldErrors {
  const e: FieldErrors = {};
  const arr = Array.isArray(messages) ? messages : [messages];

  for (const msg of arr) {
    const m = String(msg);
    const lower = m.toLowerCase();

    if (lower.includes("imageurls")) {
      e.imageUrls = "Bitte gib eine gültige Bild-URL (http/https) ein.";
    } else if (lower.includes("plz")) {
      e.plz = "Bitte gib eine gültige 5-stellige PLZ ein.";
    } else if (lower.includes("title")) {
      e.title = "Bitte prüfe den Titel.";
    } else if (lower.includes("category")) {
      e.category = "Bitte wähle eine Kategorie.";
    } else if (lower.includes("startat")) {
      e.startAt = "Bitte prüfe die Startzeit.";
    } else {
      // Wenn gar nicht zuordenbar: an imageUrls hängen (damit kein globales Banner nötig ist)
      e.imageUrls = e.imageUrls ?? m;
    }
  }

  return e;
}

function isValidPlz(v: string) {
  return /^\d{5}$/.test(v);
}

function toIsoFromDateTimeLocal(v: string) {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreateActivityPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<string>("");
  const [plz, setPlz] = React.useState("");
  const [startAtLocal, setStartAtLocal] = React.useState("");
  const [imageUrls, setImageUrls] = React.useState<string[]>([""]);

  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  function validate(): boolean {
    const e: FieldErrors = {};

    const t = title.trim();
    if (t.length < 3) e.title = "Titel muss mindestens 3 Zeichen haben.";
    if (t.length > 120) e.title = "Titel darf max. 120 Zeichen haben.";

    if (!category) e.category = "Kategorie ist erforderlich.";

    const p = plz.trim();
    if (!isValidPlz(p)) {
      e.plz = "PLZ muss aus genau 5 Ziffern bestehen (führende Nullen ok).";
    }

    if (startAtLocal) {
      const iso = toIsoFromDateTimeLocal(startAtLocal);
      if (!iso) e.startAt = "Ungültiges Datum/Zeit.";
    }

    const urls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (urls.length > 5) e.imageUrls = "Maximal 5 Bild-URLs erlaubt.";

    // ✅ Wichtig: nur http/https erlauben (data: URLs sollen scheitern)
    for (const u of urls) {
      if (!isHttpUrl(u)) {
        e.imageUrls =
          "Bitte nur http/https Bild-URLs verwenden (keine data:image/... URLs).";
        break;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function setImageAt(i: number, value: string) {
    setImageUrls((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function addImageField() {
    setImageUrls((prev) => (prev.length >= 5 ? prev : [...prev, ""]));
  }

  function removeImageField(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("SUBMIT", { title, category, plz, startAtLocal, imageUrls });

    if (saving) return;
    console.log("SUBMIT1", { title, category, plz, startAtLocal, imageUrls });

    setSubmitError(null);
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        category,
        plz: plz.trim(),
        startAt: startAtLocal
          ? toIsoFromDateTimeLocal(startAtLocal)
          : undefined,
        imageUrls: imageUrls
          .map((u) => u.trim())
          .filter(Boolean)
          .slice(0, 5),
      };

      const res = await fetch(`${apiBase}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        // ✅ 400 Validation errors -> unter die passenden Felder mappen
        if (res.status === 400 && data?.message) {
          setErrors(mapBackendMessages(data.message));
          return;
        }

        // ✅ sonstiger Fehler -> unten bei den Buttons
        const msg =
          (typeof data?.message === "string" && data.message) ||
          (Array.isArray(data?.message) && data.message.join("\n")) ||
          `Speichern fehlgeschlagen (HTTP ${res.status}).`;
        setSubmitError(msg);
        return;
      }

      router.push("/homepage");

      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unbekannter Fehler."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-evergreen">
      <header className="border-b-2 border-fern">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <Link href="/homepage" className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg text-evergreen">
              happynachbar
            </span>
          </Link>

          <a
            href="/auth/logout"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
          >
            Logout
          </a>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl lg:max-w-3xl sm:pt-10">
          <div className="mb-4">
            <Link
              href="/homepage"
              className="text-sm underline opacity-80 hover:opacity-100"
            >
              ← Zurück
            </Link>
          </div>

          <section className="rounded-md bg-limecream border-2 border-fern shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <h1 className="text-base sm:text-lg font-semibold text-evergreen">
                Neue Aktivität erstellen
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-hunter">
                Titel, Kategorie und PLZ sind Pflicht. Startzeit & Bilder
                optional.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium">Titel *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
                    placeholder="z.B. Spaziergang im Park"
                  />
                  {errors.title && (
                    <div className="mt-1 text-xs text-hunter">
                      {errors.title}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium">
                    Beschreibung
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 w-full rounded-md border-2 border-fern bg-white px-3 py-2 text-sm outline-none min-h-[110px]"
                    placeholder="Optional: Details…"
                  />
                </div>

                {/* Category + PLZ */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Kategorie *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
                    >
                      <option value="">Bitte wählen</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="mt-1 text-xs text-hunter">
                        {errors.category}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">PLZ *</label>
                    <input
                      value={plz}
                      onChange={(e) =>
                        setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))
                      }
                      placeholder="z.B. 10115"
                      aria-label="PLZ"
                      maxLength={5}
                      inputMode="numeric"
                      className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
                    />

                    {errors.plz && (
                      <div className="mt-1 text-xs text-hunter">
                        {errors.plz}
                      </div>
                    )}
                  </div>
                </div>

                {/* StartAt */}
                <div>
                  <label className="block text-sm font-medium">
                    Startzeit (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startAtLocal}
                    onChange={(e) => setStartAtLocal(e.target.value)}
                    className="mt-1 h-11 w-full rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
                  />
                  {errors.startAt && (
                    <div className="mt-1 text-xs text-hunter">
                      {errors.startAt}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="block text-sm font-medium">
                      Bilder (URLs, optional)
                    </label>
                    <button
                      type="button"
                      onClick={addImageField}
                      disabled={imageUrls.length >= 5}
                      className="text-xs underline opacity-80 hover:opacity-100 disabled:opacity-40"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {imageUrls.map((u, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={u}
                          onChange={(e) => setImageAt(i, e.target.value)}
                          className="h-11 flex-1 rounded-md border-2 border-fern bg-white px-3 text-sm outline-none"
                          placeholder="https://…"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(i)}
                          disabled={imageUrls.length === 1}
                          className="h-11 rounded-md border-2 border-fern bg-white px-3 text-xs hover:bg-limecream disabled:opacity-40"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {errors.imageUrls && (
                    <div className="mt-1 text-xs text-hunter">
                      {errors.imageUrls}
                    </div>
                  )}
                  <div className="mt-1 text-xs opacity-70">Max. 5 URLs.</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-palm px-4 py-2 text-sm font-medium text-white hover:bg-hunter transition-colors disabled:opacity-60"
                  >
                    {saving ? "Speichern…" : "Aktivität erstellen"}
                  </button>

                  <Link
                    href="/homepage"
                    className="rounded-md border-2 border-fern bg-white px-4 py-2 text-sm font-medium hover:bg-limecream transition-colors"
                  >
                    Abbrechen
                  </Link>
                </div>

                {submitError && (
                  <p
                    className="text-xs text-red-600 whitespace-pre-line"
                    role="alert"
                  >
                    {submitError}
                  </p>
                )}
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
