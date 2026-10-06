import type { ChatResponse } from "../types/chat.types";

type ChatMessageProps = {
  response: ChatResponse;
};

function ChatMessage({ response }: ChatMessageProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm leading-7 text-slate-200">
        {response.data.answer}
      </p>
    </div>
  );
}

export default ChatMessage;