import Link from "next/link";
import { notFound } from "next/navigation";
import type { ActivityDetail } from "@/lib/api/types";
import { EditActivityForm } from "./_components/EditActivityForm";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${apiBase}/activities/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (!res.ok) notFound();
  const activity = (await res.json()) as ActivityDetail;

  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href={`/activities/${encodeURIComponent(id)}`}
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>

        <div className="mt-4">
          <EditActivityForm activity={activity} />
        </div>
      </div>
    </main>
  );
}
