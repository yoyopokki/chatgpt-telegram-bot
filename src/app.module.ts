import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Message } from './message/message.entity';
import { UserRepository } from './user/user.repository';
import { MessageRepository } from './message/message.repository';
import { TelegramBotModule } from './telegram-bot';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'postgres',
      entities: [User, Message],
      synchronize: true,
    }),
    TelegramBotModule,
  ],
})
export class AppModule {}
