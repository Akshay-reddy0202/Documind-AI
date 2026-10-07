import type { ChatMessage as ChatMessageType } from "../types/chat.types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessageProps = {
  message: ChatMessageType;
};

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl bg-blue-600 px-4 py-3 text-sm leading-6 text-white"
            : "max-w-[80%] px-1 py-3 text-sm leading-7 text-slate-700"
        }
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-semibold text-slate-900">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-slate-900">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-slate-900">
                  {children}
                </h3>
              ),

              p: ({ children }) => (
                <p className="leading-7 text-slate-700">{children}</p>
              ),

              ul: ({ children }) => (
                <ul className="list-disc space-y-2 pl-6 text-slate-700">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="list-decimal space-y-2 pl-6 text-slate-700">
                  {children}
                </ol>
              ),

              li: ({ children }) => <li className="leading-7">{children}</li>,

              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">
                  {children}
                </strong>
              ),

              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-500">
                  {children}
                </blockquote>
              ),
              
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4">
                  {children}
                </pre>
              ),

              code: ({ className, children, ...props }) => {
                const isCodeBlock = className?.includes("language-");

                if (isCodeBlock) {
                  return (
                    <code
                      className="block overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-sm leading-6 text-slate-100"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <code
                    className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
