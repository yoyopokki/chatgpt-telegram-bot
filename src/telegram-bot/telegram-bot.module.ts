import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { UserRepository } from '../user/user.repository';
import { MessageRepository } from '../message/message.repository';

@Module({
  imports: [OpenaiModule],
  providers: [TelegramBotService, UserRepository, MessageRepository],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
