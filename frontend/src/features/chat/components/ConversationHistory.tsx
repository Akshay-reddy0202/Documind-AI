import { useState } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import type { Conversation } from "../types/chat.types";

type ConversationHistoryProps = {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => Promise<void>;
  onConversationDelete: (conversationId: string) => Promise<void>;
};

function ConversationHistory({
  conversations,
  isLoading,
  error,
  selectedConversationId,
  onConversationSelect,
  onConversationDelete,
}: ConversationHistoryProps) {
  const [conversationToDelete, setConversationToDelete] =
    useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;
    try {
      setIsDeleting(true);
      await onConversationDelete(conversationToDelete.id);
      setConversationToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <section className="flex min-h-0 flex-col gap-2">
      <h2 className="px-3 py-2 text-sm font-medium text-slate-700">History</h2>

      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pl-3">
        {isLoading && (
          <p className="px-3 py-2 text-xs text-slate-400">
            Loading conversations...
          </p>
        )}

        {error && <p className="px-3 py-2 text-xs text-red-500">{error}</p>}

        {!isLoading && !error && conversations.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-400">
            No conversations yet.
          </p>
        )}

        {!isLoading &&
          !error &&
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center gap-1 rounded-lg transition ${
                selectedConversationId === conversation.id
                  ? "bg-slate-200"
                  : "hover:bg-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => void onConversationSelect(conversation.id)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-slate-600"
                title={conversation.title}
              >
                {conversation.title}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConversationToDelete(conversation);
                }}
                className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                aria-label={`Delete ${conversation.title}`}
              >
                ×
              </button>
            </div>
          ))}
      </div>

      <ConfirmDialog
        isOpen={conversationToDelete !== null}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${conversationToDelete?.title}"? This conversation and its messages will be permanently removed.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setConversationToDelete(null)}
      />
    </section>
  );
}

export default ConversationHistory;
