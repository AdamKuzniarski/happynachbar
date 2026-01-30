import Link from "next/link";
import { cookies } from "next/headers";
import { ProfileEditForm } from "./_components/ProfileEditForm";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

type UserMeResponse = {
  profile: {
    displayName?: string | null;
    plz?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
};

export default async function ProfileEditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("happynachbar_token")?.value;

  let error: string | null = null;
  let profile: UserMeResponse["profile"] = null;

  if (!token) {
    error = "Bitte logge dich ein, um dein Profil zu bearbeiten.";
  } else {
    try {
      const res = await fetch(`${apiBase}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        error = "Profil konnte nicht geladen werden.";
      } else {
        const me = (await res.json()) as UserMeResponse;
        profile = me?.profile ?? null;
      }
    } catch {
      error = "Profil konnte nicht geladen werden.";
    }
  }

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href="/profile"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>

        <section className="mt-4 rounded-md border-2 border-fern bg-surface p-4 shadow-sm sm:p-6">
          <h1 className="text-lg font-semibold text-center">
            Profil bearbeiten
          </h1>

          {error ? (
            <div className="mt-4 rounded-md border-2 border-fern bg-surface p-3 text-sm">
              <p>{error}</p>
              <Link
                href="/auth/login"
                className="mt-3 inline-flex text-sm font-semibold underline"
              >
                Zum Login
              </Link>
            </div>
          ) : (
            <ProfileEditForm
              initial={{
                displayName: profile?.displayName ?? "",
                plz: profile?.plz ?? "",
                avatarUrl: profile?.avatarUrl ?? "",
                bio: profile?.bio ?? "",
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}
