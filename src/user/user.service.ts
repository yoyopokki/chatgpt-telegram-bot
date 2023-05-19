import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async findByTelegramId(telegramId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { telegramId } });
  }

  async createUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async updateTelegramInfo(
    telegramId: string,
    telegramChatId?: number,
  ): Promise<User> {
    await this.userRepository.update(
      { telegramId },
      {
        telegramChatId,
      },
    );

    return this.findByTelegramId(telegramId);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
