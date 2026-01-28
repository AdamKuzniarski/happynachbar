import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Admin · Users</h1>
      <p className="mt-1 text-sm opacity-80">
        Nutzerverwaltung ist in Arbeit. Bald kannst du hier Accounts suchen,
        Rollen anpassen und sperren/entsperren.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link href="/admin/activities">Zurück zu Activities</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/homepage">Zur Startseite</Link>
        </Button>
      </div>
    </Card>
  );
}
