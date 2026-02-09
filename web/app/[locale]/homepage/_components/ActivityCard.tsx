import Link from "next/link";
import type { Activity } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { formatActivityCategory } from "@/lib/api/enums";
import { SafeImage } from "@/components/ui/SafeImage";

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link href={`/activities/${activity.id}`}>
      <div className="rounded-md bg-surface overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative">
          {activity.thumbnailUrl ? (
            <div className="relative h-36 w-full">
              <SafeImage
                src={activity.thumbnailUrl}
                alt={activity.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-36 w-full bg-surface" />
          )}

          <span className="absolute right-2 top-2 rounded border border-fern bg-surface/90 px-2 py-1 text-[11px]">
            {formatActivityCategory(activity.category)}
          </span>
        </div>

        <div className="p-3">
          <div className="text-sm font-semibold truncate">
            {activity.title ?? "—"}
          </div>

          <div className="mt-2 text-xs leading-relaxed">
            <div>
              <span className="font-medium">Start:</span>{" "}
              {formatDate(activity.startAt)}
            </div>
            <div className="mt-1">
              <span className="font-medium">PLZ:</span> {activity.plz ?? "—"}
            </div>
            <div className="mt-1 truncate opacity-80">
              <span className="font-medium">By:</span>{" "}
              {activity.createdBy?.displayName?.trim() || "Neighbor"}
            </div>
            <div className="mt-2 opacity-80">
              <span className="font-medium">Updated:</span>{" "}
              {formatDate(activity.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
