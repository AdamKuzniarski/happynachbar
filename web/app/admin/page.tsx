import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Admin Übersicht</h1>
      <p className="mt-1 text-sm opacity-80">Hier ist Admin-Toolbox.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link href="/admin/activities">Activities</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/users">Users</Link>
        </Button>
      </div>
    </Card>
  );
}
