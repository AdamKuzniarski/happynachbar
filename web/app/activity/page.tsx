import Link from "next/link";
import { PostalCodeForm } from "../postal-code-form";

function isValidGermanPostalCode(value: string) {
  return /^\d{5}$/.test(value);
}

export default async function ActivityTeaserPage({
  searchParams,
}: {
  searchParams: { postalCode?: string };
}) {
  const postalCode = searchParams.postalCode;

  if (!postalCode || !isValidGermanPostalCode(postalCode)) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-12 sm:max-w-2xl sm:pt-16">
        <h1 className="text-center text-2xl font-bold sm:text-4xl">Activity</h1>
        <p className="mt-2 text-center text-sm text-hunter sm:text-base">
          Enter your postal code to discover activities in your area.
        </p>
        <div className="mt-8 sm:mt-10">
          <PostalCodeForm />
        </div>
      </div>
    );
  }

  const apiBase = process.env.API_BASE_URL; 
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

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-10 pb-12 sm:max-w-2xl sm:pt-16">
      <h1 className="text-center text-2xl font-bold sm:text-4xl">
        Activity in {postalCode}
      </h1>

      <p className="mt-4 text-center text-sm text-hunter sm:text-base">
        Currently <span className="font-semibold">{count}</span> activities are
        active in your area.
      </p>

      <div className="mt-8 flex justify-center">
        <Link href="/auth/login">
          <button className="h-10 rounded-md border-2 border-fern bg-palm px-4 text-sm font-medium text-white hover:bg-hunter transition-colors">
            Get to know your neighborhood
          </button>
        </Link>
      </div>
    </div>
  );
}
