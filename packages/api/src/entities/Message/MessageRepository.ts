import {
  createQueryBuilder,
  EntityRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Message } from 'src/entities/Message/Message';

class MessageScopes extends SelectQueryBuilder<Message> {}

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  createScopedQueryBuilder(alias = 'message'): MessageScopes {
    return new MessageScopes(createQueryBuilder(Message, alias));
  }
}
