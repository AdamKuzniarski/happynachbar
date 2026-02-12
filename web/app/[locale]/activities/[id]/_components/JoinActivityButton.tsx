"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { getActivityJoinStatus, joinActivity } from "@/lib/api/activities";

export function JoinActivityButton({
  activityId,
  isAuthenticated,
}: {
  activityId: string;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("activities");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [joining, setJoining] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      const res = await getActivityJoinStatus(activityId);
      if (!active) return;
      if (res.ok) setDone(res.joined);
    })();
    return () => {
      active = false;
    };
  }, [activityId, isAuthenticated]);

  async function onJoin() {
    if (joining || done) return;
    if (!isAuthenticated) {
      setError(t("errors.loginRequired"));
      return;
    }

    setError(null);
    setJoining(true);
    try {
      const res = await joinActivity(activityId);
      if (!res.ok) {
        const msg = Array.isArray(res.message)
          ? res.message.join(", ")
          : res.message ?? t("errors.invalidResponse");
        setError(msg);
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="primary"
        className="hover:bg-fern/20 hover:text-foreground"
        onClick={onJoin}
        disabled={joining || done}
      >
        {joining
          ? tCommon("loading")
          : done
            ? t("actions.joined")
            : t("actions.join")}
      </Button>
      <FormError message={error} />
    </div>
  );
}
