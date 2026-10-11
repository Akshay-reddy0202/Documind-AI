
import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

type ChatProps = {
  selectedConversationId: string | null;
  onConversationCreated: (conversationId: string) => void;
};

function Chat({
  selectedConversationId,
  onConversationCreated,
}: ChatProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousConversationId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedConversationId === null) {
      if (previousConversationId.current !== null) {
        startNewConversation();
      }
    } else if (
      selectedConversationId !== previousConversationId.current
    ) {
      void loadConversation(selectedConversationId);
    }

    previousConversationId.current = selectedConversationId;
  }, [
    selectedConversationId,
    loadConversation,
    startNewConversation,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (
    question: string,
  ): Promise<void> => {
    const createdConversationId = await sendMessage(question);

    if (createdConversationId) {
      previousConversationId.current = createdConversationId;
      onConversationCreated(createdConversationId);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {isLoading && (
            <p className="text-sm text-slate-400">Thinking...</p>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
        <div className="w-full">
          <ChatInput
            onSubmit={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;
