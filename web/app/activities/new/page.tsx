import Link from "next/link";
import { CreateActivityForm } from "./_components/CreateActivityForm";

export default function CreateActivityPage() {
  return (
    <main className="px-4">
      <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
        <Link
          href="/homepage"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          ← Zurück
        </Link>
      </div>
      <div className="mt-4">
        <CreateActivityForm />
      </div>
    </main>
  );
}
