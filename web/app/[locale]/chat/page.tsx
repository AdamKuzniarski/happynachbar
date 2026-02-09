import { AppShell } from "@/components/layout/AppShell";
import { ChatInbox } from "./_components/ChatInbox";

export default function ChatInboxPage() {
  return (
    <AppShell variant="app">
      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
          <h1 className="text-xl font-semibold text-center sm:text-left">
            Nachrichten
          </h1>
          <ChatInbox />
        </div>
      </main>
    </AppShell>
  );
}
