import { Service } from 'typedi';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsBase } from 'openai/src/resources/chat/completions';

export type AICompletionMessage = {
  from: 'system' | 'assistant' | 'user';
  text: string;
};

@Service()
export class AICompletionService {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async predict(
    model: ChatCompletionCreateParamsBase['model'],
    messages: AICompletionMessage[],
    creativityLevel?: number,
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map(message => ({
        role: message.from,
        content: message.text,
      })),
      temperature: creativityLevel,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  }
}
