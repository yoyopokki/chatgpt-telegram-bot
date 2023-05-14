import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup } from 'telegraf';
import { OpenaiService } from '../openai';
import { User, UserService } from '../user';
import { MessageService } from '../message';

@Injectable()
export class TelegramBotService {
  private readonly bot: Telegraf<Context>;
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly mainMenuKeyboard = Markup.keyboard([
    ['🤖 Справка', '✏️ Генерировать текст'],
    ['🗑️ Удалить контекст'],
  ]).resize();

  constructor(
    private readonly openaiService: OpenaiService,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.registerHandlers();
  }

  async start(): Promise<void> {
    await this.bot.launch({
      dropPendingUpdates: true,
    });

    this.logger.log('Бот запущен');
  }

  private registerHandlers(): void {
    this.bot.start(this.handleStartCommand.bind(this));
    this.bot.help(this.handleHelpCommand.bind(this));

    this.bot.command('generate', this.handleGenerateCommand.bind(this));
    this.bot.command('deletecontext', this.handleDeleteContext.bind(this));

    this.bot.hears('🤖 Справка', this.handleHelpCommand.bind(this));
    this.bot.hears(
      '✏️ Генерировать текст',
      this.handleGenerateCommand.bind(this),
    );
    this.bot.hears('🗑️ Удалить контекст', this.handleDeleteContext.bind(this));
  }

  private async handleStartCommand(ctx: Context): Promise<void> {
    await ctx.reply('Выберите действие:', this.mainMenuKeyboard);
  }

  private async handleHelpCommand(ctx: Context): Promise<void> {
    await ctx.reply(
      `Привет, я бот, который поможет тебе пользоваться ChatGPT 3.5 и в х*й не дуть`,
    );
  }

  private async handleGenerateCommand(ctx: Context): Promise<void> {
    await ctx.reply('Введите текст для генерации:');

    this.bot.on('text', async (ctx: Context) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const textPrompt = ctx.message.text;

      Logger.log(ctx.message);

      if (!textPrompt) {
        await ctx.reply('Вы ничего не ввели');
        return;
      }

      let currentUser = await this.userService.findByTelegramId(
        ctx.from.username,
      );
      if (!currentUser) {
        const newUser = new User();
        newUser.telegramId = ctx.from.username;
        currentUser = await this.userService.createOrUpdate(newUser);
      }

      try {
        const generatedText = await this.openaiService.completePrompt(
          currentUser,
          ctx.from.username,
          textPrompt,
        );
        await ctx.reply(generatedText);
      } catch (error) {
        this.logger.error(error);
        await ctx.reply('Ошибка генерации текста');
      }

      // Выводим главное меню
      await ctx.reply('Выберите действие:', this.mainMenuKeyboard);
    });
  }

  private async handleDeleteContext(ctx: Context): Promise<void> {
    const currentUser = await this.userService.findByTelegramId(
      ctx.from.username,
    );
    if (currentUser) {
      await this.messageService.deleteMessagesByUser(currentUser);
    }

    await ctx.reply('Контекст удален');
  }
}
