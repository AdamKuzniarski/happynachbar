"use client";

type LoadMoreProps = {
  disabled: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

export function LoadMoreButton(props: LoadMoreProps) {
  const { disabled, loadingMore, hasMore, onLoadMore } = props;
  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={disabled}
        className="rounded-md border-2 border-fern bg-white px-4 py-2 text-xs font-medium text-evergreen hover:bg-limecream transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingMore ? "Lade mehr…" : hasMore ? "Mehr laden" : "Keine weiteren"}
      </button>
    </div>
  );
}
