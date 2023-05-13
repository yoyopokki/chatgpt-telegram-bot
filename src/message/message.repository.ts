import {EntityManager, EntityRepository, Repository} from 'typeorm';
import { Message } from './message.entity';
import { User } from "../user/user.entity";

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
    constructor(private readonly entityManager: EntityManager) {
        super(Message, entityManager);
    }

    async findMessagesByChatId(chatId: string): Promise<Message[]> {
        return this.find({ where: { chatId } });
    }

    async findMessagesByUserAndChatId(user: User, chatId: string): Promise<Message[]> {
        return this.find({ where: { user, chatId } });
    }

    async createMessage(message: Message): Promise<Message> {
        return this.save(message);
    }

    async updateMessage(message: Message): Promise<Message> {
        return this.save(message);
    }
}