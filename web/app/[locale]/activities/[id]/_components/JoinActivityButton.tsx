"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import {
  getActivityJoinStatus,
  joinActivity,
  leaveActivity,
} from "@/lib/api/activities";
import { GroupChatButton } from "./GroupChatButton";

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
  const [checking, setChecking] = React.useState(false);
  const [joining, setJoining] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setChecking(true);
    (async () => {
      const res = await getActivityJoinStatus(activityId);
      if (!active) return;
      if (res.ok) setDone(res.joined);
      setChecking(false);
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
      window.dispatchEvent(new Event("chat:refresh"));
      router.refresh();
    } finally {
      setJoining(false);
    }
  }

  async function onLeave() {
    if (leaving || !done) return;
    setError(null);
    setLeaving(true);
    try {
      const res = await leaveActivity(activityId);
      if (!res.ok) {
        const msg = Array.isArray(res.message)
          ? res.message.join(", ")
          : res.message ?? t("errors.invalidResponse");
        setError(msg);
        return;
      }
      setDone(false);
      window.dispatchEvent(new Event("chat:refresh"));
      router.refresh();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {done ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="hover:bg-fern/20 hover:text-foreground"
            disabled
            aria-label={t("actions.joined")}
            title={t("actions.joined")}
          >
            <UserCheck className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="hover:bg-fern/20 hover:text-foreground"
            onClick={onLeave}
            disabled={checking || leaving}
            aria-label={t("actions.leave")}
            title={t("actions.leave")}
          >
            {checking || leaving ? (
              tCommon("loading")
            ) : (
              <UserX className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <GroupChatButton activityId={activityId} />
        </div>
      ) : (
        <Button
          type="button"
          variant="primary"
          className="hover:bg-fern/20 hover:text-foreground"
          onClick={onJoin}
          disabled={checking || joining}
          aria-label={t("actions.join")}
          title={t("actions.join")}
        >
          {checking || joining ? (
            tCommon("loading")
          ) : (
            <UserCheck className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      )}
      <FormError message={error} />
    </div>
  );
}
