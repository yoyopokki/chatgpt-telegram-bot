import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotController } from './telegram-bot/telegram-bot.controller';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';
import { OpenaiService } from './openai/openai.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Message } from './message/message.entity';
import { UserRepository } from './user/user.repository';
import { MessageRepository } from './message/message.repository';

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
  ],
  controllers: [TelegramBotController],
  providers: [
    UserRepository,
    MessageRepository,
    TelegramBotService,
    OpenaiService,
  ],
})
export class AppModule {}
