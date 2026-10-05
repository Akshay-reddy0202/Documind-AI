export interface LlmProvider {
    generateAnswer(
      question: string,
      context: string,
    ): Promise<string>;
  }