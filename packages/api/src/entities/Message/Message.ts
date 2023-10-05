import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  side: 'client' | 'server';

  @Column()
  message: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
