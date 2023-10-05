import { Inject, Service } from 'typedi';
import { MessageService } from 'src/services/MessageService/MessageService';

type UserID = string;
type SendDate = number;

// transient: true - is for avoiding memory leaks
@Service({ transient: true })
export class MessagePoolService {
  @Inject()
  private readonly messageService: MessageService;

  // K the Node interval function
  // *I would use fully-featured queue like Bull, but since it's just a test task, I rely only on memory
  private sendingTimer: NodeJS.Timer;

  // Used to abort OpenAI response when a new message comes from the user while AI generating an answer
  private usersProcessing: UserID[];

  // Time map, used to delay answer for user
  // *I would use Redis but since it's just a test task, I rely only on memory.
  private usersAwaiting: Record<UserID, SendDate>;

  constructor() {
    this.usersProcessing = [];
    this.usersAwaiting = {};
    this.startUserPooling();
  }

  delayAnswer(userId: string, timeout: number): void {
    // Delay answer for user
    this.usersAwaiting[userId] = new Date().getTime() + timeout;

    // Prevent double answering while response is generating by AI
    this.usersProcessing = this.usersProcessing.filter(id => id !== userId);
  }

  getUsersAwaitng(): UserID[] {
    return Object.entries(this.usersAwaiting)
      .filter(([, timestamp]) => +new Date() >= +new Date(timestamp))
      .map(([userId]) => userId);
  }

  private startUserPooling(): void {
    this.sendingTimer = setInterval(() => {
      const handle = async userId => {
        delete this.usersAwaiting[userId];
        this.usersProcessing.push(userId);
        const answer = await this.messageService.answerUser(userId);
        if (this.usersProcessing.includes(userId)) {
          this.usersProcessing = this.usersProcessing.filter(
            id => id !== userId,
          );

          // HERE IS A PLACE WHERE WE SEND RESPONSE TO CHAT-SERVICE BACK
          console.log(answer);
        }
      };

      const userIds = this.getUsersAwaitng();
      userIds.forEach(handle);
    }, 1000);
  }
}
