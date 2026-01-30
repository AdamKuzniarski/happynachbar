import { apiFetch } from "../client";
import { buildQuery } from "@/lib/query";
import type { ListResponse } from "./types";

export type AdminUserRole = "USER" | "MODERATOR" | "ADMIN";

export type AdminUserRow = {
  id: string;
  email: string;
  role: AdminUserRole;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  lastActivity: string | null;
  createdAt: string;
  profile: { displayName: string | null; plz: string | null } | null;
};

type adminListUserParams = {
  take?: number;
  cursor?: string | null;
  q?: string;
  role?: AdminUserRole;
  isBanned?: boolean;
};

export function adminListUser({
  take,
  cursor,
  q,
  role,
  isBanned,
}: adminListUserParams) {
  const qs = buildQuery({
    take: take ?? 20,
    cursor: cursor ?? undefined,
    q: q,
    role: role,
    isBanned: typeof isBanned === "boolean" ? String(isBanned) : undefined,
  });

  return apiFetch<ListResponse<AdminUserRow>>(`/admin/users?${qs}`);
}
