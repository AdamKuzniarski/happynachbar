"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_CATEGORIES, formatActivityCategory } from "@/lib/api/enums";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { isHttpUrl } from "@/lib/validators";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function CreateActivityForm() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [plz, setPlz] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startAt, setStartAt] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [manualUrls, setManualUrls] = React.useState<string[]>([]);
  const [urlInput, setUrlInput] = React.useState("");
  const [urlAdded, setUrlAdded] = React.useState(false);
  const [urlDuplicate, setUrlDuplicate] = React.useState(false);

  React.useEffect(() => {
    if (!urlAdded) return;
    const t = setTimeout(() => setUrlAdded(false), 2000);
    return () => clearTimeout(t);
  }, [urlAdded]);

  React.useEffect(() => {
    if (!urlDuplicate) return;
    const t = setTimeout(() => setUrlDuplicate(false), 2000);
    return () => clearTimeout(t);
  }, [urlDuplicate]);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function uploadImages(selected: File[]) {
    if (!selected.length) return [];

    const urls: string[] = [];
    for (const file of selected) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Nur JPG, PNG oder WebP Bilder sind erlaubt.");
      }
      if (file.size > 10_000_000) {
        throw new Error("Bild ist zu groß (max. 10MB).");
      }

      const presignRes = await fetch(`${apiBase}/uploads/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          kind: "activity",
          contentType: file.type,
        }),
      });
      const presign = await presignRes.json().catch(() => null);
      if (!presignRes.ok || !presign?.uploadUrl || !presign?.uploadFiles) {
        const msg =
          (Array.isArray(presign?.message)
            ? presign.message.join(", ")
            : presign?.message) || "Upload vorbereiten fehlgeschlagen.";
        throw new Error(msg);
      }

      const fd = new FormData();
      for (const [k, v] of Object.entries(presign.uploadFiles)) {
        fd.append(k, String(v));
      }
      fd.append("file", file);

      const uploadRes = await fetch(presign.uploadUrl, {
        method: "POST",
        body: fd,
      });
      if (!uploadRes.ok) {
        throw new Error("Bild-Upload fehlgeschlagen.");
      }

      if (presign.assetUrl) urls.push(String(presign.assetUrl));
    }

    return urls;
  }

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

    if (urlInput.trim()) {
      const value = urlInput.trim();
      if (!isHttpUrl(value)) {
        return setError("Bitte eine gültige http(s) URL eingeben.");
      }
      if (files.length + manualUrls.length >= 5) {
        return setError("Maximal 5 Bilder insgesamt erlaubt.");
      }
      setManualUrls((prev) => {
        if (prev.includes(value)) {
          setUrlDuplicate(true);
          return prev;
        }
        setUrlAdded(true);
        return [...prev, value];
      });
      setUrlInput("");
    }

    if (files.length + manualUrls.length > 5) {
      return setError("Maximal 5 Bilder insgesamt erlaubt.");
    }

    setSaving(true);
    try {
      const imageUrls = await uploadImages(files);
      const allUrls = [...manualUrls, ...imageUrls];
      const startAtIso = startAt ? new Date(startAt).toISOString() : undefined;
      const res = await fetch(`${apiBase}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          category,
          plz: plz.trim(),
          description: description.trim() || undefined,
          startAt: startAtIso,
          imageUrls: allUrls.length ? allUrls : undefined,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
      <h1 className="text-lg font-semibold text-center">
        Erstelle eine neue Aktivität
      </h1>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Spaziergang im Park"
          />
          <div className="mt-1 text-right text-xs text-hunter">
            {title.length}/120
          </div>
        </div>

        <div>
          <Label htmlFor="category">Kategorie *</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Bitte wählen</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {formatActivityCategory(c)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="plz">PLZ *</Label>
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
          <div className="mt-1 text-right text-xs text-hunter">
            {description.length}/2000
          </div>
        </div>

        <div>
          <Label htmlFor="startAt">Startzeit (optional)</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="images">Bilder (optional)</Label>
          <Input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              const maxFiles = Math.max(0, 5 - manualUrls.length);
              if (list.length > maxFiles) {
                setError("Maximal 5 Bilder insgesamt erlaubt.");
                setFiles(list.slice(0, maxFiles));
                return;
              }
              setFiles(list);
            }}
          />
          {files.length ? (
            <p className="mt-1 text-xs text-hunter">
              {files.length} Bild{files.length === 1 ? "" : "er"} ausgewählt
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="imageUrl">Bild-URL (optional)</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="imageUrl"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = urlInput.trim();
                  if (!value) return;
                  if (!isHttpUrl(value)) {
                    setError("Bitte eine gültige http(s) URL eingeben.");
                    return;
                  }
                  if (files.length + manualUrls.length >= 5) {
                    setError("Maximal 5 Bilder insgesamt erlaubt.");
                    return;
                  }
                  setManualUrls((prev) => {
                    if (prev.includes(value)) {
                      setUrlDuplicate(true);
                      return prev;
                    }
                    setUrlAdded(true);
                    return [...prev, value];
                  });
                  setUrlInput("");
                }
              }}
              onBlur={() => {
                const value = urlInput.trim();
                if (!value) return;
                if (!isHttpUrl(value)) {
                  setError("Bitte eine gültige http(s) URL eingeben.");
                  return;
                }
                if (files.length + manualUrls.length >= 5) {
                  setError("Maximal 5 Bilder insgesamt erlaubt.");
                  return;
                }
                setManualUrls((prev) => {
                  if (prev.includes(value)) {
                    setUrlDuplicate(true);
                    return prev;
                  }
                  setUrlAdded(true);
                  return [...prev, value];
                });
                setUrlInput("");
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="text-xs px-2 py-1"
              onClick={() => {
                const value = urlInput.trim();
                if (!value) return;
                if (!isHttpUrl(value)) {
                  setError("Bitte eine gültige http(s) URL eingeben.");
                  return;
                }
                if (files.length + manualUrls.length >= 5) {
                  setError("Maximal 5 Bilder insgesamt erlaubt.");
                  return;
                }
                setManualUrls((prev) => {
                  if (prev.includes(value)) {
                    setUrlDuplicate(true);
                    return prev;
                  }
                  setUrlAdded(true);
                  return [...prev, value];
                });
                setUrlInput("");
              }}
            >
              + weiteres Bild
            </Button>
          </div>
          {urlAdded ? (
            <p className="text-xs text-hunter">URL hinzugefügt.</p>
          ) : null}
          {urlDuplicate ? (
            <p className="text-xs text-red-600">
              Wurde nicht hinzugefügt, es handelt sich um ein Duplikat.
            </p>
          ) : null}
          {manualUrls.length ? (
            <div className="mt-2 space-y-1 text-xs text-hunter">
              {manualUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} className="flex items-center gap-2">
                  <span className="truncate">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs underline px-0 py-0"
                    onClick={() =>
                      setManualUrls((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Entfernen
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={saving}>
          {saving ? "Speichern…" : "Erstellen"}
        </Button>
      </form>
    </section>
  );
}
