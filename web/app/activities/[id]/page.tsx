import Link from "next/link";
import { notFound } from "next/navigation";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type ActivityImage = {
  url: string;
  sortOrder: number;
  alt?: string;
};

type UserSummary = {
  id: string;
  displayName: string;
};

type ActivityDetail = {
  // id kommt vom Backend, aber du willst es nicht anzeigen
  id: string;

  title: string;
  description?: string;

  category: string;
  status: string;

  plz: string;

  // Prisma: scheduledAt, dein UI/API: teils startAt
  scheduledAt?: string;
  startAt?: string;

  createdById: string;
  createdBy: UserSummary;

  createdAt: string;
  updatedAt: string;

  images: ActivityImage[];
  thumbnailUrl?: string | null;
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(d);
}

async function fetchActivity(id: string): Promise<ActivityDetail> {
  const res = await fetch(`${apiBase}/activities/${encodeURIComponent(id)}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Activity fetch failed (HTTP ${res.status})`);

  return (await res.json()) as ActivityDetail;
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  let a: ActivityDetail;
  try {
    a = await fetchActivity(id);
  } catch (e) {
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

            <Link
              href="/homepage"
              className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
            >
              Zurück
            </Link>
          </div>
        </header>

        <main className="px-4">
          <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl lg:max-w-3xl sm:pt-10">
            <section className="rounded-md bg-limecream border-2 border-fern shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <h1 className="text-base sm:text-lg font-semibold">
                  Aktivität konnte nicht geladen werden
                </h1>
                <p className="mt-2 text-sm text-hunter">
                  {e instanceof Error ? e.message : "Unbekannter Fehler"}
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const images = Array.isArray(a.images) ? a.images : [];
  const cover =
    a.thumbnailUrl ??
    (images.length > 0
      ? images.slice().sort((x, y) => x.sortOrder - y.sortOrder)[0].url
      : null);

  const start = a.scheduledAt ?? a.startAt; // kompatibel zu beiden Backends

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

          <Link
            href="/homepage"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
          >
            Zurück
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl lg:max-w-3xl sm:pt-10">
          <section className="rounded-md bg-limecream border-2 border-fern shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* Cover */}
              {cover ? (
                <img
                  src={cover}
                  alt={a.title}
                  className="h-52 w-full rounded-md border-2 border-fern object-cover bg-white"
                />
              ) : (
                <div className="h-52 w-full rounded-md border-2 border-fern bg-white" />
              )}

              {/* Title + Badges */}
              <div className="mt-4 flex items-start justify-between gap-3">
                <h1 className="text-lg sm:text-xl font-semibold leading-snug">
                  {a.title}
                </h1>

                <div className="flex flex-col gap-2 items-end">
                  <span className="shrink-0 rounded border-2 border-fern bg-white px-2 py-1 text-[11px]">
                    {a.category}
                  </span>
                </div>
              </div>

              {/* Model-Felder (alles aus Activity außer id) */}
              <div className="mt-4 rounded-md border-2 border-fern bg-white p-3 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="font-medium text-evergreen">Start:</span>{" "}
                    <span className="text-hunter">{formatDate(start)}</span>
                  </div>

                  <div>
                    <span className="font-medium text-evergreen">PLZ:</span>{" "}
                    <span className="text-hunter">{a.plz}</span>
                  </div>

                  <div>
                    <span className="font-medium text-evergreen">Von:</span>{" "}
                    <span className="text-hunter">
                      {a.createdBy?.displayName || "Neighbor"}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-evergreen">
                      Erstellt:
                    </span>{" "}
                    <span className="text-hunter">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-evergreen">
                      Aktualisiert:
                    </span>{" "}
                    <span className="text-hunter">
                      {formatDate(a.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {a.description?.trim() && (
                <div className="mt-4">
                  <div className="block text-sm font-medium mb-2">
                    Beschreibung
                  </div>
                  <div className="rounded-md border-2 border-fern bg-white p-3 text-sm leading-relaxed">
                    {a.description}
                  </div>
                </div>
              )}

              {/* Gallery (images relation) */}
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Bilder</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {images
                      .slice()
                      .sort((x, y) => x.sortOrder - y.sortOrder)
                      .map((img) => (
                        <img
                          key={`${img.url}-${img.sortOrder}`}
                          src={img.url}
                          alt={img.alt || a.title}
                          className="h-28 w-full rounded-md border-2 border-fern object-cover bg-white"
                          loading="lazy"
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/homepage"
                  className="rounded-md border-2 border-fern bg-white px-4 py-2 text-sm font-medium hover:bg-limecream transition-colors"
                >
                  Zurück zum Feed
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
