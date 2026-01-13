"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const CREATE_ACTIVITY_ROUTE = "/create-activity";
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TAKE = 10;

type Activity = {
  id: string;
  title: string;
  category: string;
  startAt?: string;
  plz?: string;
  thumbnailUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id?: string;
    displayName?: string;
  };
};

type ListActivitiesResponse = {
  items: Activity[];
  nextCursor: string | null;
};

// Formats an ISO date string into a human-friendly German date/time in the Europe/Berlin timezone.
// Returns "—" if no value is provided, and falls back to the original string if the date is invalid.
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

function buildQuery(params: {
  take?: number;
  cursor?: string | null;
  q?: string;
  plz?: string;
  category?: string;
  createdById?: string;
  startFrom?: string;
  startTo?: string;
}) {
  const sp = new URLSearchParams();
  sp.set("take", String(params.take ?? TAKE));

  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.plz?.trim()) sp.set("plz", params.plz.trim());
  if (params.category) sp.set("category", params.category);

  if (params.createdById) sp.set("createdById", params.createdById);
  if (params.startFrom) sp.set("startFrom", params.startFrom);
  if (params.startTo) sp.set("startTo", params.startTo);

  return sp.toString();
}

export default function HomepagePage() {
  const router = useRouter();

  // Filter UI (category value = API Enum; "" = alle)
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("");
  const [plz, setPlz] = React.useState("");

  // Data + pagination
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  // UI states
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  // Abort ongoing fetch when a new one starts (prevents race conditions)
  const abortRef = React.useRef<AbortController | null>(null);

  async function fetchActivities(params: {
    cursor?: string | null;
    reset: boolean;
  }) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const qs = buildQuery({
      take: TAKE,
      cursor: params.cursor ?? null,
      q: query,
      plz,
      category: category || undefined,
    });

    const res = await fetch(`${apiBase}/activities?${qs}`, {
      cache: "no-store",
      credentials: "include",
      signal: ac.signal,
    });

    if (!res.ok)
      throw new Error(`Activities fetch failed (HTTP ${res.status})`);

    const payload = (await res.json()) as ListActivitiesResponse;

    if (params.reset) {
      setActivities(payload.items ?? []);
    } else {
      setActivities((prev) => [...prev, ...(payload.items ?? [])]);
    }
    setNextCursor(payload.nextCursor ?? null);
  }

  async function loadFirstPage() {
    setLoading(true);
    setError(null);
    try {
      setNextCursor(null);
      await fetchActivities({ reset: true, cursor: null });
    } catch (e) {
      if ((e as any)?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unknown error");
      setActivities([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      // do NOT abort the main list load if we're loading more
      // (but still abort any prior "load more" call)
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const qs = buildQuery({
        take: TAKE,
        cursor: nextCursor,
        q: query,
        plz,
        category: category || undefined,
      });

      const res = await fetch(`${apiBase}/activities?${qs}`, {
        cache: "no-store",
        credentials: "include",
        signal: ac.signal,
      });

      if (!res.ok)
        throw new Error(`Activities fetch failed (HTTP ${res.status})`);

      const payload = (await res.json()) as ListActivitiesResponse;

      setActivities((prev) => [...prev, ...(payload.items ?? [])]);
      setNextCursor(payload.nextCursor ?? null);
    } catch (e) {
      if ((e as any)?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoadingMore(false);
    }
  }

  React.useEffect(() => {
    loadFirstPage();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadFirstPage(); // reset + refetch with current filters
  }

  async function handleCreateActivity() {
    setCreating(true);
    try {
      router.push(CREATE_ACTIVITY_ROUTE);
    } finally {
      setCreating(false);
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
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
          <section className="mx-auto w-full max-w-md">
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-center block">
                    Kategorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md px-3 text-sm border-2 border-fern bg-white focus:outline-none focus:ring-2 focus:ring-palm/40"
                  >
                    <option value="">Alle Kategorien</option>
                    <option value="OUTDOOR">Outdoor</option>
                    <option value="SPORT">Sport</option>
                    <option value="SOCIAL">Social</option>
                    <option value="INDOOR">Indoor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-center block">
                    PLZ
                  </label>
                  <input
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    placeholder="z.B. 10115"
                    className="mt-1 h-10 w-full rounded-md px-3 text-sm border-2 border-fern bg-white focus:outline-none focus:ring-2 focus:ring-palm/40"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Aktivität suchen…"
                  className="h-10 w-full rounded-md px-3 text-sm border-2 border-fern bg-white focus:outline-none focus:ring-2 focus:ring-palm/40"
                />
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-md border-2 border-fern bg-palm px-4 text-xs font-medium text-white hover:bg-hunter transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "…" : "Suchen"}
                </button>
              </div>
            </form>
          </section>

          <section className="mx-auto mt-6 w-full max-w-md">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-evergreen">
                Aktivitäten
              </h2>
              <span className="text-xs text-hunter">
                {loading ? "Lade…" : `${activities.length} Vorschläge`}
              </span>
            </div>

            {error && (
              <div className="mt-3 rounded-md border-2 border-fern bg-limecream p-3 text-sm">
                Fehler beim Laden: {error}
              </div>
            )}

            {!loading && !error && activities.length === 0 && (
              <div className="mt-3 rounded-md border-2 border-fern bg-white p-3 text-sm">
                Keine Aktivitäten gefunden.
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {!loading &&
                activities.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-md border-2 border-fern bg-limecream overflow-hidden"
                  >
                    {a.thumbnailUrl ? (
                      <img
                        src={a.thumbnailUrl}
                        alt={a.title ?? "Activity"}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold leading-snug">
                          {a.title ?? "—"}
                        </div>
                        <span className="text-[11px] rounded border border-fern px-2 py-1 bg-white">
                          {a.category ?? "—"}
                        </span>
                      </div>

                      <div className="mt-2 text-[12px] leading-relaxed">
                        <div>
                          <span className="font-medium">Start:</span>{" "}
                          {formatDate(a.startAt)}
                        </div>
                        <div>
                          <span className="font-medium">PLZ:</span>{" "}
                          {a.plz ?? "—"}
                        </div>
                        <div>
                          <span className="font-medium">Created by:</span>{" "}
                          {a.createdBy?.displayName ?? "—"}{" "}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(a.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>{" "}
                          {formatDate(a.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              <button
                type="button"
                onClick={handleCreateActivity}
                disabled={creating}
                className="min-h-[96px] rounded-md border-2 border-fern bg-white p-3 hover:bg-limecream transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Neue Aktivität erstellen"
                title="Neue Aktivität erstellen"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="text-4xl font-bold leading-none text-evergreen">
                    {creating ? "…" : "+"}
                  </div>
                  <div className="mt-1 text-xs font-medium text-hunter">
                    Neu
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={!nextCursor || loadingMore || loading}
                className="rounded-md border-2 border-fern bg-white px-4 py-2 text-xs font-medium text-evergreen hover:bg-limecream transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMore
                  ? "Lade mehr…"
                  : nextCursor
                  ? "Mehr laden"
                  : "Keine weiteren"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
