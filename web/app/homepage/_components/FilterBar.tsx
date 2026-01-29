"use client";

import * as React from "react";
import { ACTIVITY_CATEGORIES, formatActivityCategory } from "@/lib/api/enums";
import { normalizePostalCodeInput } from "@/lib/validators";

type filterBarProps = {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  plz: string;
  setPlz: (v: string) => void;
  loading: boolean;
  onSearch: () => void;
};

export function FiltersBar(props: filterBarProps) {
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    props.onSearch();
  }

  const { query, setQuery, category, setCategory, plz, setPlz, loading } =
    props;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="mx-auto w-full md:w-fit rounded-2xl sm:rounded-full bg-surface shadow-sm ring-1 ring-fern/40 focus-within:ring-2 focus-within:ring-palm/40 overflow-hidden">
        <div className="overflow-hidden rounded-2xl sm:rounded-full">
          <div className="flex flex-col sm:flex-row sm:items-center divide-y divide-fern/20 sm:divide-y-0">
            <div className="flex items-center w-full sm:w-65 shrink-0 min-w-0 px-3 py-2 sm:px-0 sm:py-0">
              <div className="pl-3 text-hunter/70" aria-hidden="true">
                🔎
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Suche…"
                className="border-0 rounded-none bg-transparent px-2 focus:ring-0"
              />
            </div>

            <div className="flex items-center w-full sm:min-w-45 border-fern/20 sm:border-t-0 sm:border-l sm:border-fern/20 px-3 py-2 sm:px-0 sm:py-0">
              <select
                value={category}
                id="category"
                onChange={(e) => setCategory(e.target.value)}
                className=" rounded-none bg-transparent focus:ring-0"
              >
                <option value="">Alle Kategorien</option>
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {formatActivityCategory(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center w-full sm:min-w-40 border-fern/20 sm:border-t-0 sm:border-l sm:border-fern/20 px-3 py-2 sm:px-0 sm:py-0">
              <input
                value={plz}
                onChange={(e) =>
                  setPlz(normalizePostalCodeInput(e.target.value))
                }
                placeholder="PLZ"
                inputMode="numeric"
                maxLength={5}
                className="border-0 rounded-none bg-transparent focus:ring-0"
              />
            </div>

            <div className="flex items-center w-full sm:w-auto border-fern/20 sm:border-t-0 sm:border-l sm:border-fern/20 p-2 sm:p-1">
              <button
                type="submit"
                disabled={loading}
                className="h-9 w-full sm:w-auto rounded-full bg-palm px-4 text-xs font-medium text-white hover:bg-hunter transition-colors disabled:opacity-60 m-1"
              >
                {loading ? "…" : "Finden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
