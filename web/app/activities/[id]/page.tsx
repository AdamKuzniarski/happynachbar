import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { ActivityDetail } from "@/lib/api/types";
import { ActivityImageGallery } from "./_components/ActivityImageGallery";
import { formatActivityCategory } from "@/lib/api/enums";
import { ActivityActions } from "./_components/ActivityActions";
import { Mail, User } from "lucide-react";

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
  const images = Array.isArray(a?.images) ? a.images : [];
  const cookieStore = await cookies();
  const token = cookieStore.get("happynachbar_token")?.value;
  let currentUserId: string | undefined;
  if (token) {
    try {
      const meRes = await fetch(`${apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (meRes.ok) {
        const me = (await meRes.json()) as { id?: string };
        currentUserId = me?.id;
      }
    } catch {
    }
  }

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href="/homepage"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>

        <section className="mt-4 overflow-hidden rounded-2xl bg-surface/60 shadow-sm ring-1 ring-fern/25">
          <header className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-center sm:text-left">
                  {a?.title ?? "Aktivität"}
                </h1>

                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center rounded-full bg-fern/15 px-3 py-1 text-xs font-semibold ring-1 ring-fern/30">
                    {formatActivityCategory(a?.category)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-fern/15 px-3 py-1 text-xs font-semibold ring-1 ring-fern/30">
                    PLZ {a?.plz ?? "—"}
                  </span>
                </div>
              </div>

            </div>
          </header>

          <div className="px-0">
            <ActivityImageGallery
              title={a?.title ?? "Aktivität"}
              thumbnailUrl={a?.thumbnailUrl}
              images={images}
            />
          </div>

          <div className="px-5 py-5">
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="opacity-80">Erstellt von</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium">
                  <span>
                    {a?.createdBy?.displayName?.trim() || "Neighbor"}
                  </span>
                  <Link
                    href={`/activities/${encodeURIComponent(a.id)}/creator`}
                    aria-label="Zum Profil"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-fern/50 text-foreground/80 hover:bg-fern/10 hover:text-foreground"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    disabled
                    aria-label="Kontaktieren (demnächst)"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-fern/50 text-foreground/50"
                    title="Demnächst verfügbar"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </button>
                </dd>
              </div>
              <div>
                <dt className="opacity-80">Start</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(a?.startAt ?? a?.scheduledAt)}
                </dd>
              </div>
              <div>
                <dt className="opacity-80">Aktualisiert</dt>

                <dd className="mt-1 font-medium">{formatDate(a?.updatedAt)}</dd>
              </div>
            </dl>

            {a?.description ? (
              <div className="mt-5">
                <div className="text-sm font-semibold">Beschreibung</div>
                <p className="mt-2 rounded-xl bg-fern/10 p-4 text-sm ring-1 ring-fern/20 break-words">
                  {a.description}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              <ActivityActions
                id={a.id}
                createdById={a.createdById}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
