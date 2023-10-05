import { Column } from 'typeorm';
import { IsIn, IsString, Length } from 'class-validator';

export class CreateMessageDTO {
  @IsString()
  @Length(1, 256)
  id: string;

  @IsString()
  @IsIn(['server', 'client'], {
    message: 'Invalid value for "side" field. Must be "server" or "client".',
  })
  side: 'client' | 'server';

  @Column()
  message: string;

  @Column()
  userId: string;
}
