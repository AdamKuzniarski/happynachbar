"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_CATEGORIES, formatActivityCategory } from "@/lib/api/enums";
import { createActivity, uploadActivityImages } from "@/lib/api/activities";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import {
  isValidPostalCode,
  normalizePostalCode,
  getManualUrlAddResult,
  MANUAL_URL_STATUS_MESSAGES,
} from "@/lib/validators";
import type { ManualUrlAddStatus } from "@/lib/api/types";

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
  const [urlStatus, setUrlStatus] = React.useState<"added" | "duplicate" | null>(
    null,
  );

  function applyManualUrlResult(status: ManualUrlAddStatus, value?: string) {
    if (status === "invalid" || status === "limit") {
      setError(MANUAL_URL_STATUS_MESSAGES[status]);
      return false;
    }
    if (status === "duplicate") {
      setUrlStatus("duplicate");
      return false;
    }
    if (status === "added" && value) {
      setManualUrls((prev) => [...prev, value]);
      setUrlInput("");
      setUrlStatus("added");
    }
    return true;
  }

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!urlStatus) return;
    const t = setTimeout(() => setUrlStatus(null), 2000);
    return () => clearTimeout(t);
  }, [urlStatus]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    setError(null);

    //checks
    if (title.trim().length < 3)
      return setError("Titel muss mindestens 3 Zeichen haben.");
    if (!category) return setError("Bitte Kategorie auswählen.");
    if (!isValidPostalCode(plz))
      return setError("PLZ muss genau 5 Ziffern sein.");

    {
      const { status, value } = getManualUrlAddResult(
        urlInput,
        manualUrls,
        5,
        files.length,
      );
      if (!applyManualUrlResult(status, value)) return;
    }

    if (files.length + manualUrls.length > 5) {
      return setError("Maximal 5 Bilder insgesamt erlaubt.");
    }

    setSaving(true);
    try {
      const imageUrls = await uploadActivityImages(files);
      const allUrls = [...manualUrls, ...imageUrls];
      const startAtIso = startAt ? new Date(startAt).toISOString() : undefined;
      const result = await createActivity({
        title: title.trim(),
        category,
        plz: plz.trim(),
        description: description.trim() || undefined,
        startAt: startAtIso,
        imageUrls: allUrls.length ? allUrls : undefined,
      });
      if (!result.ok) {
        const msg = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message ?? "Fehler beim Erstellen.";
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
            onChange={(e) => setPlz(normalizePostalCode(e.target.value))}
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
                  const { status, value } = getManualUrlAddResult(
                    urlInput,
                    manualUrls,
                    5,
                    files.length,
                  );
                  applyManualUrlResult(status, value);
                }
              }}
              onBlur={() => {
                const { status, value } = getManualUrlAddResult(
                  urlInput,
                  manualUrls,
                  5,
                  files.length,
                );
                applyManualUrlResult(status, value);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="text-xs px-2 py-1"
              onClick={() => {
                const { status, value } = getManualUrlAddResult(
                  urlInput,
                  manualUrls,
                  5,
                  files.length,
                );
                applyManualUrlResult(status, value);
              }}
            >
              + weiteres Bild
            </Button>
          </div>
          {urlStatus === "added" ? (
            <p className="text-xs text-hunter">
              {MANUAL_URL_STATUS_MESSAGES.added}
            </p>
          ) : null}
          {urlStatus === "duplicate" ? (
            <p className="text-xs text-red-600">
              {MANUAL_URL_STATUS_MESSAGES.duplicate}
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
