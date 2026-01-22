import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { ActivityDetail, ActivityImage } from "@/lib/api/types";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${apiBase}/activities/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (!res.ok) notFound();
  const a = (await res.json()) as ActivityDetail;
  const images: ActivityImage[] = Array.isArray(a?.images) ? a.images : [];
  const heroUrl = a?.thumbnailUrl ?? images[0]?.url;

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href="/homepage"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>

        <section className="mt-4 rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold">{a?.title ?? "Aktivität"}</h1>

          {heroUrl ? (
            <img
              src={heroUrl}
              alt={images?.[0]?.alt ?? a?.title ?? "Aktivität"}
              className="mt-3 h-56 w-full rounded-md border-2 border-fern bg-surface object-cover"
              loading="lazy"
            />
          ) : null}

          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.slice(0, 6).map((img, idx: number) => (
                <img
                  key={img?.url ?? idx}
                  src={img?.url}
                  alt={img?.alt ?? a?.title ?? "Aktivität"}
                  className="h-20 w-full rounded-md border-2 border-fern bg-surface object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          <div className="mt-3 rounded-md border-2 border-fern bg-surface p-3 text-sm space-y-1">
            <div>
              <b>Kategorie:</b> {a?.category ?? "—"}
            </div>
            <div>
              <b>PLZ:</b> {a?.plz ?? "—"}
            </div>
            <div>
              <b>Start:</b> {formatDate(a?.startAt ?? a?.scheduledAt)}
            </div>
            <div>
              <b>Updated:</b> {formatDate(a?.updatedAt)}
            </div>
          </div>

          {a?.description && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-1">Beschreibung</div>
              <div className="rounded-md border-2 border-fern bg-surface p-3 text-sm">
                {a.description}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
