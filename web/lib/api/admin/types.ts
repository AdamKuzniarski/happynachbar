export type ListResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export type AdminCreatedBy = {
  id: string;
  email: string;
  displayName: string;
};

export type AdminActivityBase = {
  id: string;
  title: string;
  category: string;
  status: "ACTIVE" | "ARCHIVED" | string;
  plz: string;
  startAt: string;
  createdAt: string;
  createdBy: AdminCreatedBy;
};

export type AdminActivityRow = AdminActivityBase & {
  updatedAt?: string;
  thumbnailUrl?: string | null;
};

export type AdminActivityDetail = AdminActivityBase & {
  description?: string;
  updatedAt: string;
};
