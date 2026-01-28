import { apiFetch } from "@/lib/api/client";
import { buildQuery } from "@/lib/query";
import type {
  AdminActivityDetail,
  AdminActivityRow,
  AdminActivityStatus,
  ListResponse,
} from "./types";
import type { ActivityCategory } from "../enums";

export function adminListActivities(params: { take?: number; q?: string }) {
  const qs = buildQuery({
    take: params.take ?? 20,
    q: params.q,
  });
  return apiFetch<ListResponse<AdminActivityRow>>(`/admin/activities?${qs}`);
}

export function adminGetActivity(id: string) {
  return apiFetch<AdminActivityDetail>(
    `/admin/activities/${encodeURIComponent(id)}`,
  );
}

export function adminUpdateActivity(
  id: string,
  payload: {
    title?: string;
    description?: string;
    category?: ActivityCategory;
    plz?: string;
    scheduledAt?: string;
  },
) {
  return apiFetch(`/admin/activities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function adminSetActivityStatus(
  id: string,
  status: AdminActivityStatus,
) {
  return apiFetch<{ id: string; status: string }>(
    `/admin/activities/${encodeURIComponent(id)}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}
