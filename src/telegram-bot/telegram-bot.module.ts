import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotController } from './telegram-bot.controller';
import { MessageModule } from '../message';
import { UserModule } from '../user';

@Module({
  imports: [OpenaiModule, MessageModule, UserModule],
  providers: [TelegramBotService],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
