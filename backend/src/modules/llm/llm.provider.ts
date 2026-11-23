export interface ChatHistoryTurn {
  role: "USER" | "ASSISTANT";
  content: string;
}

export interface LlmProvider {
  generateAnswer(
    question: string,
    context: string,
    history?: ChatHistoryTurn[],
  ): Promise<string>;
}