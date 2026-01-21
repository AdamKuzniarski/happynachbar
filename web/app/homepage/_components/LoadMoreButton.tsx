"use client";

import { Button } from "@/components/ui/Button";

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
      <Button type="button" onClick={onLoadMore} disabled={disabled}>
        {loadingMore ? "Lade mehr…" : hasMore ? "Mehr laden" : "Keine weiteren"}
      </Button>
    </div>
  );
}
