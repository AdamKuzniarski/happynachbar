"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateActivity, uploadActivityImages } from "@/lib/api/activities";
import type { ActivityDetail } from "@/lib/api/types";
import { toDateTimeLocal } from "@/lib/format";
import { ActivityFormFields } from "@/app/activities/_components/ActivityFormFields";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import {
  getManualUrlAddResult,
  MANUAL_URL_STATUS_MESSAGES,
  isValidPostalCode,
} from "@/lib/validators";
import type { ManualUrlAddStatus } from "@/lib/api/types";

export function EditActivityForm({ activity }: { activity: ActivityDetail }) {
  const router = useRouter();

  const [title, setTitle] = React.useState(activity.title ?? "");
  const [category, setCategory] = React.useState(activity.category ?? "");
  const [plz, setPlz] = React.useState(activity.plz ?? "");
  const [description, setDescription] = React.useState(
    activity.description ?? "",
  );
  const [startAt, setStartAt] = React.useState(
    toDateTimeLocal(activity.startAt ?? activity.scheduledAt),
  );
  const [files, setFiles] = React.useState<File[]>([]);
  const [imageUrls, setImageUrls] = React.useState<string[]>(
    Array.isArray(activity.images) ? activity.images.map((img) => img.url) : [],
  );
  const [urlInput, setUrlInput] = React.useState("");
  const [urlStatus, setUrlStatus] = React.useState<
    "added" | "duplicate" | null
  >(null);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!urlStatus) return;
    const t = setTimeout(() => setUrlStatus(null), 2000);
    return () => clearTimeout(t);
  }, [urlStatus]);

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
      setImageUrls((prev) => [...prev, value]);
      setUrlInput("");
      setUrlStatus("added");
    }
    return true;
  }

  function tryAddUrl(rawValue: string) {
    const { status, value } = getManualUrlAddResult(
      rawValue,
      imageUrls,
      5,
      files.length,
    );
    return applyManualUrlResult(status, value);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);

    if (title.trim().length < 3)
      return setError("Titel muss mindestens 3 Zeichen haben.");
    if (!category) return setError("Bitte Kategorie auswählen.");
    if (!isValidPostalCode(plz))
      return setError("PLZ muss genau 5 Ziffern sein.");

    if (!tryAddUrl(urlInput)) return;
    if (files.length + imageUrls.length > 5) {
      return setError("Maximal 5 Bilder insgesamt erlaubt.");
    }

    setSaving(true);
    try {
      const startAtIso = startAt ? new Date(startAt).toISOString() : undefined;
      const uploadedUrls = await uploadActivityImages(files);
      const allImageUrls = [...imageUrls, ...uploadedUrls].filter(Boolean);
      const result = await updateActivity(activity.id, {
        title: title.trim(),
        category,
        plz: plz.trim(),
        description: description.trim() || undefined,
        startAt: startAtIso,
        imageUrls: allImageUrls.length ? allImageUrls : undefined,
      });
      if (!result.ok) {
        const msg = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message ?? "Fehler beim Speichern.";
        setError(msg);
        return;
      }
      router.push(`/activities/${encodeURIComponent(activity.id)}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
      <h1 className="text-lg font-semibold text-center">Aktivität bearbeiten</h1>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <ActivityFormFields
          title={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          plz={plz}
          setPlz={setPlz}
          description={description}
          setDescription={setDescription}
          startAt={startAt}
          setStartAt={setStartAt}
        />

        <div>
          <Label htmlFor="images">Bilder (optional)</Label>
          <Input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []);
              const maxFiles = Math.max(0, 5 - imageUrls.length);
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
          {imageUrls.length ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imageUrls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative rounded-md border-2 border-fern bg-surface"
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex == null || dragIndex === idx) return;
                    setImageUrls((prev) => {
                      const next = [...prev];
                      const [moved] = next.splice(dragIndex, 1);
                      next.splice(idx, 0, moved);
                      return next;
                    });
                    setDragIndex(null);
                  }}
                >
                  <img
                    src={url}
                    alt="Aktivitaetsbild"
                    className="h-20 w-full rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="absolute right-1 top-1 px-2 py-1 text-[10px] leading-none"
                    onClick={() =>
                      setImageUrls((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    Entfernen
                  </Button>
                </div>
              ))}
            </div>
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
                  tryAddUrl(urlInput);
                }
              }}
              onBlur={() => {
                tryAddUrl(urlInput);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="text-xs px-2 py-1"
              onClick={() => {
                tryAddUrl(urlInput);
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
          <p className="mt-2 text-xs text-hunter">
            Bilder kannst du per Drag & Drop neu anordnen.
          </p>
        </div>

        <FormError message={error} />

        <div className="flex justify-center gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/activities/${encodeURIComponent(activity.id)}`)}
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </section>
  );
}
