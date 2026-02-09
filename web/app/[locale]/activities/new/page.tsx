import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";
import { CreateActivityForm } from "./_components/CreateActivityForm";
import { Button } from "@/components/ui/Button";

export default function CreateActivityPage() {
  return (
    <main className="px-4 pb-16">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Button
          asChild
          variant="secondary"
          className="group h-7 px-2 py-0 text-[11px] leading-none"
        >
          <Link href="/homepage">
            <CircleArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover:ml-2 group-hover:max-w-48 group-hover:opacity-100 group-hover:overflow-visible">
              Zurück zur Übersicht
            </span>
          </Link>
        </Button>
      </div>
      <div className="mt-4 mx-auto w-full max-w-md sm:max-w-2xl sm:pt-2">
        <CreateActivityForm />
      </div>
    </main>
  );
}
