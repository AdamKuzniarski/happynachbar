"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type FormState = { error?: string };

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";
}

function getMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const message = (payload as Record<string, unknown>).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && message.every((m) => typeof m === "string")) {
    return message.join(", ");
  }
  return null;
}

export async function updateProfileAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("happynachbar_token")?.value;
  if (!token) return { error: "Bitte logge dich ein." };

  const payload: Record<string, string> = {};
  const displayName = String(formData.get("displayName") ?? "").trim();
  const plz = String(formData.get("plz") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (displayName) payload.displayName = displayName;
  if (plz) payload.plz = plz;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  if (bio) payload.bio = bio;

  if (Object.keys(payload).length === 0) {
    return { error: "Keine Änderungen zum Speichern." };
  }

  const res = await fetch(`${getApiUrl()}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = getMessage(json) || "Profil konnte nicht gespeichert werden.";
    return { error: msg };
  }

  redirect("/profile");
}
