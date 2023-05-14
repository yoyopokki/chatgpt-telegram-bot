import { EntityManager, EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  constructor(private readonly entityManager: EntityManager) {
    super(User, entityManager);
  }
}
