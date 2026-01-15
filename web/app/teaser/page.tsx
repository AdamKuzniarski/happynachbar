import Link from "next/link";
import { redirect } from "next/navigation";

function isValidGermanPostalCode(value: string) {
  return /^\d{5}$/.test(value);
}

type SP = { postalCode?: string | string[] };

export default async function ActivityTeaserPage({
  searchParams,
}: {
  searchParams: SP | Promise<SP>;
}) {
  const sp = await Promise.resolve(searchParams);
  const raw = sp.postalCode;
  const postalCode = Array.isArray(raw) ? raw[0] : raw;

  // Nur Format-Check: 5 Ziffern. Wenn fehlt/ungültig -> zurück zur Landing
  if (!postalCode || !isValidGermanPostalCode(postalCode)) {
    redirect("/");
  }

  const apiBase = process.env.API_URL ?? "http://localhost:4000";

  if (!apiBase) {
    return <div className="p-6">API_BASE_URL ist nicht gesetzt.</div>;
  }

  const res = await fetch(
    `${apiBase}/activities?plz=${encodeURIComponent(postalCode)}&status=ACTIVE`,
    { cache: "no-store" }
  );
  const json = await res.json();

  const count = Array.isArray(json?.items)
    ? json.items.length
    : Array.isArray(json)
    ? json.length
    : 0;

  const personLabel = count === 1 ? "Person" : "Personen";
  const verbLabel = count === 1 ? "ist" : "sind";

  return (
    <div className="min-h-screen bg-white text-evergreen">
      <header className="border-b-2 border-fern">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3 sm:max-w-2xl sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="h-9 w-9 rounded bg-fern sm:h-10 sm:w-10"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold sm:text-lg text-evergreen">
              happynachbar
            </span>
          </div>

          <Link
            href="/auth/login"
            className="rounded-md border-2 border-fern bg-limecream px-3 py-2 text-sm font-medium text-evergreen hover:bg-palm hover:text-limecream transition-colors sm:px-4"
          >
            Anmelden
          </Link>
        </div>
      </header>

      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-10 pb-12 sm:max-w-2xl sm:pt-16">
          <div className="mx-auto w-full max-w-md">
            <div className="min-h-[420px] rounded-[32px] bg-white px-6 py-10 shadow-lg sm:px-10 sm:py-12">
              <p className="text-center text-lg">
                <span className="font-bold">{count}</span> {personLabel}{" "}
                {verbLabel} gerade in deiner Nähe aktiv!
              </p>

              <div className="mt-12 flex justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-md border-2 border-fern bg-limecream px-5 py-3 text-base font-semibold text-evergreen hover:bg-palm hover:text-limecream transition-colors"
                >
                  Lerne deine Nachbarschaft kennen
                </Link>
              </div>

              <p className="mt-6 text-center text-sm text-hunter/80">
                Postleitzahl: <span className="font-medium">{postalCode}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
