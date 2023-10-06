import dotenv from 'dotenv';
import {
  Connection,
  createConnection,
  getCustomRepository,
  useContainer,
} from 'typeorm';
import {
  tearDownDatabase,
  useRefreshDatabase,
  useSeeding,
} from 'typeorm-seeding';
import { CreateMessageDTO } from 'src/services/MessageService/DTO/CreateMessageDTO';
import { Container } from 'typedi';
import { MessageService } from './MessageService';
import 'pg';
import { MessageRepository } from 'src/entities/Message/MessageRepository';
import { MessagePoolService } from 'src/services/MessageService/MessagePoolService';

dotenv.config();
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

describe('MessageService', () => {
  let messageService: MessageService;
  let messagePoolService: MessagePoolService;
  let connection: Connection;
  beforeAll(async () => {
    useContainer(Container);

    if (!connection) {
      connection = await createConnection({
        type: process.env.TYPEORM_CONNECTION as 'postgres',
        synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
        database: process.env.TYPEORM_TEST_DATABASE as string,
        username: process.env.TYPEORM_TEST_USERNAME,
        password: process.env.TYPEORM_TEST_PASSWORD,
        host: process.env.TYPEORM_TEST_HOST,
        port: parseInt(process.env.TYPEORM_TEST_PORT),
        entities: [process.env.TYPEORM_ENTITIES],
      });
      await useRefreshDatabase();
      await useSeeding();
    }

    messageService = Container.get(MessageService);
    messagePoolService = Container.get(MessagePoolService);
  });

  afterAll(async () => {
    await useRefreshDatabase();
    await tearDownDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of MessageService', () => {
    expect(messageService).toBeInstanceOf(MessageService);
  });

  it('should create an instance of MessageService', () => {
    expect(messagePoolService).toBeInstanceOf(MessagePoolService);
  });

  it('should save new message to database', async () => {
    const message = new CreateMessageDTO();
    message.id = 'should-save-new-message-to-database';
    message.side = 'client';
    message.userId = 'test';
    message.message = '!@#$%^&*()_+}{~?></.,|"';
    await messageService.createMessage(message);

    const messagesCount = await getCustomRepository(MessageRepository)
      .createQueryBuilder('message')
      .where('message.id = :id', {
        id: message.id,
      })
      .andWhere('message.side = :side', {
        side: message.side,
      })
      .andWhere('message.userId = :userId', {
        userId: message.userId,
      })
      .andWhere('message.message = :text', {
        text: '!@#$%^&*()_+}{~?></.,|"',
      })
      .getCount();

    expect(messagesCount).toEqual(1);
  });

  it('should skip message with the same ID', async () => {
    const message1 = new CreateMessageDTO();
    message1.id = '1';
    message1.side = 'client';
    message1.userId = '1';
    message1.message = 'Test 1';

    const message2 = new CreateMessageDTO();
    message2.id = '1';
    message2.side = 'client';
    message2.userId = '1';
    message2.message = 'Test 2';

    await messageService.createMessage(message1);
    await messageService.createMessage(message2);

    const messagesCount = await getCustomRepository(MessageRepository)
      .createQueryBuilder('message')
      .where('message.id = :id', {
        id: message1.id,
      })
      .andWhere('message.message = :text', {
        text: 'Test 1',
      })
      .getCount();

    expect(messagesCount).toEqual(1);
  });

  it('should send all messages from a single user', async () => {
    const result = await messageService.answerUser('1');
    expect(result).toBe(mockResponseText);
  });

  it('should add user to waiting pool', async () => {
    await messagePoolService.delayAnswer('1', 1000);
    const usersFirstCall = messagePoolService.getUsersAwaitng();
    expect(usersFirstCall.length).toEqual(0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const usersSecondCall = messagePoolService.getUsersAwaitng();
    expect(usersSecondCall.length).toEqual(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const usersThirdCall = messagePoolService.getUsersAwaitng();
    expect(usersThirdCall.length).toEqual(0);
  });

  it('should send messages to users', async () => {
    const spy = jest.spyOn(
      (messagePoolService as any).messageService,
      'answerUser',
    );
    await messagePoolService.delayAnswer('1', 0);
    await messagePoolService.delayAnswer('test', 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should interrupt sending after new message', async () => {
    const spy = jest.spyOn(
      (messagePoolService as any).messageService,
      'answerUser',
    );
    await messagePoolService.delayAnswer('1', 0);
    await messagePoolService.delayAnswer('1', 0);
    await messagePoolService.delayAnswer('1', 0);
    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
