import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { UserRepository } from '../user/user.repository';
import { MessageModule } from '../message';

@Module({
  imports: [OpenaiModule, MessageModule],
  providers: [TelegramBotService, UserRepository],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
