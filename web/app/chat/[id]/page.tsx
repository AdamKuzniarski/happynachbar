import { AppShell } from "@/components/layout/AppShell";
import { ChatRoom } from "./_components/ChatRoom";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell variant="app">
      <main className="px-4">
        <div className="mx-auto w-full max-w-md pt-6 pb-10 sm:max-w-2xl sm:pt-10">
          <ChatRoom conversationId={id} />
        </div>
      </main>
    </AppShell>
  );
}
