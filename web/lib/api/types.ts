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
