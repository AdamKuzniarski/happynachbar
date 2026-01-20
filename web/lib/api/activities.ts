import { apiFetch } from "./client";
import { buildQuery } from "@/lib/query";
import type { ActivityDetail, ListActivitiesResponse } from "./types";

export type ListActivitiesParams = {
  take?: number;
  cursor?: string | null;
  q?: string;
  plz?: string;
  category?: string;
  status?: string;
  createdById?: string;
  startFrom?: string;
  startTo?: string;
};

export function listActivities(params: ListActivitiesParams) {
  const qs = buildQuery({
    take: params.take ?? 10,
    cursor: params.cursor ?? null,
    q: params.q,
    plz: params.plz,
    category: params.category,
    status: params.status,
    createdById: params.createdById,
    startFrom: params.startFrom,
    startTo: params.startTo,
  });

  return apiFetch<ListActivitiesResponse>(`/activities?${qs}`);
}

export function getActivity(id: string) {
  return apiFetch<ActivityDetail>(`/activities/${encodeURIComponent(id)}`);
}

export type CreateActivityPayload = {
  title: string;
  description?: string;
  category: string;
  plz: string;
  startAt?: string;
  imageUrls?: string[];
};

export async function createActivity(
  payload: CreateActivityPayload,
): Promise<
  { ok: true } | { ok: false; status: number; message?: string | string[] }
> {
  try {
    await apiFetch(`/activities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true };
  } catch (e: unknown) {
    // apiFetch wirft Error(message)
    return {
      ok: false,
      status: 400,
      message: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
