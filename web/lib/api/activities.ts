import { apiFetch } from "./client";
import type { ListActivitiesResponse } from "./types";

type ParamsActivities = {
  take?: number;
  cursor?: string | null;
  q?: string;
  plz?: string;
  category?: string;
};

export function listActivities(params: ParamsActivities) {
  const take = params.take ?? 10;

  const sp = new URLSearchParams();
  sp.set("take", String(take));
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.plz?.trim()) sp.set("plz", params.plz.trim());
  if (params.category?.trim()) sp.set("category", params.category.trim());

  return apiFetch<ListActivitiesResponse>(`/activities?${sp.toString()}`);
}
