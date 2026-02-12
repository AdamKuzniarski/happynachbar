"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { listActivityParticipants } from "@/lib/api/activities";

type Participant = {
  id: string;
  displayName: string | null;
};

export function ParticipantsList({
  activityId,
}: {
  activityId: string;
}) {
  const t = useTranslations("activities");
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const res = await listActivityParticipants(activityId);
      if (!active) return;
      if (!res.ok) {
        const msg = Array.isArray(res.message)
          ? res.message.join(", ")
          : res.message ?? t("errors.invalidResponse");
        setError(msg);
        setLoading(false);
        return;
      }
      setParticipants(res.participants);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [activityId, t]);

  return (
    <div className="mt-5">
      <div className="text-sm font-semibold">{t("labels.participants")}</div>
      <div className="mt-2 rounded-xl bg-fern/10 p-4 text-sm ring-1 ring-fern/20">
        {loading ? (
          <span className="opacity-70">{t("loadingParticipants")}</span>
        ) : error ? (
          <span className="text-red-600">{error}</span>
        ) : participants.length === 0 ? (
          <span className="opacity-70">{t("noParticipants")}</span>
        ) : (
          <ul className="list-disc pl-5">
            {participants.map((p) => (
              <li key={p.id}>
                {p.displayName?.trim() || t("fallback.neighbor")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
