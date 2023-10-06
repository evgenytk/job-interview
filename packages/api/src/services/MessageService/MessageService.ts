import { Inject, Service } from 'typedi';
import { CreateMessageDTO } from 'src/services/MessageService/DTO/CreateMessageDTO';
import { Message } from 'src/entities/Message/Message';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { MessageRepository } from 'src/entities/Message/MessageRepository';
import {
  AICompletionMessage,
  AICompletionService,
} from 'src/services/AICompletionService/AICompletionService';

@Service()
export class MessageService {
  @InjectRepository()
  private readonly messageRepository: MessageRepository;

  @Inject()
  private readonly completionService: AICompletionService;

  async createMessage(data: CreateMessageDTO): Promise<Message> {
    const existingMessage = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.id = :id', {
        id: data.id,
      })
      .getOne();

    if (existingMessage) {
      return existingMessage;
    }

    const message = new Message();
    message.id = data.id;
    message.side = data.side;
    message.message = data.message;
    message.userId = data.userId;
    await this.messageRepository.save(message);

    return message;
  }

  async answerUser(userId: string): Promise<string> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.userId = :userId', {
        userId,
      })
      .orderBy('message.createdAt', 'ASC')
      .getMany();

    const messagesFormatted: AICompletionMessage[] = messages.map(message => ({
      from: message.side === 'client' ? 'user' : 'assistant',
      text: message.message,
    }));
    return await this.completionService.predict(
      'gpt-3.5-turbo',
      messagesFormatted,
      0.8,
    );
  }
}
