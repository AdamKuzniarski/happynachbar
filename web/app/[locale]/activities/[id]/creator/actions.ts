"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getApiUrl() {
  return process.env.API_URL ?? "http://localhost:4000";
}

export async function startChatWithActivity(_prev: unknown, formData: FormData) {
  const activityId = String(formData.get("activityId") ?? "").trim();
  if (!activityId) return { error: "Fehlende Aktivität." };

  const token = (await cookies()).get("happynachbar_token")?.value;
  if (!token) return { error: "Bitte einloggen." };

  const res = await fetch(
    `${getApiUrl()}/chat/conversations/by-activity/${encodeURIComponent(
      activityId,
    )}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return { error: "Chat konnte nicht gestartet werden." };
  }

  const convo = (await res.json()) as { id?: string };
  if (!convo?.id) return { error: "Ungültige Antwort." };

  redirect(`/chat/${encodeURIComponent(convo.id)}`);
}
