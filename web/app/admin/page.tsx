import Link from "next/link";
import { Card } from "@/components/ui/Card";

const btn =
  "inline-flex rounded-md border-2 border-fern bg-surface-strong px-3 py-2 text-sm font-medium hover:bg-surface transition-colors";

export default function Page() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Admin Übersicht</h1>
      <p className="mt-1 text-sm opacity-80">Hier ist Admin-Toolbox.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link className={btn} href="/admin/activities">
          Activities
        </Link>
        <Link className={btn} href="/admin/users">
          Users
        </Link>
      </div>
    </Card>
  );
}
