import Link from "next/link";
import { cookies } from "next/headers";
import { formatDate } from "@/lib/format";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type UserProfile = {
  displayName?: string | null;
  plz?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

type UserMeResponse = {
  id: string;
  email: string;
  createdAt?: string;
  profile: UserProfile | null;
  profileCompletion?: {
    isComplete: boolean;
    percent: number;
    missing: string[];
  };
};

function getInitials(name?: string | null) {
  if (!name) return "N";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "N";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("happynachbar_token")?.value;
  let me: UserMeResponse | null = null;
  let error: string | null = null;

  if (!token) {
    error = "Bitte logge dich ein, um dein Profil zu sehen.";
  } else {
    try {
      const res = await fetch(`${apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        error = "Profil konnte nicht geladen werden.";
      } else {
        me = (await res.json()) as UserMeResponse;
      }
    } catch {
      error = "Profil konnte nicht geladen werden.";
    }
  }

  const profile = me?.profile ?? null;
  const displayName = profile?.displayName?.trim() || "Neighbor";
  const avatarUrl = profile?.avatarUrl?.trim() || "";
  const plz = profile?.plz?.trim() || "—";
  const bio = profile?.bio?.trim() || "Noch keine Bio hinterlegt.";
  const completion = me?.profileCompletion;
  const completionPercent = Math.max(
    0,
    Math.min(100, completion?.percent ?? 0),
  );
  const joinedAt = me?.createdAt ? formatDate(me.createdAt) : "—";

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <h1 className="text-xl font-semibold sm:text-2xl">Dein Profil</h1>

        {error ? (
          <section className="mt-4 rounded-md border-2 border-fern bg-surface p-4 text-sm">
            <p>{error}</p>
            <Link
              href="/auth/login"
              className="mt-3 inline-flex text-sm font-semibold underline"
            >
              Zum Login
            </Link>
          </section>
        ) : (
          <section className="mt-4 grid gap-4 sm:grid-cols-[200px,1fr]">
            <div className="rounded-md border-2 border-fern bg-surface p-4 flex flex-col items-center text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-fern bg-surface-strong text-3xl font-semibold text-foreground">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={`${displayName} Avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>
              <div className="mt-3 text-base font-semibold">{displayName}</div>
              <div className="text-xs text-hunter">{me?.email ?? ""}</div>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border-2 border-fern bg-surface p-4">
                <div className="text-sm font-semibold">Profilstatus</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full bg-fern"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-hunter">
                  {completion?.isComplete
                    ? "Profil vollständig"
                    : `Profil zu ${completionPercent}% vollständig`}
                </div>
                {completion?.missing?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {completion.missing.map((field) => (
                      <span
                        key={field}
                        className="rounded-full border border-fern px-2 py-0.5"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-md border-2 border-fern bg-surface p-4 text-sm">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs uppercase text-hunter">Displayname</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {displayName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-hunter">PLZ</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {plz}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-hunter">Bio</dt>
                    <dd className="text-sm text-foreground">{bio}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-hunter">
                      Mitglied seit
                    </dt>
                    <dd className="text-sm text-foreground">{joinedAt}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
