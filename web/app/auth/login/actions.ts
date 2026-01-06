"use server";

import { cookies } from "next/headers";

function getApiUrl() {
  return process.env.API_URL ?? "http://localhost:4000";
}

async function readJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginAndSetCookie(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const msg =
      (Array.isArray(payload?.message)
        ? payload.message.join(", ")
        : payload?.message) || "Login failed";
    return { ok: false, error: msg };
  }

  // Nest gibt { access_token } zurück
  const token = String(payload?.access_token ?? "");
  if (!token)
    return {
      ok: false,
      error: "No token received from API",
    };

  const cookieStore = await cookies();

  cookieStore.set("happynachbar_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { ok: true };
}
