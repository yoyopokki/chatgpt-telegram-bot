import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageRepository } from './message.repository';
import { User } from '../user';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageRepository)
    private readonly messageRepository: MessageRepository,
  ) {}

  async findMessagesByUser(chatId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }

  async createMessage(message: Message): Promise<Message> {
    return this.messageRepository.save(message);
  }

  async deleteMessagesByUser(user: User) {
    return this.messageRepository.delete({ user });
  }
}
