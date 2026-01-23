import type { ActivityCategory } from "./enums";

export type Activity = {
  id: string;
  title: string;
  category: ActivityCategory | string;
  startAt?: string;
  plz?: string;
  thumbnailUrl?: string | null;
  updatedAt?: string;
  createdBy?: { displayName?: string };
};

export type ListActivitiesResponse = {
  items: Activity[];
  nextCursor: string | null;
};
export type ActivityImage = {
  url: string;
  sortOrder: number;
  alt?: string;
};

export type ManualUrlAddStatus =
  | "empty"
  | "invalid"
  | "limit"
  | "duplicate"
  | "added";

export type AddUrlResult =
  | { ok: true; value: string }
  | { ok: false; reason: "invalid" | "limit" | "duplicate" };

export type UserSummary = {
  id: string;
  displayName?: string;
};

export type ActivityDetail = Activity & {
  description?: string;
  status?: string;
  scheduledAt?: string;
  createdById?: string;
  createdBy?: UserSummary;
  createdAt?: string;
  images?: ActivityImage[];
};
