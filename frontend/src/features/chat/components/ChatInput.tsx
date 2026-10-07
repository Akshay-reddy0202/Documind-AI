import { useState } from "react";

type ChatInputProps = {
  onSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
};

function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!question.trim() || isLoading) {
      return;
    }

    await onSubmit(question);
    setQuestion("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-transparent px-3 py-2"
    >
      <input
        type="text"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask anything about your documents..."
        disabled={isLoading}
        className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
      />

      <button
        type="submit"
        disabled={isLoading || !question.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        ↑
      </button>
    </form>
  );
}

export default ChatInput;