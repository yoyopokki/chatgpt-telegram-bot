import {EntityManager, EntityRepository, Repository} from 'typeorm';
import { Message } from './message.entity';
import { User } from "../user/user.entity";

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
    constructor(private readonly entityManager: EntityManager) {
        super(Message, entityManager);
    }

    async findMessagesByUser(chatId: string): Promise<Message[]> {
        return this.find({ where: { chatId } });
    }

    async createMessage(message: Message): Promise<Message> {
        return this.save(message);
    }

    async deleteMessagesByUser(user: User) {
        return this.delete({ user });
    }
}
