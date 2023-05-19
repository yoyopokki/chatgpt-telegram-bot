import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../message';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramId: string;

  @Column('integer', { default: 0 })
  telegramChatId: number;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
