"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyInner() {
  const sp = useSearchParams();
  const token = sp.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    token ? "loading" : "error",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
    fetch(`${apiUrl}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return <p>Verifiziere…</p>;
  if (status === "ok")
    return <p> Email bestätigt. Du kannst dich jetzt einloggen.</p>;
  return <p> Link ungültig oder abgelaufen. Bitte “Mail erneut senden”.</p>;
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<p>Verifiziere…</p>}>
      <VerifyInner />
    </Suspense>
  );
}
