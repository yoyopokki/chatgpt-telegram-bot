import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotController } from './telegram-bot/telegram-bot.controller';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';
import { OpenaiService } from './openai/openai.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TelegramBotController],
  providers: [TelegramBotService, OpenaiService],
})
export class AppModule {}
