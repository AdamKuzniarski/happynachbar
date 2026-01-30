import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type PublicProfile = {
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  plz?: string | null;
  createdAt?: string | null;
};

function getInitials(name?: string | null) {
  if (!name) return "N";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "N";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default async function ActivityCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(
    `${apiBase}/public/users/by-activity/${encodeURIComponent(id)}`,
    { cache: "no-store" },
  );

  if (!res.ok) notFound();
  const profile = (await res.json()) as PublicProfile;

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href={`/activities/${encodeURIComponent(id)}`}
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>

        <section className="mt-4 rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold text-center">Profil</h1>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-fern bg-surface-strong text-2xl font-semibold text-foreground">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.displayName} Avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {getInitials(profile.displayName)}
                </div>
              )}
            </div>
            <div className="mt-3 text-base font-semibold">
              {profile.displayName || "Neighbor"}
            </div>
          </div>

          <div className="mt-6 rounded-md border-2 border-fern bg-surface p-3 text-sm">
            <dl className="space-y-2">
              <div>
                <dt className="text-xs opacity-80">Bio</dt>
                <dd className="text-sm text-foreground">
                  {profile.bio?.trim() || "Noch keine Bio hinterlegt."}
                </dd>
              </div>
              <div>
                <dt className="text-xs opacity-80">PLZ</dt>
                <dd className="text-sm font-medium text-foreground">
                  {profile.plz?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs opacity-80">Mitglied seit</dt>
                <dd className="text-sm text-foreground">
                  {profile.createdAt ? formatDate(profile.createdAt) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-md border-2 border-fern bg-surface px-4 py-1.5 text-sm font-semibold text-foreground opacity-60"
              title="Demnächst verfügbar"
            >
              Kontaktieren
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
