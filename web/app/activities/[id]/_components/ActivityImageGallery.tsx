"use client";

import * as React from "react";
import type { ActivityImage } from "@/lib/api/types";

type GalleryImage = {
  url: string;
  alt?: string;
};

type ActivityImageGalleryProps = {
  title: string;
  thumbnailUrl?: string | null;
  images?: ActivityImage[];
};

function uniqueByUrl(images: GalleryImage[]) {
  const seen = new Set<string>();
  const out: GalleryImage[] = [];
  for (const img of images) {
    if (!img.url || seen.has(img.url)) continue;
    seen.add(img.url);
    out.push(img);
  }
  return out;
}

export function ActivityImageGallery({
  title,
  thumbnailUrl,
  images,
}: ActivityImageGalleryProps) {
  const normalizedImages: GalleryImage[] = uniqueByUrl([
    ...(thumbnailUrl ? [{ url: thumbnailUrl, alt: title }] : []),
    ...(images ?? []).map((img) => ({ url: img.url, alt: img.alt ?? title })),
  ]);

  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (normalizedImages.length === 0) return null;

  const hero = normalizedImages[0];
  const rest = normalizedImages.slice(1, 7);
  const active = normalizedImages[activeIndex] ?? hero;
  const maxIndex = normalizedImages.length - 1;
  const hasMultiple = normalizedImages.length > 1;
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= maxIndex;

  function goNext() {
    setActiveIndex((idx) => Math.min(idx + 1, maxIndex));
  }

  function goPrev() {
    setActiveIndex((idx) => Math.max(idx - 1, 0));
  }

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
              if (e.key === "ArrowRight") {
                if (isLast) return;
                goNext();
                return;
              }
              if (e.key === "ArrowLeft") {
                if (isFirst) return;
                goPrev();
              }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, maxIndex]);

  return (
    <>
      <button
        type="button"
        className="mt-3 block w-full"
        onClick={() => {
          setActiveIndex(0);
          setOpen(true);
        }}
        aria-label="Bild vergroessern"
      >
        <img
          src={hero.url}
          alt={hero.alt ?? title}
          className="h-56 w-full rounded-md border-2 border-fern bg-surface object-cover"
          loading="lazy"
        />
      </button>

      {rest.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {rest.map((img, idx) => (
            <button
              key={img.url}
              type="button"
              onClick={() => {
                setActiveIndex(idx + 1);
                setOpen(true);
              }}
              aria-label="Bild vergroessern"
            >
              <img
                src={img.url}
                alt={img.alt ?? title}
                className="h-20 w-full rounded-md border-2 border-fern bg-surface object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-0 rounded-full bg-foreground/90 px-3 py-1 text-sm font-medium text-background"
              onClick={() => setOpen(false)}
            >
              Schliessen
            </button>
            {hasMultiple ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-foreground/90 px-3 py-2 text-sm font-medium text-background disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={goPrev}
                  disabled={isFirst}
                  aria-label="Vorheriges Bild"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-foreground/90 px-3 py-2 text-sm font-medium text-background disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={goNext}
                  disabled={isLast}
                  aria-label="Naechstes Bild"
                >
                  →
                </button>
              </>
            ) : null}
            <img
              src={active.url}
              alt={active.alt ?? title}
              className="max-h-[80vh] w-full rounded-md border-2 border-fern bg-surface object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
