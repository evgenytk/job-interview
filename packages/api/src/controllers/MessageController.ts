import { Body, JsonController, Post } from 'routing-controllers';
import { Inject } from 'typedi';
import { MessageService } from 'src/services/MessageService/MessageService';
import { CreateMessageDTO } from 'src/services/MessageService/DTO/CreateMessageDTO';
import { MessagePoolService } from 'src/services/MessageService/MessagePoolService';

@JsonController('/message')
export class MessageController {
  @Inject()
  private readonly messageService: MessageService;

  @Inject()
  private readonly messagePoolService: MessagePoolService;

  @Post('/send')
  async createMessage(@Body() body: CreateMessageDTO): Promise<string> {
    await this.messageService.createMessage(body);
    await this.messagePoolService.delayAnswer(body.userId, 40000);
    return 'OK';
  }
}
