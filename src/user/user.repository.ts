import { EntityManager, EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  constructor(private readonly entityManager: EntityManager) {
    super(User, entityManager);
  }

  async findById(id: number): Promise<User | undefined> {
    return this.findById(id);
  }

  async findByTelegramId(telegramId: string): Promise<User | undefined> {
    return this.findOne({ where: { telegramId } });
  }

  async createOrUpdate(user: User): Promise<User> {
    return this.save(user);
  }
}
