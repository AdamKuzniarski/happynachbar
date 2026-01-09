"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

type Activity = {
  id: string;
  title: string;
  category: string;
  location: string;
  when: string;
};

const CREATE_ACTIVITY_ROUTE = "/create-activity";

const mockActivities: Activity[] = [
  {
    id: "a1",
    title: "Spaziergang",
    category: "Outdoor",
    location: "10115",
    when: "Heute, 18:00",
  },
  {
    id: "a2",
    title: "Kaffee & Quatschen",
    category: "Social",
    location: "Prenzlauer Berg",
    when: "Morgen, 10:30",
  },
  {
    id: "a3",
    title: "Jogging Runde",
    category: "Sport",
    location: "Berlin",
    when: "Sa, 09:00",
  },
  {
    id: "a4",
    title: "Brettspiele",
    category: "Indoor",
    location: "10557",
    when: "So, 17:00",
  },
  {
    id: "a5",
    title: "Hunde treffen",
    category: "Outdoor",
    location: "Park",
    when: "Heute, 19:30",
  },
];

async function routeExists(href: string) {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(href, { method });
      if (res.ok) return true;
      if (res.status === 404) return false;
    } catch {
      // ignore
    }
  }
  return false;
}

export default function HomepagePage() {
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("Alle Kategorien");
  const [plz, setPlz] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // placeholder – später echte Suche/Filter
  }

  async function handleCreateActivity() {
    setCreating(true);
    try {
      const exists = await routeExists(CREATE_ACTIVITY_ROUTE);
      if (exists) router.push(CREATE_ACTIVITY_ROUTE);
      else alert("Create-Activity Seite ist noch nicht implementiert.");
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
                    <option>Alle Kategorien</option>
                    <option>Outdoor</option>
                    <option>Sport</option>
                    <option>Social</option>
                    <option>Indoor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-center block">
                    PLZ oder Ort
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
                  className="h-10 shrink-0 rounded-md border-2 border-fern bg-palm px-4 text-xs font-medium text-white hover:bg-hunter transition-colors"
                >
                  Find/Search
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
                {mockActivities.length} Vorschläge
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mockActivities.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    alert(`(Placeholder) Öffne Aktivität: ${a.title}`)
                  }
                  className="min-h-[96px] rounded-md border-2 border-fern bg-limecream p-3 text-left hover:bg-palm hover:text-limecream transition-colors"
                >
                  <div className="text-sm font-semibold leading-snug">
                    {a.title}
                  </div>
                  <div className="mt-1 text-xs opacity-90">{a.category}</div>
                  <div className="mt-2 text-[11px] leading-tight opacity-90">
                    <div className="truncate">{a.location}</div>
                    <div className="truncate">{a.when}</div>
                  </div>
                </button>
              ))}

              {/* "+" tile */}
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
          </section>
        </div>
      </main>
    </div>
  );
}
