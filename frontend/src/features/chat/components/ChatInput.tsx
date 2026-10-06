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
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask a question about your documents..."
        disabled={isLoading}
        className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-slate-500"
      />

      <button
        type="submit"
        disabled={isLoading || !question.trim()}
        className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;