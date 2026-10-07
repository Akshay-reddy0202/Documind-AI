import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

function Chat() {
  const { messages, isLoading, error, sendMessage } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="chat-scroll min-h-0 flex-1 overflow-y-auto px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-8">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          {isLoading && (
            <p className="text-sm text-slate-400">
              Thinking...
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="px-6 pb-6 pt-3">
        <div className="mx-auto w-full max-w-3xl">
          <ChatInput
            onSubmit={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;