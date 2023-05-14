import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup, session, Scenes } from 'telegraf';
import { OpenaiService } from '../openai';
import { User, UserService } from '../user';
import { MessageService } from '../message';

@Injectable()
export class TelegramBotService {
  private readonly bot: Telegraf<Context>;
  private readonly logger = new Logger(TelegramBotService.name);

  private readonly mainMenuKeyboard = Markup.keyboard([
    ['✏️ Начать общение', '🤖 Справка'],
  ]).resize();
  private readonly conversationMenuKeyboard = Markup.keyboard([
    ['🚪 Выйти из режима общения'],
    ['🗑️ Удалить контекст'],
  ]).resize();

  private readonly conversationScene = new Scenes.BaseScene('conversation');

  constructor(
    private readonly openaiService: OpenaiService,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.bot.use(session());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stage = new Scenes.Stage([this.conversationScene]);
    this.bot.use(stage.middleware());

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

    this.bot.hears(
      '✏️ Начать общение',
      this.handleEnterConversation.bind(this),
    );
    this.bot.hears('🤖 Справка', this.handleHelpCommand.bind(this));

    this.conversationScene.hears(
      '🚪 Выйти из режима общения',
      this.handleExitConversation.bind(this),
    );
    this.conversationScene.hears(
      '🗑️ Удалить контекст',
      this.handleDeleteContext.bind(this),
    );
    this.conversationScene.on('text', this.handleGenerateCommand.bind(this));
  }

  private async showMainMenu(ctx: Context): Promise<void> {
    await ctx.reply('Выберите действие:', this.mainMenuKeyboard);
  }

  private async showConversationMenu(ctx: Context): Promise<void> {
    await ctx.reply(
      'Вы в режиме общения с ботом, еб.... кхм кхм общайтесь',
      this.conversationMenuKeyboard,
    );
  }

  private async handleEnterConversation(ctx: Context): Promise<void> {
    await this.showConversationMenu(ctx);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await ctx.scene.enter('conversation');
  }

  private async handleExitConversation(ctx: Context): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await ctx.scene.leave('conversation');

    await this.showMainMenu(ctx);
  }

  private async handleStartCommand(ctx: Context): Promise<void> {
    await this.showMainMenu(ctx);
  }

  private async handleHelpCommand(ctx: Context): Promise<void> {
    await ctx.reply(
      `Привет, я бот, который поможет тебе пользоваться ChatGPT 3.5 и в х*й не дуть`,
    );
  }

  private async handleGenerateCommand(ctx: Context): Promise<void> {
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
