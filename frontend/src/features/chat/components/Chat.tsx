import { useChat } from "../hooks/useChat";
import ChatInput from "./ChatInput";

function Chat() {
  const { messages, isLoading, error, sendMessage } = useChat();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[75%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  : "max-w-[75%] rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-7 text-slate-200"
              }
            >
              {message.content}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-slate-500">
            Thinking...
          </p>
        )}
      </div>

      <div className="mt-6">
        <ChatInput
          onSubmit={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default Chat;