import type { Activity } from "@/lib/api/types";
import { ActivityGrid } from "./ActivityGrid";
import { LoadMoreButton } from "./LoadMoreButton";

type ActivitySectionProps = {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  onCreate: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
};

export function ActivitiesSection(props: ActivitySectionProps) {
  const {
    activities,
    loading,
    error,
    creating,
    onCreate,
    onLoadMore,
    hasMore,
    loadingMore,
  } = props;

  return (
    <section className="mx-auto mt-6 w-full max-w-md sm:max-w-2xl">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-evergreen">Aktivitäten</h2>
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

      {!loading && (
        <>
          <ActivityGrid
            activities={activities}
            creating={creating}
            onCreate={onCreate}
          />
          <LoadMoreButton
            onLoadMore={onLoadMore}
            loadingMore={loadingMore}
            hasMore={hasMore}
            disabled={!hasMore || loadingMore || loading}
          />
        </>
      )}
    </section>
  );
}
