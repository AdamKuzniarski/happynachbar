import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { ActivityDetail } from "@/lib/api/types";
import { ActivityImageGallery } from "./_components/ActivityImageGallery";
import { formatActivityCategory } from "@/lib/api/enums";
import { ActivityActions } from "./_components/ActivityActions";

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
      // ignore
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

        <section className="mt-4 rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold text-center">
            {a?.title ?? "Aktivität"}
          </h1>

          <ActivityImageGallery
            title={a?.title ?? "Aktivität"}
            thumbnailUrl={a?.thumbnailUrl}
            images={images}
          />

          <div className="mt-3 rounded-md border-2 border-fern bg-surface p-3 text-sm space-y-1">
            <div>
              <b>Kategorie:</b> {formatActivityCategory(a?.category)}
            </div>
            <div>
              <b>PLZ:</b> {a?.plz ?? "—"}
            </div>
            <div>
              <b>Erstellt von:</b>{" "}
              {a?.createdBy?.displayName?.trim() || "Neighbor"}
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
              <div className="rounded-md border-2 border-fern bg-surface p-3 text-sm break-words">
                {a.description}
              </div>
            </div>
          )}

          <ActivityActions
            id={a.id}
            createdById={a.createdById}
            currentUserId={currentUserId}
          />
        </section>
      </div>
    </main>
  );
}
