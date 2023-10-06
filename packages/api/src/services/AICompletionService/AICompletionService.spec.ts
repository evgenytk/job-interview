import {
  AICompletionMessage,
  AICompletionService,
} from './AICompletionService';

process.env.OPENAI_API_KEY = 'MOCK';

const mockResponseText = 'Generated completion text';
jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: mockResponseText,
              },
            },
          ],
        }),
      },
    },
  })),
);

describe('AICompletionService', () => {
  let service: AICompletionService;

  beforeAll(() => {
    service = new AICompletionService();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of AICompletionService', () => {
    expect(service).toBeInstanceOf(AICompletionService);
  });

  it('should call OpenAI API and return a completion', async () => {
    const model = 'gpt-3.5-turbo';
    const messages: AICompletionMessage[] = [
      { from: 'user', text: 'User message 1' },
      { from: 'assistant', text: 'Assistant message 1' },
    ];
    const creativityLevel = 0.7;

    const result = await service.predict(model, messages, creativityLevel);
    expect(
      (service as any).client.chat.completions.create,
    ).toHaveBeenCalledWith({
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
    expect(result).toBe(mockResponseText);
  });
});
