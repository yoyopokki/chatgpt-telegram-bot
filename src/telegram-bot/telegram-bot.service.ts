import { Injectable, Logger } from '@nestjs/common';
import { Context, Telegraf, Markup, session, Scenes } from 'telegraf';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { OpenaiService } from '../openai';
import { User, UserService } from '../user';
import { MessageService } from '../message';
import {
  BOT_START_MESSAGE,
  BOT_UPDATE_MESSAGE,
  CHANGE_ACTION_MESSAGE,
  CHAT_GPT_ERROR_MESSAGE,
  CONVERSATION_MENU_KEYBOARD,
  DELETE_CONTEXT_BUTTON,
  DELETE_CONTEXT_MESSAGE,
  EMPTY_TEXT_MESSAGE,
  EXIT_CONVERSATION_BUTTON,
  HELP_BUTTON,
  MAIN_MENU_KEYBOARD,
  START_CONVERSATION_BUTTON,
  START_CONVERSATION_MESSAGE,
  WELCOME_MESSAGE,
} from './telegram-bot.constants';

@Injectable()
export class TelegramBotService {
  private readonly bot: Telegraf<Context>;
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly redis: Redis;

  private readonly mainMenuKeyboard =
    Markup.keyboard(MAIN_MENU_KEYBOARD).resize();
  private readonly conversationMenuKeyboard = Markup.keyboard(
    CONVERSATION_MENU_KEYBOARD,
  ).resize();

  private readonly conversationScene = new Scenes.BaseScene('conversation');

  constructor(
    private readonly openaiService: OpenaiService,
    private userService: UserService,
    private messageService: MessageService,
    private redisService: RedisService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.bot.use(session());

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stage = new Scenes.Stage([this.conversationScene]);
    this.bot.use(stage.middleware());

    this.redis = this.redisService.getClient();

    this.registerHandlers();
  }

  async start(): Promise<void> {
    await this.update();

    await this.bot.launch({
      dropPendingUpdates: true,
    });

    this.logger.log(BOT_START_MESSAGE);
  }

  async update(): Promise<void> {
    const users = await this.userService.findAll();
    for (const user of users) {
      await this.updateByUser(user.telegramId, user.telegramChatId);
    }
  }

  private async updateByUser(
    telegramId: string,
    telegramChatId: number,
  ): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(
        telegramChatId,
        BOT_UPDATE_MESSAGE,
        this.mainMenuKeyboard,
      );
    } catch (error) {
      this.logger.error(
        `Не удалось уведомить об обновлении пользователя ${telegramId}: ${error}`,
      );
    }
  }

  private registerHandlers(): void {
    this.bot.start(this.handleStartCommand.bind(this));
    this.bot.help(this.handleHelpCommand.bind(this));

    this.bot.command('generate', this.handleGenerateCommand.bind(this));
    this.bot.command('deletecontext', this.handleDeleteContext.bind(this));

    this.bot.hears(
      START_CONVERSATION_BUTTON,
      this.handleEnterConversation.bind(this),
    );
    this.bot.hears(HELP_BUTTON, this.handleHelpCommand.bind(this));

    this.bot.on('message', this.handleCheckInvalidChatId.bind(this));

    this.conversationScene.command('start', this.handleStartCommand.bind(this));
    this.conversationScene.hears(
      EXIT_CONVERSATION_BUTTON,
      this.handleExitConversation.bind(this),
    );
    this.conversationScene.hears(
      DELETE_CONTEXT_BUTTON,
      this.handleDeleteContext.bind(this),
    );
    this.conversationScene.on('text', this.handleGenerateCommand.bind(this));
  }

  private async showMainMenu(ctx: Context): Promise<void> {
    await ctx.reply(CHANGE_ACTION_MESSAGE, this.mainMenuKeyboard);
  }

  private async showConversationMenu(ctx: Context): Promise<void> {
    await ctx.reply(START_CONVERSATION_MESSAGE, this.conversationMenuKeyboard);
  }

  private async createUser(ctx: Context): Promise<User> {
    const userRedisKey = `user:${ctx.from.username}`;

    const newUser = new User();
    newUser.telegramId = ctx.from.username;
    newUser.telegramChatId = ctx.message.chat.id;

    const savedUser = await this.userService.createUser(newUser);
    await this.redis.set(userRedisKey, JSON.stringify(savedUser));

    return savedUser;
  }

  private async updateUserTelegramInfo(ctx: Context): Promise<void> {
    const userRedisKey = `user:${ctx.from.username}`;

    const user = await this.userService.updateTelegramInfo(
      ctx.from.username,
      ctx.message.chat.id,
    );

    this.logger.log(user.raw);

    await this.redis.del([userRedisKey]);
    await this.redis.set(userRedisKey, JSON.stringify(user.raw));
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
    const userRedisKey = `user:${ctx.from.username}`;

    const userField = await this.redis.get(userRedisKey);
    if (userField) {
      await this.updateUserTelegramInfo(ctx);
    } else {
      await this.createUser(ctx);
    }

    await this.showMainMenu(ctx);
  }

  private async handleHelpCommand(ctx: Context): Promise<void> {
    await ctx.reply(WELCOME_MESSAGE);
  }

  private async handleGenerateCommand(ctx: Context): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const textPrompt = ctx.message.text;

    if (!textPrompt) {
      await ctx.reply(EMPTY_TEXT_MESSAGE);
      return;
    }

    await ctx.sendChatAction('typing');

    const userRedisKey = `user:${ctx.from.username}`;
    const currentUserField = await this.redis.get(userRedisKey);
    const currentUser = currentUserField
      ? JSON.parse(currentUserField)
      : await this.userService.findByTelegramId(ctx.from.username);

    try {
      const generatedText = await this.openaiService.completePrompt(
        currentUser,
        ctx.from.username,
        textPrompt,
      );
      await ctx.reply(generatedText);
    } catch (error) {
      this.logger.error(error);
      await ctx.reply(CHAT_GPT_ERROR_MESSAGE);
    }
  }

  private async handleDeleteContext(ctx: Context): Promise<void> {
    const userRedisKey = `user:${ctx.from.username}`;
    const userField = await this.redis.get(userRedisKey);

    const currentUser = userField ? JSON.parse(userField) : null;
    if (currentUser) {
      await this.messageService.deleteMessagesByUser(currentUser);
    }

    await ctx.reply(DELETE_CONTEXT_MESSAGE);
  }

  private async handleCheckInvalidChatId(ctx: Context): Promise<void> {
    const userRedisKey = `user:${ctx.from.username}`;
    const userField = await this.redis.get(userRedisKey);

    const currentUser = userField ? JSON.parse(userField) : null;
    if (currentUser && !currentUser.telegramChatId) {
      await this.updateUserTelegramInfo(ctx);
      await this.updateByUser(ctx.from.username, ctx.message.chat.id);
    }
  }
}
