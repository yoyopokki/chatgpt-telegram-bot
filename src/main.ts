import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TelegramBotService } from './telegram-bot';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const telegramBotService = app.get(TelegramBotService);
  await telegramBotService.start();

  await app.listen(3000);
}
bootstrap();
